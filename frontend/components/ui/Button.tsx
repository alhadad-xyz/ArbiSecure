import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

export type ButtonVariant = 'primary' | 'danger' | 'success' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    uppercase?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-white text-black hover:bg-gray-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] relative overflow-hidden group',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
    success: 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20',
    secondary: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20',
    ghost: 'bg-transparent text-gray-400 hover:text-white border-none'
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
};

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    uppercase = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = 'font-header font-bold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95';
    const widthStyles = fullWidth ? 'w-full' : '';
    const textStyles = uppercase ? 'uppercase tracking-wider' : '';

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${textStyles} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {/* Shine effect for primary buttons */}
            {variant === 'primary' && !loading && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
            )}

            {/* Content */}
            <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {icon && iconPosition === 'left' && icon}
                        {children}
                        {icon && iconPosition === 'right' && icon}
                    </>
                )}
            </span>
        </button>
    );
}
