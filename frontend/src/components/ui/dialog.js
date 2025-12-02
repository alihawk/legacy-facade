import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function Dialog({ open, onOpenChange, children }) {
    if (!open)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm", onClick: () => onOpenChange(false) }), _jsx("div", { className: "relative z-50", children: children })] }));
}
export function DialogContent({ children, className }) {
    return (_jsx("div", { className: cn('relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4', 'animate-in fade-in-0 zoom-in-95', className), children: children }));
}
export function DialogHeader({ children, className }) {
    return (_jsx("div", { className: cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className), children: children }));
}
export function DialogTitle({ children, className }) {
    return (_jsx("h2", { className: cn('text-lg font-semibold leading-none tracking-tight', className), children: children }));
}
export function DialogDescription({ children, className }) {
    return (_jsx("p", { className: cn('text-sm text-gray-500', className), children: children }));
}
export function DialogFooter({ children, className }) {
    return (_jsx("div", { className: cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6', className), children: children }));
}
