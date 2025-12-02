import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2, Inbox } from "lucide-react";
export function LoadingSpinner({ message = "Loading..." }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center h-64 space-y-4", children: [_jsx("div", { className: "p-4 bg-indigo-100 rounded-full", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-indigo-600" }) }), _jsx("span", { className: "text-gray-500 font-medium", children: message })] }));
}
export function EmptyState({ message }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center h-64 space-y-4", children: [_jsx("div", { className: "p-4 bg-gray-100 rounded-full", children: _jsx(Inbox, { className: "w-12 h-12 text-gray-400" }) }), _jsx("p", { className: "text-gray-500 text-lg", children: message })] }));
}
