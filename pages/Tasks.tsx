import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LayoutList, Kanban, Smartphone, Plus } from 'lucide-react';
import { supabase } from '../supabase';
import { Task } from '../types/tasks';
import { packagesCache } from '../cache/packagesCache';
import { TasksKanbanView } from '../components/tasks/TasksKanbanView';
import { TasksListView } from '../components/tasks/TasksListView';
import { TasksMobileView } from '../components/tasks/TasksMobileView';
import { TaskCreateFlow } from '../components/tasks/TaskCreateFlow';
import { TaskTriageFlow } from '../components/tasks/TaskTriageFlow';
import { ExecutionStartModal } from '../components/tasks/ExecutionStartModal';
import { TaskCompletionModal } from '../components/tasks/TaskCompletionModal';
import { ProblemReportModal } from '../components/tasks/ProblemReportModal';
import { TaskApprovalModal } from '../components/tasks/TaskApprovalModal';
import { TaskDetailSheet } from '../components/tasks/TaskDetailSheet';
import { colors, radius, spacing } from '../components/design-system/tokens';
import { Title, Text } from '../components/design-system/Typography';
import { DSButton } from '../components/design-system/Button';

interface TasksProps {
    session: any;
    currentUser: any;
}

type ViewMode = 'list' | 'kanban' | 'mobile';

