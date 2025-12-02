import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OutputOptions Component
 *
 * Output selection interface for Preview/Download/Deploy options.
 * Allows users to choose what to do with their generated portal.
 */
import { Eye, Download, Rocket } from 'lucide-react';
const OPTIONS = [
    {
        key: 'preview',
        icon: Eye,
        label: 'Preview',
        description: 'Live preview in browser',
    },
    {
        key: 'download',
        icon: Download,
        label: 'Download',
        description: 'ZIP project for local dev',
    },
    {
        key: 'deploy',
        icon: Rocket,
        label: 'Deploy',
        description: 'Deploy to Vercel (1-click)',
    },
];
export function OutputOptions({ preview, download, deploy, onChange }) {
    const values = { preview, download, deploy };
    return (_jsxs("div", { className: "bg-white border rounded-xl p-5", children: [_jsxs("h3", { className: "flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4", children: [_jsx("span", { children: "\uD83D\uDCE4" }), "Output Options"] }), _jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Choose what you want to do with your generated portal." }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: OPTIONS.map(({ key, icon: Icon, label, description }) => (_jsxs("button", { onClick: () => onChange(key, !values[key]), className: `
              relative flex flex-col items-center p-4 rounded-xl border-2 transition-all
              ${values[key]
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `, children: [values[key] && (_jsx("span", { className: "absolute top-2 right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs", children: "\u2713" })), _jsx(Icon, { className: `w-8 h-8 mb-2 ${values[key] ? 'text-blue-600' : 'text-gray-400'}` }), _jsx("span", { className: `font-medium ${values[key] ? 'text-blue-700' : 'text-gray-700'}`, children: label }), _jsx("span", { className: "text-xs text-gray-500 text-center mt-1", children: description })] }, key))) })] }));
}
