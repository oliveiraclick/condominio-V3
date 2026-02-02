import React from 'react';
import { colors } from './tokens';

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
    level?: 1 | 2 | 3 | 4 | 5;
    className?: string; // Kept for compatibility
}

export const Title: React.FC<TitleProps> = ({
    children,
    level = 2,
    style,
    className,
    ...rest
}) => {
    const Tag = `h${level}` as any;

    // Base styles for titles
    const baseStyle: React.CSSProperties = {
        fontWeight: 800,
        color: colors.neutral[900],
        letterSpacing: '-0.02em',
        margin: 0,
        lineHeight: 1.2,
        ...(level === 1 && { fontSize: 32 }),
        ...(level === 2 && { fontSize: 24 }),
        ...(level === 3 && { fontSize: 20 }),
        ...(level === 4 && { fontSize: 18 }),
        ...(level === 5 && { fontSize: 16 }),
        ...style,
    };

    return (
        <Tag style={baseStyle} className={className} {...rest}>
            {children}
        </Tag>
    );
};

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
    variant?: 'body' | 'caption' | 'small' | 'label';
    size?: 'sm' | 'md' | 'lg'; // Kept for compatibility
    className?: string;
    weight?: 'normal' | 'medium' | 'bold' | 'black';
}

export const Text: React.FC<TextProps> = ({
    children,
    variant = 'body',
    size = 'md',
    className,
    style,
    weight,
    ...rest
}) => {

    let fontSize = 14;
    let color = colors.neutral[600];
    let fontWeight: React.CSSProperties['fontWeight'] = 400;
    let textTransform: React.CSSProperties['textTransform'] = 'none';
    let letterSpacing = 'normal';

    switch (variant) {
        case 'caption':
            fontSize = 12;
            color = colors.neutral[500];
            letterSpacing = '0.05em';
            textTransform = 'uppercase';
            fontWeight = 700;
            break;
        case 'small':
            fontSize = 13;
            break;
        case 'label':
            fontSize = 14;
            fontWeight = 600;
            color = colors.neutral[700];
            break;
        case 'body':
        default:
            if (size === 'sm') fontSize = 13;
            if (size === 'lg') fontSize = 16;
            break;
    }

    if (weight === 'bold') fontWeight = 700;
    if (weight === 'black') fontWeight = 900;
    if (weight === 'medium') fontWeight = 500;

    const mergedStyle: React.CSSProperties = {
        margin: 0,
        fontSize,
        color,
        fontWeight,
        textTransform,
        letterSpacing,
        lineHeight: 1.5,
        ...style,
    };

    return (
        <p style={mergedStyle} className={className} {...rest}>
            {children}
        </p>
    );
};
