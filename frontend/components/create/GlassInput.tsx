"use client";

interface GlassInputProps {
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    isHuge?: boolean;
    autoFocus?: boolean;
    error?: string;
}

export default function GlassInput({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    isHuge = false,
    autoFocus = false,
    error
}: GlassInputProps) {
    return (
        <div className="relative group">
            {label && (
                <label className="text-sm font-mono text-gray-500 uppercase block mb-2">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={`w-full bg-transparent border-b ${error ? 'border-red-500' : 'border-white/20'} text-white placeholder-white/20 focus:outline-none ${error ? 'focus:border-red-400' : 'focus:border-white'} transition-all duration-300 pb-2 font-mono ${isHuge ? 'text-5xl' : 'text-lg'} 
                [appearance:textfield] 
                [&::-webkit-outer-spin-button]:appearance-none 
                [&::-webkit-inner-spin-button]:appearance-none`}
            />
            {error && (
                <p className="text-xs text-red-400 mt-1 font-mono">⚠️ {error}</p>
            )}
        </div>
    );
}
