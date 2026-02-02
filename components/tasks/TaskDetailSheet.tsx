import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, User, Calendar, CheckCircle, Play, Check, FastForward, Search, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabase';
import { Task, isPendingApproval } from '../../types/tasks';
import { packagesCache } from '../../cache/packagesCache';
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
    onStartExecution?: () => void;
    onCompleteTask?: () => void;
    onReportProblem?: () => void;
    onApproveTask?: () => void;
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
    onStartExecution,
    onCompleteTask,
    onReportProblem,
    onApproveTask,
    onSuccess,
    assignedUserName,
    createdByName,
}) => {
    const [employees, setEmployees] = useState<{ id: string, name: string }[]>([]);
    const [assigning, setAssigning] = useState(false);

    // Permission checks
    const isAdmin = ['admin', 'super_admin'].includes(currentUser?.role);
    const isEmployee = currentUser?.role === 'employee';

    useEffect(() => {
        const fetchEmployees = async () => {
            if (isAdmin) {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, name')
                    .eq('role', 'employee');
                if (data) setEmployees(data);
            }
        };
        fetchEmployees();
    }, [isAdmin]);

    if (!task) return null;

    // "Fazer Triagem" - Only Admin + status = new
    const canStartTriage = isAdmin && task.status === 'new';

    // "Iniciar Execução" - Employee or Admin + status = evaluating
    const canStartExecution = (isEmployee || isAdmin) && task.status === 'evaluating';

    // "Concluir Tarefa" - Only Employee + status = executing
    const canComplete = isEmployee && task.status === 'executing';

    // "Reportar Problema" - Employee + status = executing
    const canReportProblem = isEmployee && task.status === 'executing';

    // "Aprovar Tarefa" - Only Admin + status = finished + requires_approval = true + approved_at = null
    const canApprove = isAdmin && task.status === 'finished' && task.requires_approval && !task.approved_at;

    const [currentAssignedTo, setCurrentAssignedTo] = useState(task?.assigned_to);

    useEffect(() => {
        setCurrentAssignedTo(task?.assigned_to);
    }, [task]);

    const handleAssignUser = async (userId: string) => {
        if (!task) return;
        setAssigning(true);
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    assigned_to: userId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', task.id);

            if (error) throw error;

            // Update local state immediately
            setCurrentAssignedTo(userId);

            // Invalidate cache
            packagesCache.invalidate('tasks:all');

            if (onSuccess) onSuccess();
            // alert('Responsável atualizado com sucesso!'); // Removed alert to be smoother
        } catch (error) {
            console.error('Error assigning user:', error);
            alert('Erro ao atribuir responsável');
        } finally {
            setAssigning(false);
        }
    };

    return (
        <Sheet open={open} onClose={onClose}>
            {/* Header */}
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: spacing.md }}>
                        <div style={{ display: 'flex', gap: spacing.xs, marginBottom: spacing.sm, flexWrap: 'wrap' }}>
                            <TaskStatusBadge status={task.status} />
                            <TaskPriorityBadge priority={task.priority} />
                            <TaskCategoryBadge category={task.category} />
                        </div>
                        <Title level={3} style={{ marginBottom: spacing.xs }}>{task.title}</Title>
                        <Text size="sm" color="secondary" style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                            <Calendar size={14} /> Atribuído em: {new Date(task.created_at).toLocaleDateString()}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>

                {/* Description */}
                <div>
                    <Text weight="bold" style={{ marginBottom: spacing.xs, display: 'block' }}>Descrição</Text>
                    <div style={{ backgroundColor: colors.neutral[50], padding: spacing.md, borderRadius: radius.md }}>
                        <Text>{task.description || 'Sem descrição.'}</Text>
                    </div>
                </div>

                {/* Assignment Section (Admin Only) */}
                {isAdmin && (
                    <div>
                        <Text weight="bold" style={{ marginBottom: spacing.xs, display: 'block' }}>Atribuir Responsável</Text>
                        <select
                            value={currentAssignedTo || ''}
                            onChange={(e) => handleAssignUser(e.target.value)}
                            disabled={assigning}
                            style={{
                                width: '100%',
                                padding: spacing.md,
                                borderRadius: radius.md,
                                border: `1px solid ${colors.neutral[300]}`,
                                backgroundColor: '#fff',
                                fontSize: '16px'
                            }}
                        >
                            <option value="">Selecione um funcionário...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                        <Text size="sm" color="secondary" style={{ marginTop: spacing.xs }}>
                            Ao selecionar, a tarefa aparecerá imediatamente para o funcionário.
                        </Text>
                    </div>
                )}

                {/* Current Assignment Display (Non-Admin View) */}
                {!isAdmin && (assignedUserName || task.assigned_to) && (
                    <div>
                        <Text weight="bold" style={{ marginBottom: spacing.xs, display: 'block' }}>Responsável</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={20} color={colors.neutral[500]} />
                            </div>
                            <Text>{assignedUserName || 'Usuário atribuído'}</Text>
                        </div>
                    </div>
                )}


                {/* Location */}
                {task.location && (
                    <div>
                        <Text weight="bold" style={{ marginBottom: spacing.xs, display: 'block' }}>Localização</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                            <MapPin size={20} color={colors.neutral[500]} />
                            <Text>{task.location}</Text>
                        </div>
                    </div>
                )}

                {/* Additional Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                    <div>
                        <Text weight="bold" style={{ marginBottom: spacing.xs, display: 'block' }}>Criado por</Text>
                        <Text color="secondary">{createdByName || 'Sistema'}</Text>
                    </div>
                    {task.due_date && (
                        <div>
                            <Text weight="bold" style={{ marginBottom: spacing.xs, display: 'block' }}>Prazo</Text>
                            <Text color="secondary">{new Date(task.due_date).toLocaleDateString()}</Text>
                        </div>
                    )}
                </div>

            </div>

            {/* Actions Footer */}
            {(canStartTriage || canStartExecution || canComplete || canReportProblem || canApprove) && (
                <div style={{ marginTop: spacing.xl, borderTop: `1px solid ${colors.neutral[100]}`, paddingTop: spacing.xl }}>
                    <Text weight="bold" style={{ fontSize: '10px', color: colors.neutral[400], uppercase: true, letterSpacing: '0.1em', marginBottom: spacing.md, display: 'block' }}>
                        PRÓXIMA ETAPA
                    </Text>
                    <div style={{ display: 'flex', gap: spacing.md, flexDirection: 'column' }}>

                        {/* Triage Button */}
                        {canStartTriage && onStartTriage && (
                            <DSButton
                                onClick={onStartTriage}
                                style={{ height: '56px', fontSize: '16px', fontWeight: '900', backgroundColor: colors.brand[600], boxShadow: `0 8px 16px -4px ${colors.brand[500]}40` }}
                                leftIcon={<Play size={20} fill="currentColor" />}
                            >
                                Iniciar Triagem
                            </DSButton>
                        )}

                        {/* Start Execution Button */}
                        {canStartExecution && onStartExecution && (
                            <DSButton
                                onClick={onStartExecution}
                                style={{ height: '56px', fontSize: '16px', fontWeight: '900', backgroundColor: colors.brand[600], boxShadow: `0 8px 16px -4px ${colors.brand[500]}40` }}
                                leftIcon={<Play size={20} />}
                            >
                                Iniciar Execução
                            </DSButton>
                        )}

                        {/* Complete and Report Problem Buttons */}
                        {(canComplete || canReportProblem) && (
                            <div style={{ display: 'flex', gap: spacing.md }}>
                                {canComplete && onCompleteTask && (
                                    <DSButton
                                        onClick={onCompleteTask}
                                        style={{ flex: 1, height: '56px', fontSize: '16px', fontWeight: '900', backgroundColor: colors.brand[600], boxShadow: `0 8px 16px -4px ${colors.brand[500]}40` }}
                                        leftIcon={<Check size={20} />}
                                    >
                                        Concluir Tarefa
                                    </DSButton>
                                )}
                                {canReportProblem && onReportProblem && (
                                    <DSButton
                                        onClick={onReportProblem}
                                        variant="secondary"
                                        style={{ flex: 1, height: '56px', fontSize: '16px', fontWeight: '900' }}
                                        leftIcon={<AlertTriangle size={20} />}
                                    >
                                        Reportar Problema
                                    </DSButton>
                                )}
                            </div>
                        )}

                        {/* Approve Button */}
                        {canApprove && onApproveTask && (
                            <DSButton
                                onClick={onApproveTask}
                                style={{ height: '56px', fontSize: '16px', fontWeight: '900', backgroundColor: colors.success, color: '#fff', boxShadow: `0 8px 16px -4px ${colors.success}40` }}
                                leftIcon={<FastForward size={20} fill="currentColor" />}
                            >
                                Aprovar Tarefa
                            </DSButton>
                        )}
                    </div>
                </div>
            )}
        </Sheet>
    );
};
