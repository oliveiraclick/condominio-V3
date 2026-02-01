import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Task } from '../types/tasks';
import { packagesCache } from '../cache/packagesCache';
import { TasksKanbanView } from '../components/tasks/TasksKanbanView';
import { TaskCreateFlow } from '../components/tasks/TaskCreateFlow';
import { TaskTriageFlow } from '../components/tasks/TaskTriageFlow';
import { TaskAnalysisFlow } from '../components/tasks/TaskAnalysisFlow';
import { TaskExecutionFlow } from '../components/tasks/TaskExecutionFlow';
import { TaskDetailSheet } from '../components/tasks/TaskDetailSheet';

interface TasksProps {
    session: any;
    currentUser?: any;
}

export const Tasks: React.FC<TasksProps> = ({ session, currentUser }) => {
    const [createFlowOpen, setCreateFlowOpen] = useState(false);
    const [triageFlowOpen, setTriageFlowOpen] = useState(false);
    const [analysisFlowOpen, setAnalysisFlowOpen] = useState(false); // Add state
    const [executionFlowOpen, setExecutionFlowOpen] = useState(false);
    const [executionMode, setExecutionMode] = useState<'complete' | 'return'>('complete');
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedTaskMeta, setSelectedTaskMeta] = useState<{ assignedUserName?: string, createdByName?: string }>({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const activeUser = currentUser || session?.user;

    const handleTaskClick = (task: Task, assignedUserName?: string, createdByName?: string) => {
        setSelectedTask(task);
        setSelectedTaskMeta({ assignedUserName, createdByName });
        setDetailSheetOpen(true);
    };

    const handleStartTriage = () => {
        setDetailSheetOpen(false);
        setTriageFlowOpen(true);
    };

    const handleCompleteTask = async (notes: string) => {
        if (!selectedTask || !notes.trim()) return;

        try {
            const updates: any = {
                status: 'done',
                finished_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                description: selectedTask.description
                    ? `${selectedTask.description}\n\n--- RESOLUÇÃO ---\n${notes}`
                    : notes
            };

            const { error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', selectedTask.id);

            if (error) throw error;

            // Invalidate cache to ensure board updates immediately
            packagesCache.invalidate('tasks:all');

            setDetailSheetOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error completing task:', error);
            alert('Erro ao concluir tarefa');
        }
    };

    const handleReportIssue = async (notes: string, supervisorId?: string) => {
        if (!selectedTask || !notes.trim() || !supervisorId) return;

        try {
            const updates: any = {
                status: 'analysis',
                assigned_to: supervisorId,
                updated_at: new Date().toISOString(),
                description: selectedTask.description
                    ? `${selectedTask.description}\n\n--- PROBLEMA REPORTADO ---\n${notes}`
                    : notes
            };

            const { error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', selectedTask.id);

            if (error) throw error;

            // Invalidate cache
            packagesCache.invalidate('tasks:all');

            setDetailSheetOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error reporting task:', error);
            alert('Erro ao reportar problema');
        }
    };

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleStartAnalysis = () => {
        setDetailSheetOpen(false);
        setAnalysisFlowOpen(true);
    };

    return (
        <div>
            {/* Main Kanban View */}
            <TasksKanbanView
                key={refreshTrigger}
                currentUser={activeUser}
                onCreateTask={() => setCreateFlowOpen(true)}
                onTaskClick={handleTaskClick}
            />

            {/* Create Flow */}
            <TaskCreateFlow
                open={createFlowOpen}
                onClose={() => setCreateFlowOpen(false)}
                currentUser={activeUser}
                onSuccess={handleSuccess}
            />

            {/* Triage Flow */}
            <TaskTriageFlow
                open={triageFlowOpen}
                onClose={() => setTriageFlowOpen(false)}
                task={selectedTask}
                currentUser={activeUser}
                onSuccess={handleSuccess}
            />

            {/* Analysis Flow */}
            <TaskAnalysisFlow
                open={analysisFlowOpen}
                onClose={() => setAnalysisFlowOpen(false)}
                task={selectedTask}
                currentUser={activeUser}
                onSuccess={handleSuccess}
            />

            {/* Detail Sheet */}
            <TaskDetailSheet
                open={detailSheetOpen}
                onClose={() => setDetailSheetOpen(false)}
                task={selectedTask}
                currentUser={activeUser}
                onStartTriage={handleStartTriage}
                onStartAnalysis={handleStartAnalysis}
                onCompleteTask={handleCompleteTask}
                onReportIssue={handleReportIssue}
                onSuccess={handleSuccess}
                assignedUserName={selectedTaskMeta.assignedUserName}
                createdByName={selectedTaskMeta.createdByName}
            />
        </div>
    );
};
