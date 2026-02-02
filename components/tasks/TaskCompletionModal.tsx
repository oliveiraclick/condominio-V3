import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '../../supabase';
import { Task } from '../../types/tasks';
import { Sheet } from '../design-system/Sheet';
import { DSButton } from '../design-system/Button';
import { DSInput } from '../design-system/Input';
import { Title, Text } from '../design-system/Typography';
import { colors, radius, spacing } from '../design-system/tokens';
import { packagesCache } from '../../cache/packagesCache';

interface TaskCompletionModalProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onSuccess: () => void;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
    open,
    onClose,
    task,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [solutionDescription, setSolutionDescription] = useState(() => {
        // Carrega rascunho salvo se existir
        if (typeof window !== 'undefined' && task) {
            const saved = localStorage.getItem(`task_completion_${task.id}`);
            return saved || '';
        }
        return '';
    });

    // Auto-save: Salva automaticamente enquanto usuário digita
    useEffect(() => {
        if (task && solutionDescription && open) {
            localStorage.setItem(`task_completion_${task.id}`, solutionDescription);
        }
    }, [solutionDescription, task, open]);

    const handleCompleteTask = async () => {
        if (!task) return;

        if (!solutionDescription.trim()) {
            alert('Descreva o que foi feito para resolver a tarefa');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    status: 'finished',
                    finished_at: new Date().toISOString(),
                    solution_description: solutionDescription.trim(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', task.id);

            if (error) throw error;

            // Limpa o rascunho salvo após sucesso
            if (task) {
                localStorage.removeItem(`task_completion_${task.id}`);
            }

            packagesCache.invalidate('tasks:all');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error completing task:', error);
            alert('Erro ao concluir tarefa');
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
                        <Title level={3}>Concluir Tarefa</Title>
                        <Text color="secondary">Encerrar execução de forma clara e auditável</Text>
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

            {/* Solution Description Field */}
            <div style={{ marginBottom: spacing.lg }}>
                <DSInput
                    label="Descrição da solução *"
                    placeholder="Descreva o que foi feito"
                    value={solutionDescription}
                    onChange={(e) => setSolutionDescription(e.target.value)}
                    multiline
                    rows={6}
                    required
                />
            </div>

            {/* Approval Warning */}
            {task.requires_approval && (
                <div style={{
                    backgroundColor: '#fffbeb',
                    padding: spacing.md,
                    borderRadius: radius.md,
                    marginBottom: spacing.lg,
                    border: `1px solid #fbbf24`
                }}>
                    <Text weight="bold" style={{ marginBottom: spacing.xs }}>
                        ⚠️ Atenção
                    </Text>
                    <Text size="sm">
                        Esta tarefa exigirá aprovação da diretoria após a conclusão.
                    </Text>
                </div>
            )}

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
                    onClick={handleCompleteTask}
                    icon={<Check size={20} />}
                    iconPosition="right"
                    loading={loading}
                    disabled={!solutionDescription.trim()}
                    style={{ flex: 1 }}
                >
                    Concluir Tarefa
                </DSButton>
            </div>

            {/* Validation message */}
            {!solutionDescription.trim() && (
                <Text size="sm" color="secondary" style={{ textAlign: 'center', marginTop: spacing.sm }}>
                    Descreva a solução para continuar
                </Text>
            )}
        </Sheet>
    );
};
