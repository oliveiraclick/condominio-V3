import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../supabase';
import { Task, STATUS_LABELS } from '../../types/tasks';
import { TaskCard } from './TaskCard';
import { DSButton } from '../design-system/Button';
import { Title, Text } from '../design-system/Typography';
import { colors, spacing, radius } from '../design-system/tokens';
import { packagesCache } from '../../cache/packagesCache';

interface TasksKanbanViewProps {
    currentUser: any;
    onCreateTask: () => void;
    onTaskClick: (task: Task, assignedUserName?: string, createdByName?: string) => void;
}

const TASK_CACHE_KEY = 'tasks:all';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const TasksKanbanView: React.FC<TasksKanbanViewProps> = ({
    currentUser,
    onCreateTask,
    onTaskClick,
}) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});

    // Fetch tasks with cache
    const fetchTasks = useCallback(async () => {
        // Try cache first
        const cached = packagesCache.get<Task[]>(TASK_CACHE_KEY);
        if (cached) {
            setTasks(cached);
            setLoading(false);
            return;
        }

        // Fetch from server
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('archived', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const tasksData = data || [];
            setTasks(tasksData);

            // Store in cache
            packagesCache.set(TASK_CACHE_KEY, tasksData, CACHE_TTL);

            // Fetch user profiles for assigned users and creators
            const userIds = [...new Set([
                ...tasksData.map(t => t.assigned_to).filter(Boolean),
                ...tasksData.map(t => t.created_by).filter(Boolean)
            ])];

            if (userIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, name')
                    .in('id', userIds);

                if (profiles) {
                    const profileMap: Record<string, string> = {};
                    profiles.forEach(p => {
                        profileMap[p.id] = p.name;
                    });
                    setUserProfiles(profileMap);
                }
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert('Erro ao carregar tarefas');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('tasks_realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'tasks',
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTasks(prev => [payload.new as Task, ...prev]);
                    packagesCache.invalidate(TASK_CACHE_KEY);
                } else if (payload.eventType === 'UPDATE') {
                    setTasks(prev => prev.map(t =>
                        t.id === (payload.new as Task).id ? payload.new as Task : t
                    ));
                    packagesCache.invalidate(TASK_CACHE_KEY);
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== (payload.old as Task).id));
                    packagesCache.invalidate(TASK_CACHE_KEY);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Group tasks by status
    const tasksByStatus = {
        open: tasks.filter(t => t.status === 'open'),
        analysis: tasks.filter(t => t.status === 'analysis'),
        approval: tasks.filter(t => t.status === 'approval'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        done: tasks.filter(t => t.status === 'done'),
    };

    const renderColumn = (status: Task['status']) => {
        const columnTasks = tasksByStatus[status];

        return (
            <div
                key={status}
                style={{
                    flex: 1,
                    minWidth: '280px',
                    backgroundColor: colors.neutral[50], // neutral token
                    borderRadius: radius.lg,
                    padding: spacing.md,
                }}
            >
                {/* Column Header */}
                <div style={{ marginBottom: spacing.md }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>
                            {STATUS_LABELS[status]}
                        </Title>
                        <div
                            style={{
                                backgroundColor: colors.brand[500], // brand token
                                color: '#ffffff', // white hex
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
                    {columnTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(
                                task,
                                task.assigned_to ? userProfiles[task.assigned_to] : undefined,
                                task.created_by ? userProfiles[task.created_by] : undefined
                            )}
                            assignedUserName={task.assigned_to ? userProfiles[task.assigned_to] : undefined}
                        />
                    ))}

                    {columnTasks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: spacing.xl }}>
                            <Text color="secondary">Nenhuma tarefa</Text>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Text>Carregando tarefas...</Text>
            </div>
        );
    }

    return (
        <div style={{ padding: spacing.lg }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
                <div>
                    <Title level={2}>📋 Gerenciamento de Tarefas</Title>
                    <Text color="secondary">{tasks.length} tarefas ativas</Text>
                </div>
                <DSButton onClick={onCreateTask} icon={<Plus size={20} />}>
                    Nova Tarefa
                </DSButton>
            </div>

            {/* Kanban Board */}
            <div
                style={{
                    display: 'flex',
                    gap: spacing.lg,
                    overflowX: 'auto',
                    paddingBottom: spacing.md,
                }}
            >
                {renderColumn('open')}
                {renderColumn('analysis')}
                {renderColumn('approval')}
                {renderColumn('in_progress')}
                {renderColumn('done')}
            </div>
        </div>
    );
};
