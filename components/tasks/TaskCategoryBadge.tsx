import React from 'react';
import { Wrench, Sparkles, Shield, Building2, MoreHorizontal } from 'lucide-react';
import { colors, radius, spacing } from '../design-system/tokens';

interface TaskCategoryBadgeProps {
    category: 'manutencao' | 'limpeza' | 'seguranca' | 'infraestrutura' | 'outros';
    size?: 'sm' | 'md';
}

const CATEGORY_CONFIG = {
    manutencao: {
        label: 'Manutenção',
        icon: Wrench,
        color: colors.brand[700],
        bg: colors.brand[50],
    },
    limpeza: {
        label: 'Limpeza',
        icon: Sparkles,
        color: '#10b981', // green/success hex
        bg: '#ecfdf5',
    },
    seguranca: {
        label: 'Segurança',
        icon: Shield,
        color: colors.danger,
        bg: '#fee2e2',
    },
    infraestrutura: {
        label: 'Infraestrutura',
        icon: Building2,
        color: '#7c3aed', // purple hex
        bg: '#f5f3ff',
    },
    outros: {
        label: 'Outros',
        icon: MoreHorizontal,
        color: colors.neutral[600],
        bg: colors.neutral[100],
    },
};

export const TaskCategoryBadge: React.FC<TaskCategoryBadgeProps> = ({ category, size = 'md' }) => {
    const config = CATEGORY_CONFIG[category];
    const Icon = config.icon;

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
            <Icon size={size === 'sm' ? 14 : 16} />
            {config.label}
        </span>
    );
};
