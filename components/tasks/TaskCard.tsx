import React from 'react';
import { Clock, MapPin, User, ChevronRight } from 'lucide-react';
import { Task } from '../../types/tasks';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskCategoryBadge } from './TaskCategoryBadge';
import { colors, radius, spacing, shadow } from '../design-system/tokens';
import { Text } from '../design-system/Typography';

interface TaskCardProps {
    task: Task;
    onClick: () => void;
    assignedUserName?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, assignedUserName }) => {
    const isOverdue = task.due_date ? new Date(task.due_date) < new Date() && task.status !== 'done' : false;

    const getDeadlineText = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dateStr);
        due.setHours(0, 0, 0, 0);

        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return `${Math.abs(diffDays)}d atrasado`;
        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return '1 dia';
        return `${diffDays} dias`;
    };

    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: isOverdue ? '#fef2f2' : '#ffffff',
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
                boxShadow: shadow.sm,
                cursor: 'pointer',
                border: isOverdue ? `1px solid ${colors.danger}` : `1px solid ${colors.neutral[200]}`,
                transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.boxShadow = shadow.md;
                target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.boxShadow = shadow.sm;
                target.style.transform = 'translateY(0)';
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                <Text weight="bold" color={isOverdue ? 'danger' : 'primary'} style={{ fontSize: '16px', lineHeight: '1.2' }}>
                    {task.title}
                </Text>
                {task.due_date && (
                    <div style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.xs,
                        padding: '4px 8px',
                        borderRadius: radius.md,
                        backgroundColor: isOverdue ? colors.danger : colors.brand[50],
                        color: isOverdue ? '#ffffff' : colors.brand[700],
                        fontSize: '11px',
                        fontWeight: 700,
                        marginLeft: spacing.sm
                    }}>
                        <Clock size={12} />
                        <span>{getDeadlineText(task.due_date)}</span>
                    </div>
                )}
            </div>

            {/* Description - Optional/Truncated */}
            {task.description && (
                <Text
                    color="secondary"
                    style={{
                        marginBottom: spacing.md,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        fontSize: '13px',
                    }}
                >
                    {task.description}
                </Text>
            )}

            {/* Badges Row */}
            <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.md }}>
                <TaskCategoryBadge category={task.category} size="sm" />

                {/* Deadline Badge */}

            </div>

            {/* Footer with Metadata */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: spacing.xs,
                borderTop: `1px solid ${colors.neutral[100]}`
            }}>
                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                    <MapPin size={12} color={colors.neutral[500]} />
                    <Text color="secondary" style={{ fontSize: '11px' }}>
                        {task.location || 'Sem local'}
                    </Text>
                </div>

                {/* Assigned User - Prominent */}
                {assignedUserName ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: colors.brand[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <User size={12} color={colors.brand[600]} />
                        </div>
                        <Text weight="bold" style={{ fontSize: '11px', color: colors.neutral[700] }}>
                            {assignedUserName.split(' ')[0]} {/* First name only for compactness */}
                        </Text>
                    </div>
                ) : (
                    <Text color="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                        Não atribuído
                    </Text>
                )}
            </div>
        </div>
    );
};
