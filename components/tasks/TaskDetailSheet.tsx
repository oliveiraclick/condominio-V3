import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, User, Calendar, CheckCircle, Play, Check, FastForward, Search, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabase';
import { Task } from '../../types/tasks';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskCategoryBadge } from './TaskCategoryBadge';
import { Sheet } from '../design-system/Sheet';
import { DSButton } from '../design-system/Button';
import { DSInput } from '../design-system/Input';
import { Title, Text } from '../design-system/Typography';
import { colors, radius, spacing } from '../design-system/tokens';

interface TaskDetailSheetProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    currentUser: any;
    onStartTriage?: () => void;
    onStartAnalysis?: () => void;
    onCompleteTask?: (notes: string) => void;
    onReportIssue?: (notes: string, supervisorId?: string) => void;
    onSuccess?: () => void;
    assignedUserName?: string;
    createdByName?: string;
}

export const TaskDetailSheet: React.FC<TaskDetailSheetProps> = ({
    open,
    onClose,
    task,
    currentUser,
    onStartTriage,
    onStartAnalysis,
    onCompleteTask,
    onReportIssue,
    onSuccess,
    assignedUserName,
    createdByName,
}) => {
    const [approving, setApproving] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [executionMode, setExecutionMode] = useState<'complete' | 'return'>('complete');
    const [selectedSupervisor, setSelectedSupervisor] = useState('');
    const [supervisors, setSupervisors] = useState<any[]>([]);

    // Reset state on open logic typically needed, but state is local.
    // Effect to reset when task changes or closes:
    useEffect(() => {
        if (!open) {
            setResolutionNotes('');
            setExecutionMode('complete');
            setSelectedSupervisor('');
        }
    }, [open]);

    useEffect(() => {
        if (executionMode === 'return' && supervisors.length === 0) {
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
    }, [executionMode]);

    // ... existing code ...
    if (!task) return null;

    const canStartTriage = (task.status === 'open') && (currentUser.role === 'admin' || currentUser.role === 'employee');
    const canPerformAnalysis = task.status === 'analysis' && (task.assigned_to === currentUser.id || currentUser.role === 'admin');
    const canComplete = task.status === 'in_progress' && (task.assigned_to === currentUser.id || currentUser.role === 'admin');
    const canApprove = task.status === 'approval' && (currentUser.role === 'admin');

    return (
        <Sheet open={open} onClose={onClose}>
            {/* Header ... */}

            {/* ... Content ... */}

            {/* Actions */}
            {(canStartTriage || canPerformAnalysis || canComplete || canApprove) && (
                <div style={{ marginTop: spacing.xl, borderTop: `1px solid ${colors.neutral[100]}`, paddingTop: spacing.xl }}>
                    <Text weight="bold" style={{ fontSize: '10px', color: colors.neutral[400], uppercase: true, letterSpacing: '0.1em', marginBottom: spacing.md, display: 'block' }}>
                        PRÓXIMA ETAPA
                    </Text>
                    <div style={{ display: 'flex', gap: spacing.md, flexDirection: 'column' }}>

                        {/* Analysis Button */}
                        {canPerformAnalysis && onStartAnalysis && (
                            <DSButton
                                onClick={onStartAnalysis}
                                style={{ height: '56px', fontSize: '16px', fontWeight: '900', backgroundColor: colors.brand[600], boxShadow: `0 8px 16px -4px ${colors.brand[500]}40` }}
                                leftIcon={<Search size={20} />}
                            >
                                Realizar Análise
                            </DSButton>
                        )}

                        <div style={{ display: 'flex', gap: spacing.md }}>
                            {canStartTriage && onStartTriage && (
                                <DSButton
                                    onClick={onStartTriage}
                                    style={{ flex: 1, height: '56px', fontSize: '16px', fontWeight: '900', backgroundColor: colors.brand[600], boxShadow: `0 8px 16px -4px ${colors.brand[500]}40` }}
                                    leftIcon={<Play size={20} fill="currentColor" />}
                                >
                                    Iniciar Triagem
                                </DSButton>
                            )}

                            {/* Execution Buttons - Embedded */}
                            {canComplete && (
                                <div style={{
                                    backgroundColor: colors.neutral[50],
                                    padding: spacing.md,
                                    borderRadius: radius.md,
                                    width: '100%',
                                    marginTop: spacing.sm
                                }}>
                                    <DSInput
                                        label="Resolução / Justificativa"
                                        placeholder="Descreva o que foi feito ou o problema encontrado..."
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        multiline
                                        rows={3}
                                        style={{ marginBottom: spacing.md }}
                                    />

                                    {/* Additional Options for Return */}
                                    {executionMode === 'return' && (
                                        <div style={{ marginBottom: spacing.md }}>
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

                                    <div style={{ display: 'flex', gap: spacing.md }}>
                                        {/* Toggle Mode / Secondary Action */}
                                        <DSButton
                                            onClick={() => setExecutionMode(executionMode === 'complete' ? 'return' : 'complete')}
                                            variant="secondary"
                                            style={{ flex: 1 }}
                                        >
                                            {executionMode === 'complete' ? 'Reportar Problema' : 'Voltar para Conclusão'}
                                        </DSButton>

                                        {/* Primary Action */}
                                        <DSButton
                                            onClick={() => {
                                                if (executionMode === 'complete') {
                                                    onCompleteTask && onCompleteTask(resolutionNotes);
                                                } else {
                                                    onReportIssue && onReportIssue(resolutionNotes, selectedSupervisor);
                                                }
                                            }}
                                            loading={approving} // Reusing loading state for now or add new one
                                            disabled={!resolutionNotes.trim()}
                                            style={{
                                                flex: 2,
                                                fontSize: '16px',
                                                fontWeight: '900',
                                                backgroundColor: executionMode === 'complete' ? colors.brand[600] : colors.danger,
                                                boxShadow: `0 8px 16px -4px ${executionMode === 'complete' ? colors.brand[500] : colors.danger}40`
                                            }}
                                            leftIcon={executionMode === 'complete' ? <Check size={20} weight="bold" /> : <AlertTriangle size={20} />}
                                        >
                                            {executionMode === 'complete' ? 'Concluir' : 'Devolver Tarefa'}
                                        </DSButton>
                                    </div>
                                </div>
                            )}

                            {canApprove && (
                                <DSButton
                                    onClick={handleApprove}
                                    loading={approving}
                                    style={{ flex: 1, height: '56px', fontSize: '16px', fontWeight: '900', backgroundColor: colors.success, color: '#fff', boxShadow: `0 8px 16px -4px ${colors.success}40` }}
                                    leftIcon={<FastForward size={20} fill="currentColor" />}
                                >
                                    Aprovar Tarefa
                                </DSButton>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Sheet>
    );
};
