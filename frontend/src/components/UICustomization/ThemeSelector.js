import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const COLORS = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-cyan-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
];
export function ThemeSelector({ mode, accentColor, onModeChange, onColorChange }) {
    return (_jsxs("div", { className: "bg-white border rounded-xl p-5", children: [_jsxs("h3", { className: "flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4", children: [_jsx("span", { children: "\uD83C\uDFA8" }), "Theme"] }), _jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Choose the theme for your generated portal (this won't affect the current page)." }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-2 block", children: "Mode" }), _jsx("div", { className: "flex gap-2", children: ['light', 'auto', 'dark'].map((m) => (_jsxs("button", { onClick: () => onModeChange(m), className: `
                flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${mode === m
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `, children: [m === 'light' && '☀️ ', m === 'auto' && '🌗 ', m === 'dark' && '🌙 ', m.charAt(0).toUpperCase() + m.slice(1)] }, m))) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700 mb-2 block", children: "Accent Color" }), _jsx("div", { className: "flex gap-3", children: COLORS.map((color) => (_jsx("button", { onClick: () => onColorChange(color.value), className: `
                w-10 h-10 rounded-full ${color.class} transition-transform
                ${accentColor === color.value
                                ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                : 'hover:scale-105'}
              `, title: color.label }, color.value))) })] })] }));
}
