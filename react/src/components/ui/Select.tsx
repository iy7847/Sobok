
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string;
    options: SelectOption[];
    error?: string;
    containerClassName?: string;
}

const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    className = '',
    containerClassName = '',
    id,
    ...props
}) => {
    const selectId = id || React.useId();

    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-xs font-bold text-text-muted uppercase tracking-wider pl-1"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={selectId}
                    className={`
                        w-full bg-white dark:bg-white/5 
                        border border-gray-200 dark:border-white/10 
                        rounded-xl px-3 py-2 pr-8
                        text-text-main 
                        outline-none transition-all duration-200
                        focus:border-primary focus:ring-2 focus:ring-primary/10
                        appearance-none cursor-pointer
                        disabled:opacity-50
                        ${error ? 'border-red-500 focus:border-red-500' : ''}
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-white dark:bg-slate-800 text-text-main py-2"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <ChevronDown size={16} />
                </div>
            </div>
            {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
        </div>
    );
};

export default Select;
