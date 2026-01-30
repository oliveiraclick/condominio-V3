import React from 'react';
import { colors, radius, shadow, spacing } from './tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, className, ...props }) => {
    return (
        <div
            style={{
                backgroundColor: 'white',
                borderRadius: radius.xl,
                padding: spacing.lg,
                boxShadow: shadow.sm,
                border: `1px solid ${colors.neutral[100]}`,
                position: 'relative',
                overflow: 'hidden',
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};
