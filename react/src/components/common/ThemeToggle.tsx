
import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg backdrop-blur-sm border border-gray-200 dark:border-white/5 mx-4">
            <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center p-2 rounded-md transition-all ${theme === 'light'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-text-muted hover:text-primary dark:hover:text-white'
                    }`}
                title="라이트 모드"
            >
                <Sun size={18} />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center p-2 rounded-md transition-all ${theme === 'dark'
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-text-muted hover:text-primary dark:hover:text-white'
                    }`}
                title="다크 모드"
            >
                <Moon size={18} />
            </button>
            <button
                onClick={() => setTheme('system')}
                className={`flex-1 flex items-center justify-center p-2 rounded-md transition-all ${theme === 'system'
                    ? 'bg-indigo-500/20 text-primary shadow-sm border border-primary/20'
                    : 'text-text-muted hover:text-primary dark:hover:text-white'
                    }`}
                title="시스템 설정"
            >
                <Monitor size={18} />
            </button>
        </div>
    );
};

export default ThemeToggle;
