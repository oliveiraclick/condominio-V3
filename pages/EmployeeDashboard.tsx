import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Title, Text } from '../components/design-system/Typography';
import { DSButton } from '../components/design-system/Button';
import { colors, spacing, radius } from '../components/design-system/tokens';
import { useEmployeePermissions } from '../components/hooks/useEmployeePermissions';

interface EmployeeDashboardProps {
    currentUser: any;
    onNavigate: (tab: string) => void;
    onLogout: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
    currentUser,
    onNavigate,
    onLogout,
}) => {
    const { allowedModules, permissions } = useEmployeePermissions(currentUser);

    const moduleCards = [
        { key: 'tasks', label: 'Tarefas', description: 'Gerenciar tarefas', color: colors.brand[500] },
        { key: 'packages', label: 'Encomendas', description: 'Portaria', color: '#10b981' },
        { key: 'communication', label: 'Avisos', description: 'Comunicação', color: '#f59e0b' },
        { key: 'approvals', label: 'Aprovações', description: 'Aprovar tarefas', color: '#8b5cf6' },
    ].filter(module => permissions[module.key as keyof typeof permissions]);

    return (
        <div style={{ padding: spacing.xl, paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={2}>Olá, {currentUser?.name?.split(' ')[0]}</Title>
                        <Text color="secondary">{currentUser?.function || 'Funcionário'}</Text>
                    </div>
                    <button
                        onClick={onLogout}
                        style={{
                            padding: spacing.md,
                            backgroundColor: colors.neutral[100],
                            border: 'none',
                            borderRadius: radius.md,
                            cursor: 'pointer',
                        }}
                    >
                        <LogOut size={20} color={colors.neutral[600]} />
                    </button>
                </div>
            </div>

            {/* Quick Access Cards */}
            {moduleCards.length > 0 ? (
                <div>
                    <Title level={4} style={{ marginBottom: spacing.md }}>Acesso Rápido</Title>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: spacing.md,
                    }}>
                        {moduleCards.map((module) => (
                            <button
                                key={module.key}
                                onClick={() => onNavigate(module.key)}
                                style={{
                                    padding: spacing.lg,
                                    backgroundColor: '#ffffff',
                                    border: `2px solid ${colors.neutral[200]}`,
                                    borderRadius: radius.lg,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = module.color;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = colors.neutral[200];
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: `${module.color}20`,
                                    borderRadius: radius.md,
                                    marginBottom: spacing.sm,
                                }} />
                                <Text weight="bold" style={{ marginBottom: spacing.xs }}>{module.label}</Text>
                                <Text size="sm" color="secondary">{module.description}</Text>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: spacing.xl,
                    backgroundColor: colors.neutral[50],
                    borderRadius: radius.lg,
                    textAlign: 'center',
                }}>
                    <Text color="secondary">
                        Você não tem permissões configuradas. Entre em contato com o administrador.
                    </Text>
                </div>
            )}

            {/* Profile Section */}
            <div style={{ marginTop: spacing.xl }}>
                <Title level={4} style={{ marginBottom: spacing.md }}>Meu Perfil</Title>
                <div style={{
                    padding: spacing.lg,
                    backgroundColor: '#ffffff',
                    border: `1px solid ${colors.neutral[200]}`,
                    borderRadius: radius.lg,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: colors.brand[100],
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <User size={30} color={colors.brand[600]} />
                        </div>
                        <div>
                            <Text weight="bold">{currentUser?.name}</Text>
                            <Text size="sm" color="secondary">{currentUser?.email}</Text>
                        </div>
                    </div>
                    <div style={{ paddingTop: spacing.md, borderTop: `1px solid ${colors.neutral[100]}` }}>
                        <Text size="sm" color="secondary">
                            <strong>Função:</strong> {currentUser?.function || 'Não definida'}
                        </Text>
                        <Text size="sm" color="secondary" style={{ marginTop: spacing.xs }}>
                            <strong>Módulos permitidos:</strong> {allowedModules.length}
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};
