export interface Task {
    id: string;
    title: string;
    description: string | null;
    category: 'manutencao' | 'limpeza' | 'seguranca' | 'infraestrutura' | 'outros';
    priority: 'baixa' | 'normal' | 'alta' | 'urgente';
    status: 'open' | 'analysis' | 'approval' | 'in_progress' | 'done';
    requires_approval: boolean;
    approved_at: string | null;
    approved_by: string | null;
    created_by: string;
    assigned_to: string | null;
    created_at: string;
    updated_at: string;
    due_date: string | null;
    finished_at: string | null;
    location: string | null;
    unit: string | null;
    tower: string | null;
    archived: boolean;
}

export const STATUS_TRANSITIONS: Record<Task['status'], Task['status'][]> = {
    open: ['analysis'],
    analysis: ['approval', 'in_progress'], // Can skip approval
    approval: ['in_progress', 'analysis'], // Can go back if rejected
    in_progress: ['done', 'analysis'], // Can reopen for re-analysis
    done: ['in_progress'], // Can reopen if needed
};

export const STATUS_LABELS: Record<Task['status'], string> = {
    open: 'Aberto',
    analysis: 'Em Análise',
    approval: 'Aguardando Aprovação',
    in_progress: 'Em Execução',
    done: 'Concluído',
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
