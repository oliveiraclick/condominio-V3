export interface Task {
    id: string;
    title: string;
    description: string | null;
    category: 'manutencao' | 'limpeza' | 'seguranca' | 'infraestrutura' | 'outros';
    priority: 'baixa' | 'normal' | 'alta' | 'urgente';
    status: 'new' | 'evaluating' | 'executing' | 'finished';
    requires_approval: boolean;
    approved_at: string | null;
    approved_by: string | null;
    problem_reported: boolean;
    problem_reason: string | null;
    created_by: string;
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
    started_at: string | null;
    due_date: string | null;
    finished_at: string | null;
    location: string | null;
    unit: string | null;
    tower: string | null;
    archived: boolean;
    needs_quote?: boolean;
    in_stock?: boolean;
    estimated_cost?: number;
    estimated_time?: string;
    analysis_comments?: string;
}

export const STATUS_TRANSITIONS: Record<Task['status'], Task['status'][]> = {
    new: ['evaluating', 'executing'],
    evaluating: ['executing'],
    executing: ['finished', 'evaluating'], // evaluating = problem reported
    finished: ['executing'], // Can reopen
};

export const STATUS_LABELS: Record<Task['status'], string> = {
    new: 'Novos Chamados',
    evaluating: 'Em Avaliação',
    executing: 'Em Execução',
    finished: 'Finalizados',
};

export const PRIORITY_LABELS: Record<Task['priority'], string> = {
    baixa: 'Baixa',
    normal: 'Normal',
    alta: 'Alta',
    urgente: 'Urgente',
};

export const CATEGORY_LABELS: Record<Task['category'], string> = {
    manutencao: 'Manutenção',
    limpeza: 'Limpeza',
    seguranca: 'Segurança',
    infraestrutura: 'Infraestrutura',
    outros: 'Outros',
};

// Helper: Determine if a task is technically finished but waiting for approval
export const isPendingApproval = (task: Task): boolean => {
    // Status is 'finished' AND requires approval AND not yet approved
    return task.status === 'finished' && task.requires_approval && !task.approved_at;
};

// Helper: Determine if a task is fully approved/completed
export const isFullyCompleted = (task: Task): boolean => {
    if (task.status !== 'finished') return false;
    if (task.requires_approval && !task.approved_at) return false;
    return true;
};

