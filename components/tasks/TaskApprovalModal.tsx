import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '../../supabase';
import { Task } from '../../types/tasks';
import { Sheet } from '../design-system/Sheet';
import { DSButton } from '../design-system/Button';
import { Title, Text } from '../design-system/Typography';
import { colors, radius, spacing } from '../design-system/tokens';
import { packagesCache } from '../../cache/packagesCache';

interface TaskApprovalModalProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    currentUser: any;
    onSuccess: () => void;
}

export const TaskApprovalModal: React.FC<TaskApprovalModalProps> = ({
    open,
    onClose,
    task,
    currentUser,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);

    const handleApprove = async () => {
        if (!task) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    approved_at: new Date().toISOString(),
                    approved_by: currentUser.id,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', task.id);

            if (error) throw error;

            packagesCache.invalidate('tasks:all');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error approving task:', error);
            alert('Erro ao aprovar tarefa');
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
                        <Title level={3}>Aprovar Tarefa</Title>
                        <Text color="secondary">Validar conclusão sem alterar fluxo</Text>
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

            {/* Task Summary */}
            <div style={{
                backgroundColor: colors.neutral[50],
                padding: spacing.lg,
                borderRadius: radius.md,
                marginBottom: spacing.lg
            }}>
                <div style={{ marginBottom: spacing.md }}>
                    <Text color="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                        TAREFA
                    </Text>
                    <Text weight="bold" style={{ fontSize: '18px' }}>
                        {task.title}
                    </Text>
                </div>

                {task.description && (
                    <div style={{ marginBottom: spacing.md }}>
                        <Text color="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                            DESCRIÇÃO
                        </Text>
                        <Text size="sm">{task.description}</Text>
                    </div>
                )}

                {task.location && (
                    <div style={{ marginBottom: spacing.md }}>
                        <Text color="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                            LOCAL
                        </Text>
                        <Text size="sm">{task.location}</Text>
                    </div>
                )}

                {task.solution_description && (
                    <div style={{
                        marginTop: spacing.md,
                        paddingTop: spacing.md,
                        borderTop: `1px solid ${colors.neutral[200]}`
                    }}>
                        <Text color="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                            SOLUÇÃO APLICADA
                        </Text>
                        <Text size="sm" weight="bold">
                            {task.solution_description}
                        </Text>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div style={{
                backgroundColor: colors.success + '20',
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.xl,
                border: `1px solid ${colors.success}`
            }}>
                <Text size="sm" weight="bold" style={{ marginBottom: spacing.xs }}>
                    Ao aprovar:
                </Text>
                <Text size="sm">
                    • approved_at será preenchido<br />
                    • approved_by será preenchido<br />
                    • Status permanece "finished"
                </Text>
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
                    onClick={handleApprove}
                    icon={<Check size={20} />}
                    iconPosition="right"
                    loading={loading}
                    style={{ flex: 1 }}
                >
                    Aprovar Tarefa
                </DSButton>
            </div>
        </Sheet>
    );
};
