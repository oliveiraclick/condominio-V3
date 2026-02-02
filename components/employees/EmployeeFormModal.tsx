import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../supabase';
import { EmployeeProfile, EMPLOYEE_MODULES, EmployeeModule, EmployeePermissions } from '../../types/employee';
import { Sheet } from '../design-system/Sheet';
import { DSButton } from '../design-system/Button';
import { DSInput } from '../design-system/Input';
import { Title, Text } from '../design-system/Typography';
import { colors, spacing, radius } from '../design-system/tokens';

interface EmployeeFormModalProps {
    open: boolean;
    onClose: () => void;
    employee: EmployeeProfile | null;
    onSuccess: () => void;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
    open,
    onClose,
    employee,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [functionRole, setFunctionRole] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [permissions, setPermissions] = useState<EmployeePermissions>({});

    // Load employee data when editing
    useEffect(() => {
        if (employee) {
            setName(employee.name || '');
            setEmail(employee.email || '');
            setPhone(employee.phone || '');
            setFunctionRole(employee.function || '');
            setStatus(employee.status);
            setPermissions(employee.permissions || {});
        } else {
            // Reset form
            setName('');
            setEmail('');
            setPhone('');
            setFunctionRole('');
            setStatus('active');
            setPermissions({});
        }
    }, [employee, open]);

    const handleTogglePermission = (module: EmployeeModule) => {
        setPermissions((prev) => ({
            ...prev,
            [module]: !prev[module],
        }));
    };

    const handleSubmit = async () => {
        if (!name.trim() || !email.trim()) {
            alert('Nome e e-mail são obrigatórios');
            return;
        }

        setLoading(true);
        try {
            if (employee) {
                // Update existing employee
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        name: name.trim(),
                        email: email.trim(),
                        phone: phone.trim() || null,
                        function: functionRole.trim() || null,
                        status,
                        permissions,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', employee.id);

                if (error) throw error;
                alert('Funcionário atualizado com sucesso');
            } else {
                // Create new employee
                // First, create auth user
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: email.trim(),
                    email_confirm: true,
                    user_metadata: {
                        name: name.trim(),
                        role: 'employee',
                    },
                });

                if (authError) throw authError;

                // Then update profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        name: name.trim(),
                        phone: phone.trim() || null,
                        function: functionRole.trim() || null,
                        role: 'employee',
                        status,
                        permissions,
                    })
                    .eq('id', authData.user.id);

                if (profileError) throw profileError;
                alert('Funcionário criado com sucesso');
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error saving employee:', error);
            alert(error.message || 'Erro ao salvar funcionário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onClose={onClose}>
            {/* Header */}
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={3}>
                            {employee ? 'Editar Funcionário' : 'Novo Funcionário'}
                        </Title>
                        <Text color="secondary">
                            {employee ? 'Atualizar dados e permissões' : 'Cadastrar novo usuário interno'}
                        </Text>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: spacing.sm,
                        }}
                    >
                        <X size={24} color={colors.neutral[600]} />
                    </button>
                </div>
            </div>

            {/* Form */}
            <div style={{ marginBottom: spacing.xl }}>
                <Title level={4} style={{ marginBottom: spacing.md }}>Dados Básicos</Title>

                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    <DSInput
                        label="Nome completo *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: João Silva"
                        required
                    />

                    <DSInput
                        label="E-mail (login) *"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="joao@example.com"
                        required
                        disabled={!!employee} // Can't change email after creation
                    />

                    <DSInput
                        label="Telefone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 98765-4321"
                    />

                    <DSInput
                        label="Função / Cargo *"
                        value={functionRole}
                        onChange={(e) => setFunctionRole(e.target.value)}
                        placeholder="Ex: Porteiro, Zelador, Assistente"
                        required
                    />

                    <div>
                        <Text weight="bold" style={{ marginBottom: spacing.sm }}>Status</Text>
                        <div style={{ display: 'flex', gap: spacing.md }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    checked={status === 'active'}
                                    onChange={() => setStatus('active')}
                                />
                                <Text>Ativo</Text>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    checked={status === 'inactive'}
                                    onChange={() => setStatus('inactive')}
                                />
                                <Text>Inativo</Text>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permissions */}
            <div style={{ marginBottom: spacing.xl }}>
                <Title level={4} style={{ marginBottom: spacing.sm }}>Permissões de Acesso</Title>
                <Text color="secondary" size="sm" style={{ marginBottom: spacing.md }}>
                    Selecione os módulos que o funcionário poderá acessar
                </Text>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: spacing.sm,
                }}>
                    {Object.values(EMPLOYEE_MODULES).map((module) => (
                        <label
                            key={module.key}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: spacing.sm,
                                padding: spacing.md,
                                backgroundColor: permissions[module.key as EmployeeModule]
                                    ? colors.brand[50]
                                    : colors.neutral[50],
                                border: `2px solid ${permissions[module.key as EmployeeModule]
                                        ? colors.brand[500]
                                        : colors.neutral[200]
                                    }`,
                                borderRadius: radius.md,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={permissions[module.key as EmployeeModule] || false}
                                onChange={() => handleTogglePermission(module.key as EmployeeModule)}
                                style={{ marginTop: '2px' }}
                            />
                            <div>
                                <Text weight="bold" size="sm">{module.label}</Text>
                                <Text size="xs" color="secondary">{module.description}</Text>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: spacing.md, paddingTop: spacing.lg, borderTop: `1px solid ${colors.neutral[200]}` }}>
                <DSButton
                    variant="secondary"
                    onClick={onClose}
                    style={{ flex: 1 }}
                    disabled={loading}
                >
                    Cancelar
                </DSButton>
                <DSButton
                    onClick={handleSubmit}
                    icon={<Save size={20} />}
                    iconPosition="right"
                    loading={loading}
                    disabled={!name.trim() || !email.trim() || !functionRole.trim()}
                    style={{ flex: 1 }}
                >
                    {employee ? 'Salvar Alterações' : 'Criar Funcionário'}
                </DSButton>
            </div>
        </Sheet>
    );
};
