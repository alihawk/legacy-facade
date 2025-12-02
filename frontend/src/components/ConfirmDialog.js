import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, variant = 'default' }) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsxs("div", { className: "flex items-center gap-3", children: [variant === 'danger' && (_jsx("div", { className: "p-2 bg-red-100 rounded-lg", children: _jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" }) })), _jsx(DialogTitle, { children: title })] }), _jsx(DialogDescription, { className: "pt-2", children: description })] }), _jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), className: "rounded-xl", children: cancelLabel }), _jsx(Button, { onClick: handleConfirm, className: variant === 'danger'
                                ? 'bg-red-600 hover:bg-red-700 text-white rounded-xl'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl', children: confirmLabel })] })] }) }));
}
