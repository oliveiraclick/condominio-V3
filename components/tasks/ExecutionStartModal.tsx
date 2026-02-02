import React, { useState } from 'react';
import { X, Play, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabase';
import { Task } from '../../types/tasks';
import { Sheet } from '../design-system/Sheet';
import { DSButton } from '../design-system/Button';
import { Title, Text } from '../design-system/Typography';
import { colors, radius, spacing } from '../design-system/tokens';
import { packagesCache } from '../../cache/packagesCache';

interface ExecutionStartModalProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onSuccess: () => void;
    currentUser: any;
}

export const ExecutionStartModal: React.FC<ExecutionStartModalProps> = ({
    open,
    onClose,
    task,
    onSuccess,
    currentUser,
}) => {
    const [loading, setLoading] = useState(false);

    const handleStartExecution = async () => {
        if (!task || !currentUser) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    status: 'executing',
                    assigned_to: currentUser.id, // Assign to self
                    started_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', task.id);

            if (error) throw error;

            packagesCache.invalidate('tasks:all');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error starting execution:', error);
            alert(`Erro ao iniciar execução: ${(error as any).message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    if (!task) return null;

    return (
        <Sheet open={open} onClose={onClose}>
            {/* Header */}
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={3}>Iniciar Execução</Title>
                        <Text color="secondary">Confirmar início do trabalho</Text>
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

            {/* Task Info */}
            <div style={{
                backgroundColor: colors.neutral[50],
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.lg
            }}>
                <Text weight="bold" style={{ marginBottom: spacing.xs }}>{task.title}</Text>
                {task.description && (
                    <Text size="sm" color="secondary">{task.description}</Text>
                )}
            </div>

            {/* Informative Text */}
            <div style={{
                backgroundColor: colors.brand[50],
                padding: spacing.lg,
                borderRadius: radius.md,
                marginBottom: spacing.xl,
                border: `1px solid ${colors.brand[200]}`
            }}>
                <div style={{ display: 'flex', gap: spacing.md, alignItems: 'flex-start' }}>
                    <Play size={24} color={colors.brand[600]} />
                    <div>
                        <Text weight="bold" style={{ marginBottom: spacing.xs }}>
                            Ao iniciar a execução:
                        </Text>
                        <Text size="sm">
                            A tarefa será considerada em andamento e você será responsável por sua conclusão.
                        </Text>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: spacing.md }}>
                <DSButton
                    variant="secondary"
                    onClick={onClose}
                    style={{ flex: 1 }}
                >
                    Cancelar
                </DSButton>
                <DSButton
                    onClick={handleStartExecution}
                    icon={<Play size={20} />}
                    iconPosition="right"
                    loading={loading}
                    style={{ flex: 1 }}
                >
                    Iniciar Execução
                </DSButton>
            </div>
        </Sheet>
    );
};
