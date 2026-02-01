import React from 'react';
import { colors, radius, spacing } from '../design-system/tokens';

interface TaskPriorityBadgeProps {
    priority: 'baixa' | 'normal' | 'alta' | 'urgente';
    size?: 'sm' | 'md';
}

const PRIORITY_CONFIG = {
    baixa: {
        label: 'Baixa',
        color: colors.neutral[600],
        bg: colors.neutral[100],
        icon: '🟢',
    },
    normal: {
        label: 'Normal',
        color: colors.brand[700],
        bg: colors.brand[50],
        icon: '🔵',
    },
    alta: {
        label: 'Alta',
        color: '#d97706', // warning hex
        bg: '#fef3c7',
        icon: '🟡',
    },
    urgente: {
        label: 'Urgente',
        color: colors.danger,
        bg: '#fee2e2', // danger light bg
        icon: '🔴',
    },
};

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority, size = 'md' }) => {
    const config = PRIORITY_CONFIG[priority];

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing.xs,
                padding: size === 'sm' ? `${spacing.xs} ${spacing.sm}` : `${spacing.sm} ${spacing.md}`,
                backgroundColor: config.bg,
                color: config.color,
                borderRadius: radius.pill,
                fontSize: size === 'sm' ? '12px' : '14px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
            }}
        >
            <span>{config.icon}</span>
            {config.label}
        </span>
    );
};
