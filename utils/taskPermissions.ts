/**
 * Task Management Permission Helpers
 * Centralized permission logic for task module access control
 */

export interface User {
    id: string;
    role: 'resident' | 'professional' | 'admin' | 'super_admin' | 'employee' | 'board';
    [key: string]: any;
}

/**
 * Check if user can access the Task Management module
 * Authorized roles: admin, super_admin, employee, board
 */
export const canAccessTasks = (user: User | null | undefined): boolean => {
    if (!user || !user.role) return false;
    return ['admin', 'super_admin', 'employee', 'board'].includes(user.role);
};

/**
 * Check if user can create new tasks
 * Authorized roles: admin, super_admin, employee
 */
export const canCreateTask = (user: User | null | undefined): boolean => {
    if (!user || !user.role) return false;
    return ['admin', 'super_admin', 'employee'].includes(user.role);
};

/**
 * Check if user can perform triage operations
 * Authorized roles: admin, super_admin, employee
 */
export const canTriageTasks = (user: User | null | undefined): boolean => {
    if (!user || !user.role) return false;
    return ['admin', 'super_admin', 'employee'].includes(user.role);
};

/**
 * Check if user can execute tasks
 * Authorized roles: admin, super_admin, employee
 */
export const canExecuteTasks = (user: User | null | undefined): boolean => {
    if (!user || !user.role) return false;
    return ['admin', 'super_admin', 'employee'].includes(user.role);
};

/**
 * Check if user can approve tasks
 * Authorized roles: admin, super_admin, board
 */
export const canApproveTasks = (user: User | null | undefined): boolean => {
    if (!user || !user.role) return false;
    return ['admin', 'super_admin', 'board'].includes(user.role);
};

/**
 * Get user's permission level for tasks
 * Returns: 'none' | 'view' | 'operational' | 'management'
 */
export const getTaskPermissionLevel = (user: User | null | undefined): 'none' | 'view' | 'operational' | 'management' => {
    if (!user || !user.role) return 'none';

    const role = user.role;

    // Management level: full access including approvals
    if (['admin', 'super_admin'].includes(role)) {
        return 'management';
    }

    // Operational level: can create, triage, execute
    if (role === 'employee') {
        return 'operational';
    }

    // View level: can view and approve only
    if (role === 'board') {
        return 'view';
    }

    // No access
    return 'none';
};
