import React, { useState } from 'react';
import { Calendar, User as UserIcon, MapPin, Menu, Plus } from 'lucide-react';
import { Task } from '../../types/tasks';
import { Text, Title } from '../design-system/Typography';
import { colors, spacing, radius } from '../design-system/tokens';
import { TaskPriorityBadge } from './TaskPriorityBadge';

interface TasksMobileViewProps {
    tasks: Task[];
    userProfiles: Record<string, string>;
    onTaskClick: (task: Task) => void;
    onQuickAction?: (task: Task, action: 'start' | 'complete') => void;
    onCreateTask?: () => void;
    currentUser: any;
}

type MobileFilter = 'pending' | 'in_progress' | 'done';

export const TasksMobileView: React.FC<TasksMobileViewProps> = ({
    tasks,
    userProfiles,
    onTaskClick,
    onQuickAction,
    onCreateTask,
    currentUser
}) => {
    const [activeFilter, setActiveFilter] = useState<MobileFilter>('pending');

    const counts = {
        pending: tasks.filter(t => t.status === 'new' || t.status === 'evaluating').length,
        in_progress: tasks.filter(t => t.status === 'executing').length,
        done: tasks.filter(t => t.status === 'finished').length,
    };

    const filters: { id: MobileFilter, label: string }[] = [
        { id: 'pending', label: `Pendente (${counts.pending})` },
        { id: 'in_progress', label: `Em Curso (${counts.in_progress})` },
        { id: 'done', label: `Concluído (${counts.done})` },
    ];

    const filteredTasks = tasks.filter(task => {
        if (activeFilter === 'pending') {
            return task.status === 'new' || task.status === 'evaluating';
        }
        if (activeFilter === 'in_progress') {
            return task.status === 'executing';
        }
        if (activeFilter === 'done') {
            return task.status === 'finished';
        }
        return true;
    }).sort((a, b) => {
        const priorityWeight = {
            'urgente': 4,
            'alta': 3,
            'normal': 2,
            'baixa': 1
        };
        const weightA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
        const weightB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
        return weightB - weightA; // Descending order
    });

    const formatTimeOrDate = (dateString: string | null) => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            const now = new Date();
            const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth();

            if (isToday) {
                return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
            } else {
                return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
            }
        } catch (e) {
            return null;
        }
    };


    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'alta':
            case 'urgente':
                return colors.danger; // Red
            case 'normal':
                return colors.brand[600]; // Blue
            case 'baixa':
            default:
                return colors.neutral[400]; // Gray
        }
    };

    const getPrimaryActionLabel = (status: string) => {
        if (status === 'new' || status === 'evaluating') return 'Iniciar';
        if (status === 'executing') return 'Concluir';
        return null;
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>

            {/* 1. Header Fixo */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: spacing.md,
                backgroundColor: '#ffffff',
                borderBottom: `1px solid ${colors.neutral[100]}`,
                position: 'sticky',
                top: 0,
                zIndex: 20
            }}>
                <div style={{ width: '40px' }}>
                    <Menu size={24} color={colors.neutral[800]} />
                </div>

                <Title level={4} style={{ margin: 0, flex: 1, textAlign: 'center' }}>Tarefas</Title>

                <div style={{ width: '40px' }}></div> {/* Spacer to center title */}
            </header>

            {/* 2. Filtros (Tabs) */}
            <div style={{
                display: 'flex',
                padding: spacing.md,
                gap: spacing.sm,
                backgroundColor: '#ffffff',
                borderBottom: `1px solid ${colors.neutral[100]}`
            }}>
                {filters.map(filter => {
                    const isActive = activeFilter === filter.id;
                    return (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            style={{
                                flex: 1,
                                padding: '8px 4px',
                                borderRadius: radius.md,
                                border: 'none',
                                backgroundColor: isActive ? '#ebf5ff' : 'transparent', // Light blue bg for active
                                color: isActive ? colors.brand[600] : colors.neutral[500],
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}
                        >
                            {filter.label}
                        </button>
                    );
                })}
            </div>

            {/* 3. Lista de Tarefas */}
            <div style={{ flex: 1, overflowY: 'auto', padding: spacing.md, display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                {filteredTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.neutral[500] }}>
                        <Text>Nenhuma tarefa nesta lista.</Text>
                    </div>
                ) : (
                    filteredTasks.map(task => {
                        const priorityColor = getPriorityColor(task.priority);
                        const actionLabel = getPrimaryActionLabel(task.status);
                        const timeDisplay = formatTimeOrDate(task.due_date);

                        return (
                            <div
                                key={task.id}
                                onClick={() => onTaskClick(task)}
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: radius.lg,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden' // Ensure border radius clips
                                }}
                            >
                                {/* Barra Lateral de Prioridade */}
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '6px',
                                    backgroundColor: priorityColor
                                }} />

                                <div style={{ padding: `${spacing.md} ${spacing.md} ${spacing.md} ${spacing.lg}` }}> {/* Extra left padding for border */}

                                    {/* Header do Card (Título + Badge Prioridade) */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
                                        <Title level={5} style={{ fontSize: '16px', margin: 0, lineHeight: '1.4' }}>
                                            {task.title}
                                        </Title>
                                        <TaskPriorityBadge priority={task.priority} size="sm" />
                                    </div>

                                    {/* Metadados (Local + Tempo) */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
                                        {task.location && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={14} color={colors.neutral[500]} />
                                                <Text size="sm" color="secondary">{task.location}</Text>
                                            </div>
                                        )}
                                        {timeDisplay && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={14} color={colors.neutral[500]} />
                                                <Text size="sm" color="secondary">{timeDisplay}</Text>
                                            </div>
                                        )}
                                    </div>

                                    {/* Ação Principal (Alinhada à direita como "Link") */}
                                    {actionLabel && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spacing.xs }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onQuickAction) {
                                                        const action = actionLabel === 'Iniciar' ? 'start' : 'complete';
                                                        onQuickAction(task, action);
                                                    }
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: colors.brand[600],
                                                    fontWeight: 600,
                                                    fontSize: '14px',
                                                    padding: '4px 8px',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                    textUnderlineOffset: '4px'
                                                }}
                                            >
                                                {actionLabel}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Action Button for New Task */}
            <div style={{ position: 'fixed', bottom: '90px', right: spacing.xl, zIndex: 30 }}>
                <button
                    onClick={onCreateTask}
                    style={{
                        width: '56px', height: '56px',
                        borderRadius: '50%',
                        backgroundColor: colors.brand[600],
                        color: '#fff',
                        border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={28} />
                </button>
            </div>
        </div>
    );
};
