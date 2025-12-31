import React, { useState, useEffect } from 'react';
import type { FocusEvent, ChangeEvent } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: number;
    onChange: (value: number) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, className, ...props }) => {
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
        <input
            {...props}
            type="text"
            inputMode="numeric"
            className={className}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
};
