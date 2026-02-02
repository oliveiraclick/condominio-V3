// Módulos disponíveis para permissões de funcionários
export const EMPLOYEE_MODULES = {
    tasks: {
        key: 'tasks',
        label: 'Gerenciamento de Tarefas',
        description: 'Visualizar, criar e gerenciar tarefas do condomínio',
    },
    packages: {
        key: 'packages',
        label: 'Encomendas / Portaria',
        description: 'Registrar e gerenciar encomendas e entregas',
    },
    communication: {
        key: 'communication',
        label: 'Comunicação / Avisos',
        description: 'Criar e gerenciar avisos e comunicados',
    },
    approvals: {
        key: 'approvals',
        label: 'Aprovação de Tarefas',
        description: 'Aprovar ou rejeitar tarefas concluídas',
    },
    finance: {
        key: 'finance',
        label: 'Financeiro',
        description: 'Visualizar relatórios e dados financeiros',
    },
    access: {
        key: 'access',
        label: 'Controle de Acesso',
        description: 'Gerenciar acessos e visitantes',
    },
    reservations: {
        key: 'reservations',
        label: 'Reservas',
        description: 'Gerenciar reservas de áreas comuns',
    },
    settings: {
        key: 'settings',
        label: 'Configurações',
        description: 'Acessar configurações do sistema',
    },
} as const;

export type EmployeeModule = keyof typeof EMPLOYEE_MODULES;

// Status de funcionário
export const EMPLOYEE_STATUS = {
    active: 'Ativo',
    inactive: 'Inativo',
} as const;

export type EmployeeStatus = keyof typeof EMPLOYEE_STATUS;

// Interface para permissões
export interface EmployeePermissions {
    tasks?: boolean;
    packages?: boolean;
    communication?: boolean;
    approvals?: boolean;
    finance?: boolean;
    access?: boolean;
    reservations?: boolean;
    settings?: boolean;
}

// Interface estendida de Profile para funcionários
export interface EmployeeProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'employee';
    function?: string; // Cargo/função
    status: EmployeeStatus;
    permissions: EmployeePermissions;
    created_at: string;
    updated_at?: string;
}