const TASK_CACHE_KEY = 'tasks:all';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const Tasks: React.FC<TasksProps> = ({ session, currentUser }) => {
    // UI State
    const [createFlowOpen, setCreateFlowOpen] = useState(false);
    const [triageFlowOpen, setTriageFlowOpen] = useState(false);
    const [executionStartOpen, setExecutionStartOpen] = useState(false);
    const [completionOpen, setCompletionOpen] = useState(false);
    const [problemReportOpen, setProblemReportOpen] = useState(false);
    const [approvalOpen, setApprovalOpen] = useState(false);
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedTaskMeta, setSelectedTaskMeta] = useState<{ assignedUserName?: string, createdByName?: string }>({});

    // Data State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // View Mode State
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [isMobile, setIsMobile] = useState(false);

    const activeUser = currentUser || session?.user;

    // Detect mobile device on mount
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setViewMode('mobile');
            } else {
                setViewMode('list'); // Default desktop
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- DATA FETCHING (Moved from TasksKanbanView) ---
    const fetchTasks = useCallback(async () => {
        // Try cache first
        const cached = packagesCache.get<Task[]>(TASK_CACHE_KEY);
        if (cached) {
            setTasks(cached);
            setLoading(false);
            // Non-blocking background update could be added here if needed
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('archived', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const tasksData = data || [];

            // Should we update state only if different? React handles this well.
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
            // alert('Erro ao carregar tarefas'); // Suppress alert on basic fetch to avoid spam
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks, refreshTrigger]);

    // Listen for manual refresh events
    useEffect(() => {
        const handleRefresh = () => {
            packagesCache.invalidate(TASK_CACHE_KEY);
            setRefreshTrigger(prev => prev + 1);
        };

        window.addEventListener('tasks:refresh', handleRefresh);
        return () => window.removeEventListener('tasks:refresh', handleRefresh);
    }, [fetchTasks]);

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('tasks_realtime_main')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'tasks',
            }, (payload) => {
                // Determine action based on payload
                // For simplicity, just invalidate and refresh
                packagesCache.invalidate(TASK_CACHE_KEY);
                setRefreshTrigger(prev => prev + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Filter tasks based on user role
    const filteredTasks = useMemo(() => {
        // Employee: only see tasks assigned to them
        if (currentUser?.role === 'employee') {
            return tasks.filter(t => t.assigned_to === currentUser.id);
        }
        // Admin, super_admin, board: see all tasks
        return tasks;
    }, [tasks, currentUser]);

    // --- HANDLERS ---

    const handleTaskClick = (task: Task, assignedUserName?: string, createdByName?: string) => {
        setSelectedTask(task);
        const assigned = assignedUserName || (task.assigned_to ? userProfiles[task.assigned_to] : undefined);
        const created = createdByName || (task.created_by ? userProfiles[task.created_by] : undefined);

        setSelectedTaskMeta({ assignedUserName: assigned, createdByName: created });
        setDetailSheetOpen(true);
    };

    const handleSuccess = () => {
        packagesCache.invalidate(TASK_CACHE_KEY);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleStartTriage = () => {
        setDetailSheetOpen(false);
        setTriageFlowOpen(true);
    };

    const handleStartExecution = () => {
        setDetailSheetOpen(false);
        setExecutionStartOpen(true);
    };

    const handleOpenCompletion = () => {
        setDetailSheetOpen(false);
        setCompletionOpen(true);
    };

    const handleOpenProblemReport = () => {
        setDetailSheetOpen(false);
        setProblemReportOpen(true);
    };

    const handleOpenApproval = () => {
        setDetailSheetOpen(false);
        setApprovalOpen(true);
    };

    // --- COMPLETION & REPORTING HANDLERS (Moved from inline) ---
    const handleCompleteTask = async (notes: string) => {
        if (!selectedTask || !notes.trim()) return;

        try {
            const updates: any = {
                status: 'finished',
                finished_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                description: selectedTask.description
                    ? `${selectedTask.description}\n\n--- RESOLUÇÃO ---\n${notes}`
                    : notes
            };

            const { error } = await supabase.from('tasks').update(updates).eq('id', selectedTask.id);
            if (error) throw error;

            setDetailSheetOpen(false);
            handleSuccess();
        } catch (error) {
            console.error('Error completing task:', error);
            alert('Erro ao concluir tarefa');
        }
    };

    const handleReportIssue = async (notes: string, supervisorId?: string) => {
        // ... (logic remains same)
        if (!selectedTask || !notes.trim() || !supervisorId) return;

        try {
            const updates: any = {
                status: 'evaluating',
                assigned_to: supervisorId,
                updated_at: new Date().toISOString(),
                problem_reported: true,
                problem_reason: notes,
                description: selectedTask.description
                    ? `${selectedTask.description}\n\n--- PROBLEMA REPORTADO ---\n${notes}`
                    : notes
            };
            const { error } = await supabase.from('tasks').update(updates).eq('id', selectedTask.id);
            if (error) throw error;
            setDetailSheetOpen(false);
            handleSuccess();
        } catch (error) {
            console.error('Error reporting:', error);
            alert('Erro ao reportar problema');
        }
    };

    const handleTaskAction = (task: Task, action: 'start' | 'complete') => {
        setSelectedTask(task);
        if (action === 'start') setExecutionStartOpen(true);
        if (action === 'complete') setCompletionOpen(true);
    };

    return (
        <div style={{ padding: isMobile ? 0 : spacing.lg, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header & Controls - Desktop Only */}
            {!isMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                    <div>
                        <Title level={2}>Gerenciamento de Tarefas</Title>
                        <Text color="secondary">{filteredTasks.length} tarefas ativas</Text>
                    </div>

                    <div style={{ display: 'flex', gap: spacing.md }}>
                        {/* View Switcher */}
                        <div style={{
                            display: 'flex',
                            backgroundColor: colors.neutral[100],
                            padding: '4px',
                            borderRadius: radius.md,
                            gap: '4px'
                        }}>
                            <button
                                onClick={() => setViewMode('list')}
                                title="Lista"
                                style={{
                                    padding: '6px',
                                    border: 'none',
                                    borderRadius: radius.sm,
                                    backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                                    color: viewMode === 'list' ? colors.brand[600] : colors.neutral[500],
                                    cursor: 'pointer',
                                    boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    display: 'flex', alignItems: 'center'
                                }}
                            >
                                <LayoutList size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('kanban')}
                                title="Kanban"
                                style={{
                                    padding: '6px',
                                    border: 'none',
                                    borderRadius: radius.sm,
                                    backgroundColor: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                                    color: viewMode === 'kanban' ? colors.brand[600] : colors.neutral[500],
                                    cursor: 'pointer',
                                    boxShadow: viewMode === 'kanban' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    display: 'flex', alignItems: 'center'
                                }}
                            >
                                <Kanban size={18} />
                            </button>
                        </div>

                        {/* New Task Button */}
                        {['admin', 'super_admin'].includes(currentUser?.role) && (
                            <DSButton onClick={() => setCreateFlowOpen(true)} leftIcon={<Plus size={20} />} size="md">
                                Nova Tarefa
                            </DSButton>
                        )}
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: spacing.xl }}>
                        <Text>Carregando tarefas...</Text>
                    </div>
                ) : (
                    <>
                        {viewMode === 'kanban' && (
                            <TasksKanbanView
                                tasks={filteredTasks}
                                userProfiles={userProfiles}
                                onTaskClick={handleTaskClick}
                                currentUser={currentUser}
                            />
                        )}

                        {viewMode === 'list' && (
                            <TasksListView
                                tasks={filteredTasks}
                                userProfiles={userProfiles}
                                onTaskClick={handleTaskClick}
                                currentUser={currentUser}
                            />
                        )}

                        {viewMode === 'mobile' && (
                            <TasksMobileView
                                tasks={filteredTasks}
                                userProfiles={userProfiles}
                                onTaskClick={handleTaskClick}
                                onQuickAction={handleTaskAction}
                                onCreateTask={() => setCreateFlowOpen(true)}
                                currentUser={currentUser}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <TaskCreateFlow open={createFlowOpen} onClose={() => setCreateFlowOpen(false)} currentUser={currentUser} onSuccess={handleSuccess} />
            <TaskTriageFlow open={triageFlowOpen} onClose={() => setTriageFlowOpen(false)} task={selectedTask} currentUser={currentUser} onSuccess={handleSuccess} />
            <ExecutionStartModal open={executionStartOpen} onClose={() => setExecutionStartOpen(false)} task={selectedTask} currentUser={currentUser} onSuccess={handleSuccess} />
            <TaskCompletionModal open={completionOpen} onClose={() => setCompletionOpen(false)} task={selectedTask} onSubmit={handleCompleteTask} loading={false} />
            <ProblemReportModal open={problemReportOpen} onClose={() => setProblemReportOpen(false)} task={selectedTask} onSubmit={handleReportIssue} loading={false} />
            <TaskApprovalModal open={approvalOpen} onClose={() => setApprovalOpen(false)} task={selectedTask} currentUser={currentUser} onSuccess={handleSuccess} />

            <TaskDetailSheet
                isOpen={detailSheetOpen}
                onClose={() => setDetailSheetOpen(false)}
                task={selectedTask}
                currentUser={currentUser}
                assignedUserName={selectedTaskMeta.assignedUserName}
                createdByName={selectedTaskMeta.createdByName}
                onStartExecution={handleStartExecution}
                onFinishTask={handleOpenCompletion}
                onReportProblem={handleOpenProblemReport}
                onStartTriage={handleStartTriage}
                onApproveTask={handleOpenApproval}
                onArchiveTask={async () => {
                    if (!selectedTask) return;
                    if (confirm('Tem certeza que deseja arquivar esta tarefa?')) {
                        await supabase.from('tasks').update({ archived: true }).eq('id', selectedTask.id);
                        handleSuccess();
                        setDetailSheetOpen(false);
                    }
                }}
            />
        </div>
    );
};
