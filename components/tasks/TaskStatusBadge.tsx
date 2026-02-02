import React from 'react';
import { colors, radius, spacing } from '../design-system/tokens';
import { Task } from '../../types/tasks';

interface TaskStatusBadgeProps {
    status: Task['status'];
    size?: 'sm' | 'md';
}

const STATUS_CONFIG = {
    new: {
        label: 'Novo',
        color: colors.neutral[700],
        bg: colors.neutral[100],
    },
    evaluating: {
        label: 'Em Análise',
        color: colors.brand[700],
        bg: colors.brand[50],
    },
    executing: {
        label: 'Em Execução',
        color: colors.brand[700],
        bg: colors.brand[100],
    },
    finished: {
        label: 'Concluído',
        color: colors.success[700],
        bg: colors.success[50],
    },
};

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, size = 'md' }) => {
    // Fallback for safety if an invalid status is passed
    const config = STATUS_CONFIG[status] || {
        label: status,
        color: colors.neutral[600],
        bg: colors.neutral[100]
    };

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: size === 'sm' ? `${spacing.xs} ${spacing.sm}` : `${spacing.sm} ${spacing.md}`,
                backgroundColor: config.bg,
                color: config.color,
                borderRadius: radius.pill,
                fontSize: size === 'sm' ? '12px' : '14px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
            }}
        >
            {config.label}
        </span>
    );
};
