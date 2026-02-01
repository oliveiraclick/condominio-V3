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

interface TaskExecutionFlowProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    currentUser: any;
    onSuccess: () => void;
    mode?: 'complete' | 'return';
}

export const TaskExecutionFlow: React.FC<TaskExecutionFlowProps> = ({
    open,
    onClose,
    task,
    currentUser,
    onSuccess,
    mode = 'complete'
}) => {
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [supervisors, setSupervisors] = useState<any[]>([]);
    const [selectedSupervisor, setSelectedSupervisor] = useState('');

    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setNotes('');
                setSelectedSupervisor('');
            }, 300);
        } else {
            if (mode === 'return') {
                const fetchSupervisors = async () => {
                    const { data } = await supabase
                        .from('profiles')
                        .select('id, name')
                        .in('role', ['admin', 'board']) // Assuming supervisors are admins/board
                        .order('name');
                    if (data) setSupervisors(data);
                };
                fetchSupervisors();
            }
        }
    }, [open, mode]);

    const handleSubmit = async () => {
        if (!task) return;

        if (!notes.trim()) {
            alert('Adicione uma descrição/justificativa');
            return;
        }

        if (mode === 'return' && !selectedSupervisor) {
            alert('Selecione para quem devolver a tarefa');
            return;
        }

        setLoading(true);
        try {
            const updates: any = {
                updated_at: new Date().toISOString(),
            };

            if (mode === 'complete') {
                updates.status = 'done';
                updates.finished_at = new Date().toISOString();
                updates.description = task.description
                    ? `${task.description}\n\n--- RESOLUÇÃO ---\n${notes}`
                    : notes;
            } else {
                updates.status = 'analysis'; // Return to Analysis phase
                updates.assigned_to = selectedSupervisor; // Reassign to supervisor
                updates.description = task.description
                    ? `${task.description}\n\n--- PROBLEMA REPORTADO ---\n${notes}`
                    : notes;
            }

            const { error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', task.id);

            if (error) throw error;

            packagesCache.invalidate('tasks:all');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Erro ao atualizar tarefa');
        } finally {
            setLoading(false);
        }
    };

    if (!task) return null;

    const isReturn = mode === 'return';

    return (
        <Sheet open={open} onClose={onClose}>
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={3}>{isReturn ? 'Reportar Problema' : 'Concluir Tarefa'}</Title>
                        <Text color="secondary">
                            {isReturn ? 'Justifique e devolva ao supervisor' : 'Descreva como a tarefa foi resolvida'}
                        </Text>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: spacing.sm }}>
                        <X size={24} color={colors.neutral[600]} />
                    </button>
                </div>
            </div>

            {/* Task Info */}
            <div style={{ backgroundColor: colors.neutral[50], padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.lg }}>
                <Text weight="bold" style={{ fontSize: '18px', marginBottom: spacing.sm }}>{task.title}</Text>
                {task.description && <Text color="secondary">{task.description}</Text>}
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                <DSInput
                    label={isReturn ? "Justificativa do Problema" : "Descrição da Resolução"}
                    placeholder={isReturn ? "Ex: Falta de material, acesso bloqueado..." : "Ex: Trocada a lâmpada, testado..."}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={isReturn ? 4 : 6}
                    required
                />

                {isReturn && (
                    <div>
                        <Text weight="bold" style={{ marginBottom: spacing.xs }}>Devolver para (Supervisor)</Text>
                        <select
                            value={selectedSupervisor}
                            onChange={(e) => setSelectedSupervisor(e.target.value)}
                            style={{
                                width: '100%',
                                padding: spacing.md,
                                borderRadius: radius.md,
                                border: `1px solid ${colors.neutral[300]}`,
                                backgroundColor: 'white',
                                fontSize: '16px'
                            }}
                        >
                            <option value="">Selecione um supervisor...</option>
                            {supervisors.map(sup => (
                                <option key={sup.id} value={sup.id}>
                                    {sup.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Warning for Approval (Complete Mode only) */}
            {!isReturn && task.requires_approval && (
                <div style={{ padding: spacing.md, backgroundColor: '#fffbeb', borderRadius: radius.md, marginTop: spacing.lg }}>
                    <Text style={{ fontSize: '14px' }}>
                        ⚠️ Esta tarefa requer aprovação da diretoria antes de ser considerada finalizada
                    </Text>
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.xl }}>
                <DSButton variant="secondary" onClick={onClose} style={{ flex: 1 }}>
                    Cancelar
                </DSButton>
                <DSButton
                    onClick={handleSubmit}
                    icon={isReturn ? <AlertTriangle size={20} /> : <Check size={20} />}
                    variant={isReturn ? 'secondary' : 'primary'} // Use secondary styling for return to distinct from success
                    style={isReturn ? { backgroundColor: colors.brand[50], color: colors.brand[700], border: `1px solid ${colors.brand[200]}` } : {}}
                    loading={loading}
                    disabled={!notes.trim() || (isReturn && !selectedSupervisor)}
                    style={{ flex: 1 }}
                >
                    {isReturn ? 'Devolver Tarefa' : 'Marcar como Concluída'}
                </DSButton>
            </div>
        </Sheet>
    );
};
