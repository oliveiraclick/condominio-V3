
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { colors, radius, shadow, spacing } from './tokens';
import { Title, Text } from './Typography';

interface SheetProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    height?: string | number;
}

export const Sheet: React.FC<SheetProps> = ({
    open,
    onClose,
    title,
    subtitle,
    children,
    height = 'auto',
}) => {
    const [isVisible, setIsVisible] = useState(open);

    useEffect(() => {
        if (open) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    if (!isVisible && !open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pointerEvents: open ? 'auto' : 'none',
                isolation: 'isolate',
            }}
        >
            {/* BACKDROP */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    opacity: open ? 1 : 0,
                    transition: 'opacity 300ms ease',
                    zIndex: -1,
                }}
            />

            {/* SHEET CONTENT */}
            <div
                style={{
                    width: '100%',
                    maxWidth: 480,
                    background: 'white',
                    borderTopLeftRadius: radius.xl,
                    borderTopRightRadius: radius.xl,
                    boxShadow: shadow.xl,
                    padding: spacing.xl,
                    paddingBottom: `calc(${spacing.xl} + env(safe-area-inset-bottom))`,
                    transform: open ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                    maxHeight: '90vh',
                    height: height === 'auto' ? 'auto' : height,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* HEADER */}
                {(title || subtitle) && (
                    <div style={{ marginBottom: spacing.lg, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            {title && <Title level={3}>{title}</Title>}
                            {subtitle && <Text variant="caption">{subtitle}</Text>}
                        </div>

                        <button
                            onClick={onClose}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: radius.md,
                                background: colors.neutral[100],
                                color: colors.neutral[600],
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};
