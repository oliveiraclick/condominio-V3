import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { DSButton } from '../components/design-system/Button';
import { Title, Text } from '../components/design-system/Typography';
import { colors, spacing, radius } from '../components/design-system/tokens';

interface AccessDeniedProps {
    onBack?: () => void;
    message?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
    onBack,
    message = 'Você não tem permissão para acessar este módulo.'
}) => {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.neutral[50],
                padding: spacing.xl,
            }}
        >
            <div
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    backgroundColor: 'white',
                    borderRadius: radius.xl,
                    padding: spacing.xl,
                    textAlign: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
            >
                <div
                    style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: colors.danger + '20',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        marginBottom: spacing.lg,
                    }}
                >
                    <AlertTriangle size={40} color={colors.danger} />
                </div>

                <Title level={2} style={{ marginBottom: spacing.sm }}>
                    Acesso Negado
                </Title>

                <Text color="secondary" style={{ marginBottom: spacing.xl }}>
                    {message}
                </Text>

                <Text size="sm" color="secondary" style={{ marginBottom: spacing.xl }}>
                    Este módulo é restrito a administradores e funcionários internos.
                </Text>

                {onBack && (
                    <DSButton onClick={onBack} variant="secondary" style={{ width: '100%' }}>
                        Voltar
                    </DSButton>
                )}
            </div>
        </div>
    );
};
