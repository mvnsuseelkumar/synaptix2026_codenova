import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className={`relative p-2 rounded-xl backdrop-blur-sm border transition-all duration-300 ${theme === 'dark' ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                <Sun className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-500 ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                <Moon className={`absolute inset-0 w-5 h-5 text-blue-300 transition-all duration-500 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
            </div>
        </button>
    );
}
