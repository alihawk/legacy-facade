import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const OPERATION_INFO = [
    { key: 'list', label: 'List', description: 'View all records', icon: '📋' },
    { key: 'detail', label: 'View Details', description: 'View single record', icon: '👁️' },
    { key: 'create', label: 'Create', description: 'Add new records', icon: '➕' },
    { key: 'update', label: 'Update', description: 'Edit existing records', icon: '✏️' },
    { key: 'delete', label: 'Delete', description: 'Remove records', icon: '🗑️' },
];
export function OperationsToggle({ operations, onChange }) {
    const handleToggle = (key) => {
        onChange({ ...operations, [key]: !operations[key] });
    };
    return (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Operations" }), _jsx("div", { className: "flex flex-wrap gap-3", children: OPERATION_INFO.map(({ key, label, description, icon }) => (_jsxs("label", { className: `
              flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
              ${operations[key]
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}
            `, title: description, children: [_jsx("input", { type: "checkbox", checked: operations[key], onChange: () => handleToggle(key), className: "sr-only" }), _jsx("span", { children: icon }), _jsx("span", { className: "text-sm font-medium", children: label })] }, key))) })] }));
}
