import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format, formatDistanceToNow } from 'date-fns';
import { ExternalLink, Mail, Check, X } from 'lucide-react';
export function FieldRenderer({ value, type, mode, onChange, name, isSpooky = false }) {
    // Handle null/undefined
    if (value === null || value === undefined) {
        if (mode === 'form') {
            return renderFormInput(type, '', onChange, name);
        }
        return _jsx("span", { className: "text-gray-400", children: "\u2014" });
    }
    // Form mode - render inputs
    if (mode === 'form') {
        return renderFormInput(type, value, onChange, name, isSpooky);
    }
    // Display modes (list/detail)
    switch (type) {
        case 'email':
            return (_jsxs("a", { href: `mailto:${value}`, className: "text-blue-600 hover:underline flex items-center gap-1", children: [_jsx(Mail, { className: "w-3 h-3" }), value] }));
        case 'url':
            const displayUrl = mode === 'list'
                ? value.replace(/^https?:\/\//, '').slice(0, 30) + (value.length > 30 ? '...' : '')
                : value;
            return (_jsxs("a", { href: value, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline flex items-center gap-1", children: [_jsx(ExternalLink, { className: "w-3 h-3" }), displayUrl] }));
        case 'boolean':
            return value ? (_jsxs("span", { className: "inline-flex items-center gap-1 text-green-600", children: [_jsx(Check, { className: "w-4 h-4" }), " ", mode === 'detail' && 'Yes'] })) : (_jsxs("span", { className: "inline-flex items-center gap-1 text-red-500", children: [_jsx(X, { className: "w-4 h-4" }), " ", mode === 'detail' && 'No'] }));
        case 'date':
            try {
                const date = new Date(value);
                const formatted = format(date, 'MMM d, yyyy');
                const relative = mode === 'detail' ? ` (${formatDistanceToNow(date, { addSuffix: true })})` : '';
                return _jsxs("span", { children: [formatted, relative] });
            }
            catch {
                return _jsx("span", { children: value });
            }
        case 'datetime':
            try {
                const date = new Date(value);
                const formatted = format(date, 'MMM d, yyyy h:mm a');
                const relative = mode === 'detail' ? ` (${formatDistanceToNow(date, { addSuffix: true })})` : '';
                return _jsxs("span", { children: [formatted, relative] });
            }
            catch {
                return _jsx("span", { children: value });
            }
        case 'number':
            return (_jsx("span", { className: "font-mono tabular-nums", children: typeof value === 'number' ? value.toLocaleString() : value }));
        case 'currency':
            return (_jsxs("span", { className: "font-mono tabular-nums", children: ["$", typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : value] }));
        default:
            // String - truncate in list mode
            const strValue = String(value);
            if (mode === 'list' && strValue.length > 50) {
                return (_jsxs("span", { title: strValue, children: [strValue.slice(0, 50), "..."] }));
            }
            return _jsx("span", { children: strValue });
    }
}
function renderFormInput(type, value, onChange, name, isSpooky = false) {
    const baseClass = isSpooky
        ? "w-full px-3 py-2 border border-cyan-500/30 rounded-lg bg-slate-800 text-cyan-400 placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
        : "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    switch (type) {
        case 'email':
            return (_jsx("input", { type: "email", value: value || '', onChange: (e) => onChange?.(e.target.value), className: baseClass, placeholder: "email@example.com" }));
        case 'url':
            return (_jsx("input", { type: "url", value: value || '', onChange: (e) => onChange?.(e.target.value), className: baseClass, placeholder: "https://example.com" }));
        case 'boolean':
            return (_jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: Boolean(value), onChange: (e) => onChange?.(e.target.checked), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] }));
        case 'date':
            return (_jsx("input", { type: "date", value: value ? new Date(value).toISOString().split('T')[0] : '', onChange: (e) => onChange?.(e.target.value), className: baseClass }));
        case 'datetime':
            return (_jsx("input", { type: "datetime-local", value: value ? new Date(value).toISOString().slice(0, 16) : '', onChange: (e) => onChange?.(e.target.value), className: baseClass }));
        case 'number':
        case 'currency':
            return (_jsx("input", { type: "number", value: value || '', onChange: (e) => onChange?.(parseFloat(e.target.value) || 0), className: baseClass, step: type === 'currency' ? '0.01' : '1' }));
        default:
            // Check if value is long - use textarea
            if (String(value).length > 100) {
                return (_jsx("textarea", { value: value || '', onChange: (e) => onChange?.(e.target.value), className: `${baseClass} min-h-[100px]`, rows: 4 }));
            }
            return (_jsx("input", { type: "text", value: value || '', onChange: (e) => onChange?.(e.target.value), className: baseClass }));
    }
}
