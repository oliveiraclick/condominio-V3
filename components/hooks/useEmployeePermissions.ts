import { useCallback, useMemo } from 'react';
import { EmployeeModule, EmployeePermissions } from '../types/employee';

/**
 * Hook para gerenciar permissões de funcionários
 * Verifica se um funcionário tem acesso a módulos específicos
 */
export function useEmployeePermissions(user: any) {
    const permissions: EmployeePermissions = useMemo(() => {
        if (!user || user.role !== 'employee') {
            return {};
        }
        return user.permissions || {};
    }, [user]);

    const hasPermission = useCallback(
        (module: EmployeeModule): boolean => {
            return permissions[module] === true;
        },
        [permissions]
    );

    const hasAnyPermission = useCallback(
        (modules: EmployeeModule[]): boolean => {
            return modules.some((module) => hasPermission(module));
        },
        [hasPermission]
    );

    const hasAllPermissions = useCallback(
        (modules: EmployeeModule[]): boolean => {
            return modules.every((module) => hasPermission(module));
        },
        [hasPermission]
    );

    // Atalhos para módulos comuns
    const canAccessTasks = hasPermission('tasks');
    const canAccessPackages = hasPermission('packages');
    const canAccessCommunication = hasPermission('communication');
    const canApprove = hasPermission('approvals');
    const canAccessFinance = hasPermission('finance');
    const canAccessControl = hasPermission('access');
    const canAccessReservations = hasPermission('reservations');
    const canAccessSettings = hasPermission('settings');

    // Lista de módulos permitidos
    const allowedModules = useMemo(() => {
        return Object.keys(permissions).filter(
            (key) => permissions[key as EmployeeModule] === true
        ) as EmployeeModule[];
    }, [permissions]);

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canAccessTasks,
        canAccessPackages,
        canAccessCommunication,
        canApprove,
        canAccessFinance,
        canAccessControl,
        canAccessReservations,
        canAccessSettings,
        allowedModules,
    };
}
