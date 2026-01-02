import React from 'react';
import { HelpCircle } from 'lucide-react';
import Button from '../ui/Button';

interface GuideButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick: () => void;
    label?: string;
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

export const GuideButton: React.FC<GuideButtonProps> = ({
    onClick,
    label = "가이드",
    variant = 'secondary',
    className = "",
    ...props
}) => {
    return (
        <Button
            variant={variant}
            size="sm"
            onClick={onClick}
            className={`
                rounded-full px-3 py-1 text-xs font-bold 
                ${variant === 'secondary' ? 'bg-primary/10 text-primary hover:bg-primary/20 border-transparent' : ''}
                ${className}
            `}
            leftIcon={<HelpCircle size={14} />}
            {...props}
        >
            {label}
        </Button>
    );
};
