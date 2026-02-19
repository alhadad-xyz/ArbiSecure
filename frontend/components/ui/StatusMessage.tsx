import { ReactNode } from 'react';

type StatusMessageVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral';

interface StatusMessageProps {
    variant?: StatusMessageVariant;
    title?: string;
    message: string | ReactNode;
    className?: string;
}

const variantStyles: Record<StatusMessageVariant, { bg: string; border: string; text: string }> = {
    info: {
        bg: 'bg-blue-500/5',
        border: 'border-blue-500/20',
        text: 'text-blue-400'
    },
    success: {
        bg: 'bg-green-500/5',
        border: 'border-green-500/20',
        text: 'text-green-400'
    },
    warning: {
        bg: 'bg-yellow-500/5',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400'
    },
    error: {
        bg: 'bg-red-500/5',
        border: 'border-red-500/20',
        text: 'text-red-400'
    },
    neutral: {
        bg: 'bg-purple-500/5',
        border: 'border-purple-500/20',
        text: 'text-purple-400'
    }
};

export default function StatusMessage({
    variant = 'info',
    title,
    message,
    className = ''
}: StatusMessageProps) {
    const styles = variantStyles[variant];

    return (
        <div className={`text-center py-8 ${styles.bg} border ${styles.border} rounded-2xl ${className}`}>
            {title && (
                <p className={`${styles.text} font-mono text-lg font-bold mb-2`}>
                    {title}
                </p>
            )}
            <p className={`${styles.text} font-mono text-sm`}>
                {message}
            </p>
        </div>
    );
}
