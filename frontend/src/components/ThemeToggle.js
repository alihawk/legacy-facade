import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
export function ThemeToggle({ currentTheme, onThemeChange, isSpooky = false }) {
    const toggleTheme = () => {
        onThemeChange(currentTheme === 'light' ? 'dark' : 'light');
    };
    return (_jsx(Button, { variant: "outline", size: "sm", onClick: toggleTheme, className: `gap-2 px-3 ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/50' : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'}`, children: currentTheme === 'dark' ? (_jsxs(_Fragment, { children: [_jsx(Moon, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "Spooky" })] })) : (_jsxs(_Fragment, { children: [_jsx(Sun, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "Light" })] })) }));
}
