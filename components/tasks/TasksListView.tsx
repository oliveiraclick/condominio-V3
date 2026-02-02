import React from 'react';
import { MoreVertical, Calendar, User, MapPin } from 'lucide-react';
import { Task } from '../../types/tasks';
import { Text } from '../design-system/Typography';
import { colors, spacing, radius } from '../design-system/tokens';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskCategoryBadge } from './TaskCategoryBadge';

interface TasksListViewProps {
    tasks: Task[];
    userProfiles: Record<string, string>;
    onTaskClick: (task: Task) => void;
    currentUser: any;
}

export const TasksListView: React.FC<TasksListViewProps> = ({
    tasks,
    userProfiles,
    onTaskClick,
    currentUser
}) => {

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
    };

    if (tasks.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: spacing.xl,
                backgroundColor: colors.neutral[50],
                borderRadius: radius.lg,
                marginTop: spacing.md
            }}>
                <Text color="secondary">Nenhuma tarefa encontrada</Text>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#ffffff',
            borderRadius: radius.lg,
            border: `1px solid ${colors.neutral[200]}`,
            overflow: 'hidden',
            marginTop: spacing.md
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: colors.neutral[50], borderBottom: `1px solid ${colors.neutral[200]}` }}>
                        <th style={{ padding: spacing.md, textAlign: 'left', width: '35%' }}>
                            <Text weight="bold" size="sm">Tarefa</Text>
                        </th>
                        <th style={{ padding: spacing.md, textAlign: 'center', width: '12%' }}>
                            <Text weight="bold" size="sm">Status</Text>
                        </th>
                        <th style={{ padding: spacing.md, textAlign: 'center', width: '10%' }}>
                            <Text weight="bold" size="sm">Prioridade</Text>
                        </th>
                        <th style={{ padding: spacing.md, textAlign: 'left', width: '15%' }}>
                            <Text weight="bold" size="sm">Responsável</Text>
                        </th>
                        <th style={{ padding: spacing.md, textAlign: 'left', width: '15%' }}>
                            <Text weight="bold" size="sm">Local / Prazo</Text>
                        </th>
                        <th style={{ padding: spacing.md, textAlign: 'center', width: '5%' }}>
                            <Text weight="bold" size="sm">Ações</Text>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr
                            key={task.id}
                            style={{
                                borderBottom: `1px solid ${colors.neutral[100]}`,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onClick={() => onTaskClick(task)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.brand[50]}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <td style={{ padding: spacing.md }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Text weight="bold">{task.title}</Text>
                                        <TaskCategoryBadge category={task.category} />
                                    </div>
                                    {task.description && (
                                        <Text size="sm" color="secondary" style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '300px'
                                        }}>
                                            {task.description}
                                        </Text>
                                    )}
                                </div>
                            </td>
                            <td style={{ padding: spacing.md, textAlign: 'center' }}>
                                <TaskStatusBadge status={task.status} />
                            </td>
                            <td style={{ padding: spacing.md, textAlign: 'center' }}>
                                <TaskPriorityBadge priority={task.priority} />
                            </td>
                            <td style={{ padding: spacing.md }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '24px', height: '24px',
                                        borderRadius: '50%',
                                        backgroundColor: colors.neutral[200],
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <User size={14} color={colors.neutral[600]} />
                                    </div>
                                    <Text size="sm">
                                        {task.assigned_to ? (userProfiles[task.assigned_to] || 'Usuário') : 'Não atribuído'}
                                    </Text>
                                </div>
                            </td>
                            <td style={{ padding: spacing.md }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {task.location && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={12} color={colors.neutral[500]} />
                                            <Text size="xs" color="secondary">{task.location}</Text>
                                        </div>
                                    )}
                                    {task.due_date && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} color={colors.neutral[500]} />
                                            <Text size="xs" color="secondary">{formatDate(task.due_date)}</Text>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td style={{ padding: spacing.md, textAlign: 'center' }}>
                                <button
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        color: colors.neutral[500]
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTaskClick(task);
                                    }}
                                >
                                    <MoreVertical size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
