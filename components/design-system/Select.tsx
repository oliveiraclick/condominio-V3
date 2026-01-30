import React from 'react';
import { colors, radius, spacing } from './tokens';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options?: (string | { label: string; value: string })[];
    helperText?: string;
}

export const DSSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options = [], helperText, style, className, ...props }, ref) => {
        return (
            <div style={{ width: '100%', marginBottom: spacing.md }}>
                {label && (
                    <label
                        style={{
                            display: 'block',
                            marginBottom: spacing.xs,
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: error ? colors.danger : colors.neutral[500],
                            marginLeft: spacing.xs,
                        }}
                    >
                        {label}
                    </label>
                )}
                <div style={{ position: 'relative' }}>
                    <select
                        ref={ref}
                        {...props}
                        style={{
                            width: '100%',
                            height: 56,
                            appearance: 'none',
                            backgroundColor: colors.neutral[50],
                            border: `1px solid ${error ? colors.danger : colors.neutral[200]}`,
                            borderRadius: radius.xl,
                            padding: `0 ${spacing.xl} 0 ${spacing.md}`,
                            fontSize: 14,
                            fontWeight: 600,
                            color: colors.neutral[900],
                            outline: 'none',
                            cursor: 'pointer',
                            ...style,
                        }}
                    >
                        {options.map((opt, i) => {
                            const isString = typeof opt === 'string';
                            const value = isString ? opt : opt.value;
                            const label = isString ? opt : opt.label;
                            return (
                                <option key={i} value={value}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                    <div
                        style={{
                            position: 'absolute',
                            right: spacing.md,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: colors.neutral[500],
                        }}
                    >
                        <ChevronDown size={20} />
                    </div>
                </div>
                {(error || helperText) && (
                    <div style={{ paddingLeft: spacing.xs, marginTop: 4, fontSize: 11, color: error ? colors.danger : colors.neutral[400] }}>
                        {error || helperText}
                    </div>
                )}
            </div>
        );
    }
);

DSSelect.displayName = 'DSSelect';
