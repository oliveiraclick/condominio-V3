import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';
import { EmployeeProfile, EMPLOYEE_STATUS, EMPLOYEE_MODULES } from '../types/employee';
import { DSButton } from '../components/design-system/Button';
import { DSInput } from '../components/design-system/Input';
import { Title, Text } from '../components/design-system/Typography';
import { colors, spacing, radius } from '../components/design-system/tokens';
import { EmployeeFormModal } from '../components/employees/EmployeeFormModal';

interface AdminEmployeesProps {
    currentUser: any;
}

export const AdminEmployees: React.FC<AdminEmployeesProps> = ({ currentUser }) => {
    const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);

    // Fetch employees
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .eq('role', 'employee')
                .order('name');

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setEmployees(data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            alert('Erro ao carregar funcionários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [statusFilter]);

    // Filter employees by search term
    const filteredEmployees = employees.filter((emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.function?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle delete
    const handleDelete = async (employee: EmployeeProfile) => {
        if (!confirm(`Tem certeza que deseja excluir ${employee.name}?`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', employee.id);

            if (error) throw error;

            alert('Funcionário excluído com sucesso');
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Erro ao excluir funcionário');
        }
    };

    // Count active permissions
    const countPermissions = (permissions: any) => {
        if (!permissions) return 0;
        return Object.values(permissions).filter(Boolean).length;
    };

    return (
        <div style={{ padding: spacing.xl }}>
            {/* Header */}
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                    <div>
                        <Title level={2}>Funcionários</Title>
                        <Text color="secondary">Gerenciar usuários internos do condomínio</Text>
                    </div>
                    <DSButton
                        onClick={() => {
                            setSelectedEmployee(null);
                            setFormModalOpen(true);
                        }}
                        leftIcon={<Plus size={20} />}
                    >
                        Novo Funcionário
                    </DSButton>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg }}>
                    <DSInput
                        placeholder="Buscar por nome, e-mail ou função..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search size={20} />}
                        style={{ flex: 1 }}
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        style={{
                            padding: `${spacing.sm} ${spacing.md}`,
                            borderRadius: radius.md,
                            border: `1px solid ${colors.neutral[300]}`,
                            fontSize: '14px',
                        }}
                    >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <Text>Carregando...</Text>
            ) : filteredEmployees.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: spacing.xl,
                    backgroundColor: colors.neutral[50],
                    borderRadius: radius.lg,
                }}>
                    <Text color="secondary">
                        {searchTerm ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário cadastrado'}
                    </Text>
                </div>
            ) : (
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: radius.lg,
                    border: `1px solid ${colors.neutral[200]}`,
                    overflow: 'hidden',
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: colors.neutral[50], borderBottom: `1px solid ${colors.neutral[200]}` }}>
                                <th style={{ padding: spacing.md, textAlign: 'left' }}>
                                    <Text weight="bold" size="sm">Nome</Text>
                                </th>
                                <th style={{ padding: spacing.md, textAlign: 'left' }}>
                                    <Text weight="bold" size="sm">Função</Text>
                                </th>
                                <th style={{ padding: spacing.md, textAlign: 'left' }}>
                                    <Text weight="bold" size="sm">E-mail</Text>
                                </th>
                                <th style={{ padding: spacing.md, textAlign: 'center' }}>
                                    <Text weight="bold" size="sm">Permissões</Text>
                                </th>
                                <th style={{ padding: spacing.md, textAlign: 'center' }}>
                                    <Text weight="bold" size="sm">Status</Text>
                                </th>
                                <th style={{ padding: spacing.md, textAlign: 'center' }}>
                                    <Text weight="bold" size="sm">Ações</Text>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id} style={{ borderBottom: `1px solid ${colors.neutral[100]}` }}>
                                    <td style={{ padding: spacing.md }}>
                                        <Text weight="bold">{employee.name}</Text>
                                    </td>
                                    <td style={{ padding: spacing.md }}>
                                        <Text color="secondary">{employee.function || '-'}</Text>
                                    </td>
                                    <td style={{ padding: spacing.md }}>
                                        <Text size="sm">{employee.email}</Text>
                                    </td>
                                    <td style={{ padding: spacing.md, textAlign: 'center' }}>
                                        <span style={{
                                            padding: `${spacing.xs} ${spacing.sm}`,
                                            backgroundColor: colors.brand[50],
                                            color: colors.brand[700],
                                            borderRadius: radius.sm,
                                            fontSize: '12px',
                                            fontWeight: 600,
                                        }}>
                                            {countPermissions(employee.permissions)} módulos
                                        </span>
                                    </td>
                                    <td style={{ padding: spacing.md, textAlign: 'center' }}>
                                        <span style={{
                                            padding: `${spacing.xs} ${spacing.sm}`,
                                            backgroundColor: employee.status === 'active' ? '#dcfce7' : colors.neutral[100],
                                            color: employee.status === 'active' ? '#166534' : colors.neutral[600],
                                            borderRadius: radius.sm,
                                            fontSize: '12px',
                                            fontWeight: 600,
                                        }}>
                                            {EMPLOYEE_STATUS[employee.status]}
                                        </span>
                                    </td>
                                    <td style={{ padding: spacing.md }}>
                                        <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'center' }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedEmployee(employee);
                                                    setFormModalOpen(true);
                                                }}
                                                style={{
                                                    padding: spacing.sm,
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: colors.brand[600],
                                                }}
                                                title="Editar"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(employee)}
                                                style={{
                                                    padding: spacing.sm,
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: colors.error[600],
                                                }}
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Form Modal */}
            <EmployeeFormModal
                open={formModalOpen}
                onClose={() => {
                    setFormModalOpen(false);
                    setSelectedEmployee(null);
                }}
                employee={selectedEmployee}
                onSuccess={() => {
                    fetchEmployees();
                    setFormModalOpen(false);
                    setSelectedEmployee(null);
                }}
            />
        </div>
    );
};
