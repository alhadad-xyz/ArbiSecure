import { ReactNode } from 'react';

interface InfoCardProps {
    children: ReactNode;
    className?: string;
}

export default function InfoCard({ children, className = '' }: InfoCardProps) {
    return (
        <div className={`space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10 ${className}`}>
            {children}
        </div>
    );
}

interface InfoFieldProps {
    label: string;
    value: ReactNode;
    className?: string;
}

export function InfoField({ label, value, className = '' }: InfoFieldProps) {
    return (
        <div className={className}>
            <label className="text-xs font-mono text-gray-500 uppercase">{label}</label>
            <div className="mt-1">{value}</div>
        </div>
    );
}

interface InfoGridProps {
    children: ReactNode;
    columns?: 1 | 2 | 3;
    className?: string;
}

export function InfoGrid({ children, columns = 1, className = '' }: InfoGridProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3'
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-4 pt-4 border-t border-white/10 ${className}`}>
            {children}
        </div>
    );
}
