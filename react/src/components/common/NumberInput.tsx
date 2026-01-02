import React, { useState, useEffect } from 'react';
import type { FocusEvent, ChangeEvent, ReactNode } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    containerClassName?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    className = "",
    label,
    leftIcon,
    rightIcon,
    containerClassName = "",
    ...props
}) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Sync internal display value with external value prop
    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(value === 0 && !props.required ? '' : value.toLocaleString());
        }
    }, [value, isFocused, props.required]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');

        // Allow empty string for better UX while deleting
        if (rawValue === '') {
            setDisplayValue('');
            onChange(0);
            return;
        }

        // Only allow valid numbers
        if (!/^\d*$/.test(rawValue)) return;

        setDisplayValue(rawValue);
        onChange(Number(rawValue));
    };

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        setDisplayValue(value === 0 ? '' : value.toString());
        props.onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setDisplayValue(value.toLocaleString());
        props.onBlur?.(e);
    };

    return (
        <div className={`space-y-1 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    {label} {props.required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    {...props}
                    type="text"
                    inputMode="numeric"
                    className={`
                        w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl
                        text-text-main placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                        transition-all duration-200 font-medium
                        ${leftIcon ? 'pl-10' : ''}
                        ${rightIcon ? 'pr-10' : ''}
                        ${className}
                    `}
                    value={displayValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {rightIcon}
                    </div>
                )}
            </div>
        </div>
    );
};
