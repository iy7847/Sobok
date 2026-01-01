
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outline';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default',
    padding = 'md',
    ...props
}) => {
    const baseStyles = "rounded-2xl overflow-hidden transition-all duration-200";

    const variants = {
        default: "bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 shadow-sm",
        glass: "glass", // Uses the .glass utility from index.css
        outline: "bg-transparent border border-gray-200 dark:border-white/10"
    };

    const paddings = {
        none: "",
        sm: "p-3 md:p-4",
        md: "p-4 md:p-6",
        lg: "p-6 md:p-8"
    };

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
