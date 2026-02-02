import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabase';
import { Task } from '../../types/tasks';
import { Sheet } from '../design-system/Sheet';
import { DSButton } from '../design-system/Button';
import { DSInput } from '../design-system/Input';
import { Title, Text } from '../design-system/Typography';
import { colors, radius, spacing } from '../design-system/tokens';
import { packagesCache } from '../../cache/packagesCache';

interface ProblemReportModalProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onSuccess: () => void;
}

const PROBLEM_REASONS = [
    { value: 'falta_material', label: 'Falta de material' },
    { value: 'acesso_indisponivel', label: 'Acesso indisponível' },
    { value: 'condicoes_externas', label: 'Condições externas' },
    { value: 'outro', label: 'Outro' },
];

export const ProblemReportModal: React.FC<ProblemReportModalProps> = ({
    open,
    onClose,
    task,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [problemReason, setProblemReason] = useState(() => {
        if (typeof window !== 'undefined' && task) {
            const saved = localStorage.getItem(`problem_report_reason_${task.id}`);
            return saved || '';
        }
        return '';
    });
    const [observation, setObservation] = useState(() => {
        if (typeof window !== 'undefined' && task) {
            const saved = localStorage.getItem(`problem_report_obs_${task.id}`);
            return saved || '';
        }
        return '';
    });

    // Auto-save
    useEffect(() => {
        if (task && open) {
            if (problemReason) localStorage.setItem(`problem_report_reason_${task.id}`, problemReason);
            if (observation) localStorage.setItem(`problem_report_obs_${task.id}`, observation);
        }
    }, [problemReason, observation, task, open]);

    const handleReportProblem = async () => {
        if (!task) return;

        if (!problemReason) {
            alert('Selecione o motivo do problema');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    status: 'evaluating',
                    problem_reported: true,
                    problem_reason: problemReason,
                    problem_observation: observation.trim() || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', task.id);

            if (error) throw error;

            // Limpa rascunhos salvos
            if (task) {
                localStorage.removeItem(`problem_report_reason_${task.id}`);
                localStorage.removeItem(`problem_report_obs_${task.id}`);
            }

            packagesCache.invalidate('tasks:all');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error reporting problem:', error);
            alert('Erro ao reportar problema');
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
                        <Title level={3}>Reportar Problema</Title>
                        <Text color="secondary">Retornar a tarefa para avaliação</Text>
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

            {/* Problem Reason Selection */}
            <div style={{ marginBottom: spacing.lg }}>
                <Text weight="bold" style={{ marginBottom: spacing.sm }}>
                    Motivo do problema *
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                    {PROBLEM_REASONS.map((reason) => (
                        <label
                            key={reason.value}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: spacing.md,
                                borderRadius: radius.md,
                                border: `2px solid ${problemReason === reason.value ? colors.brand[500] : colors.neutral[200]}`,
                                backgroundColor: problemReason === reason.value ? colors.brand[50] : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <input
                                type="radio"
                                name="problemReason"
                                value={reason.value}
                                checked={problemReason === reason.value}
                                onChange={(e) => setProblemReason(e.target.value)}
                                style={{ marginRight: spacing.sm }}
                            />
                            <Text weight={problemReason === reason.value ? 'bold' : 'normal'}>
                                {reason.label}
                            </Text>
                        </label>
                    ))}
                </div>
            </div>

            {/* Observation Field */}
            <div style={{ marginBottom: spacing.lg }}>
                <DSInput
                    label="Observação (Opcional)"
                    placeholder="Adicione detalhes sobre o problema..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    multiline
                    rows={4}
                />
            </div>

            {/* Info Box */}
            <div style={{
                backgroundColor: '#fef3c7',
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.lg,
                border: `1px solid #fbbf24`
            }}>
                <Text size="sm" weight="bold" style={{ marginBottom: spacing.xs }}>
                    Ao confirmar:
                </Text>
                <Text size="sm">
                    • Status → Em Avaliação<br />
                    • Problema reportado = Sim<br />
                    • Motivo registrado para análise
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
                    onClick={handleReportProblem}
                    icon={<AlertTriangle size={20} />}
                    iconPosition="right"
                    loading={loading}
                    disabled={!problemReason}
                    style={{ flex: 1 }}
                >
                    Reportar Problema
                </DSButton>
            </div>
        </Sheet>
    );
};
