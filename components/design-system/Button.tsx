import React from "react";
import { colors, radius, shadow } from "./tokens";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
};

const baseStyle: React.CSSProperties = {
    borderRadius: radius.lg,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    transition: "transform 120ms ease, box-shadow 180ms ease, background-color 180ms ease, border-color 180ms ease, color 180ms ease, opacity 180ms ease",
    outline: "none",
    border: "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
};

const sizes: Record<ButtonSize, React.CSSProperties> = {
    sm: { height: 40, padding: "0 14px", fontSize: 12 },
    md: { height: 52, padding: "0 18px", fontSize: 13 },
    lg: { height: 60, padding: "0 22px", fontSize: 14 },
};

const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
        backgroundColor: colors.brand[600],
        color: "white",
        boxShadow: shadow.md,
    },
    secondary: {
        backgroundColor: colors.neutral[100],
        color: colors.neutral[900],
        borderColor: colors.neutral[200],
        boxShadow: shadow.sm,
    },
    ghost: {
        backgroundColor: "transparent",
        color: colors.neutral[900],
        borderColor: colors.neutral[200],
        boxShadow: "none",
    },
    danger: {
        backgroundColor: colors.danger,
        color: "white",
        boxShadow: shadow.md,
    },
};

export const DSButton: React.FC<Props> = ({
    variant = "primary",
    size = "md",
    fullWidth,
    leftIcon,
    rightIcon,
    disabled,
    style,
    children,
    ...rest
}) => {
    const [pressed, setPressed] = React.useState(false);

    const merged: React.CSSProperties = {
        ...baseStyle,
        ...sizes[size],
        ...variants[variant],
        width: fullWidth ? "100%" : undefined,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: pressed && !disabled ? "scale(0.98)" : "scale(1)",
        ...style,
    };

    const onMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        const el = e.currentTarget;

        if (variant === "primary" || variant === "danger") {
            el.style.boxShadow = shadow.lg;
        } else if (variant === "secondary") {
            el.style.boxShadow = shadow.md;
            el.style.backgroundColor = colors.neutral[50];
        } else if (variant === "ghost") {
            el.style.backgroundColor = colors.neutral[50];
        }
    };

    const onMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        const el = e.currentTarget;

        el.style.boxShadow = String((variants[variant] as any).boxShadow || "none");
        el.style.backgroundColor = String((variants[variant] as any).backgroundColor || "transparent");
    };

    return (
        <button
            {...rest}
            disabled={disabled}
            style={merged}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseDown={() => !disabled && setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseCancel={() => setPressed(false)}
            onTouchStart={() => !disabled && setPressed(true)}
            onTouchEnd={() => setPressed(false)}
        >
            {leftIcon ? <span style={{ display: "inline-flex" }}>{leftIcon}</span> : null}
            <span style={{ lineHeight: 1 }}>{children}</span>
            {rightIcon ? <span style={{ display: "inline-flex" }}>{rightIcon}</span> : null}
        </button>
    );
};
