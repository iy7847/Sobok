
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    className = '',
    containerClassName = '',
    id,
    ...props
}) => {
    const inputId = id || React.useId();

    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-bold text-text-muted uppercase tracking-wider pl-1"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
                        w-full bg-white dark:bg-white/5 
                        border border-gray-200 dark:border-white/10 
                        rounded-xl px-4 py-2.5
                        text-text-main placeholder:text-gray-400 dark:placeholder:text-gray-600
                        outline-none transition-all duration-200
                        focus:border-primary focus:ring-2 focus:ring-primary/10
                        disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-white/10
                        ${leftIcon ? 'pl-10' : ''}
                        ${rightIcon ? 'pr-10' : ''}
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
                        ${props.type === 'number' ? 'font-mono' : ''}
                        ${className}
                        appearance-none
                        [&::-webkit-calendar-picker-indicator]:opacity-50
                        [&::-webkit-calendar-picker-indicator]:hover:opacity-100
                        dark:[&::-webkit-calendar-picker-indicator]:invert
                    `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
            {helperText && !error && <p className="text-xs text-text-muted pl-1">{helperText}</p>}
        </div>
    );
};

export default Input;
