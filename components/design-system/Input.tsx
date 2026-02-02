import React from 'react';
import { colors, radius, spacing } from './tokens';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    multiline?: boolean;
    helperText?: string;
}

export const DSInput = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps & { fullWidth?: boolean }>(
    ({ label, error, startIcon, endIcon, leftIcon, multiline, helperText, style, className, fullWidth, ...props }, ref) => {
        const [focused, setFocused] = React.useState(false);
        const [showPassword, setShowPassword] = React.useState(false);

        const Component = multiline ? 'textarea' : 'input';
        const isPassword = props.type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

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
                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: multiline ? 'flex-start' : 'center',
                        backgroundColor: colors.neutral[50],
                        border: `1px solid ${error ? colors.danger : focused ? colors.brand[500] : colors.neutral[200]}`,
                        borderRadius: radius.xl,
                        transition: 'all 0.2s ease',
                        overflow: 'hidden',
                        boxShadow: focused ? `0 0 0 3px ${error ? colors.danger + '20' : colors.brand[500] + '20'}` : 'none',
                    }}
                >
                    {(startIcon || leftIcon) && (
                        <div style={{ paddingLeft: spacing.md, paddingRight: spacing.xs, color: colors.neutral[400], display: 'flex', alignItems: 'center', height: multiline ? 48 : '100%', paddingTop: multiline ? 14 : 0 }}>
                            {startIcon || leftIcon}
                        </div>
                    )}
                    <Component
                        ref={ref as any}
                        {...props}
                        type={inputType}
                        onFocus={(e) => {
                            setFocused(true);
                            props.onFocus?.(e as any);
                        }}
                        onBlur={(e) => {
                            setFocused(false);
                            props.onBlur?.(e as any);
                        }}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            padding: spacing.md,
                            paddingLeft: startIcon ? 0 : spacing.md,
                            paddingRight: (endIcon || isPassword) ? 0 : spacing.md,
                            color: colors.neutral[900],
                            fontSize: 14,
                            fontWeight: 500,
                            minHeight: multiline ? 120 : 56,
                            resize: multiline ? 'vertical' : 'none',
                            fontFamily: 'inherit',
                            ...style,
                        }}
                    />
                    {(endIcon || isPassword) && (
                        <div style={{ paddingRight: spacing.md, paddingLeft: spacing.xs, color: colors.neutral[400], display: 'flex', alignItems: 'center', height: multiline ? 48 : '100%', paddingTop: multiline ? 14 : 0 }}>
                            {endIcon}
                            {isPassword && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        padding: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: colors.neutral[400]
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        </div>
                    )}
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

DSInput.displayName = 'DSInput';
