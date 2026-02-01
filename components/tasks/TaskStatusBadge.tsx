import React from 'react';
import { colors, radius, spacing } from '../design-system/tokens';

interface TaskStatusBadgeProps {
    status: 'open' | 'analysis' | 'approval' | 'in_progress' | 'done';
    size?: 'sm' | 'md';
}

const STATUS_CONFIG = {
    open: {
        label: 'Aberto',
        color: colors.neutral[700],
        bg: colors.neutral[100],
    },
    analysis: {
        label: 'Em Análise',
        color: colors.brand[700],
        bg: colors.brand[50],
    },
    approval: {
        label: 'Aguardando Aprovação',
        color: '#d97706',
        bg: '#fef3c7',
    },
    in_progress: {
        label: 'Em Execução',
        color: colors.brand[700],
        bg: colors.brand[100],
    },
    done: {
        label: 'Concluído',
        color: colors.success,
        bg: '#d1fae5',
    },
};

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, size = 'md' }) => {
    const config = STATUS_CONFIG[status];

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
