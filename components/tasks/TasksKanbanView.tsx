import React, { useMemo } from 'react';
import { Task, STATUS_LABELS, isPendingApproval } from '../../types/tasks';
import { TaskCard } from './TaskCard';
import { Title, Text } from '../design-system/Typography';
import { colors, spacing, radius } from '../design-system/tokens';

interface TasksKanbanViewProps {
    tasks: Task[];
    userProfiles: Record<string, string>;
    currentUser: any;
    onCreateTask: () => void;
    onTaskClick: (task: Task, assignedUserName?: string, createdByName?: string) => void;
}

export const TasksKanbanView: React.FC<TasksKanbanViewProps> = ({
    tasks,
    userProfiles,
    currentUser,
    onCreateTask,
    onTaskClick,
}) => {

    // Group tasks by status (4 columns flow)
    const tasksByStatus = useMemo(() => {
        return {
            new: tasks.filter(t => t.status === 'new'),
            evaluating: tasks.filter(t => t.status === 'evaluating'),
            executing: tasks.filter(t => t.status === 'executing'),
            finished: tasks.filter(t => t.status === 'finished'),
        };
    }, [tasks]);

    const renderColumn = (columnType: 'new' | 'evaluating' | 'executing' | 'finished') => {
        const columnTasks = tasksByStatus[columnType];
        const title = STATUS_LABELS[columnType];

        // Custom visual for Done tasks that are pending approval
        const getCardStyle = (task: Task) => {
            if (isPendingApproval(task)) {
                return {
                    borderLeft: `4px solid ${colors.warning}`,
                    opacity: 1
                };
            }
            return undefined;
        };

        return (
            <div
                key={columnType}
                style={{
                    flex: 1,
                    minWidth: '280px',
                    backgroundColor: colors.neutral[50],
                    borderRadius: radius.lg,
                    padding: spacing.md,
                }}
            >
                {/* Column Header */}
                <div style={{ marginBottom: spacing.md }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>
                            {title}
                        </Title>
                        <div
                            style={{
                                backgroundColor: colors.brand[500],
                                color: '#ffffff',
                                borderRadius: radius.pill,
                                padding: `${spacing.xs} ${spacing.sm}`,
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            {columnTasks.length}
                        </div>
                    </div>
                </div>

                {/* Tasks */}
                <div style={{ minHeight: '200px' }}>
                    {columnTasks.map(task => {
                        const isPending = isPendingApproval(task);
                        return (
                            <div key={task.id} style={{ position: 'relative' }}>
                                {isPending && (
                                    <div style={{
                                        position: 'absolute',
                                        top: -10,
                                        right: 10,
                                        zIndex: 10,
                                        backgroundColor: '#fbbf24', // warning
                                        color: '#451a03',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        Aguardando Aprovação
                                    </div>
                                )}
                                <TaskCard
                                    task={task}
                                    onClick={() => onTaskClick(
                                        task,
                                        task.assigned_to ? userProfiles[task.assigned_to] : undefined,
                                        task.created_by ? userProfiles[task.created_by] : undefined
                                    )}
                                    assignedUserName={task.assigned_to ? userProfiles[task.assigned_to] : undefined}
                                    style={getCardStyle(task)}
                                />
                            </div>
                        );
                    })}

                    {columnTasks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: spacing.xl }}>
                            <Text color="secondary">Nenhuma tarefa</Text>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ paddingTop: spacing.md }}>
            <div
                style={{
                    display: 'flex',
                    gap: spacing.lg,
                    overflowX: 'auto',
                    paddingBottom: spacing.md,
                }}
            >
                {/* Admin/Board: see all 4 columns */}
                {['admin', 'super_admin', 'board'].includes(currentUser?.role) && (
                    <>
                        {renderColumn('new')}
                        {renderColumn('evaluating')}
                        {renderColumn('executing')}
                        {renderColumn('finished')}
                    </>
                )}

                {/* Employee: only see evaluating and executing */}
                {currentUser?.role === 'employee' && (
                    <>
                        {renderColumn('evaluating')}
                        {renderColumn('executing')}
                    </>
                )}
            </div>
        </div>
    );
};
