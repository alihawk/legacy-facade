import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ResourceCard Component
 *
 * Expandable card for reviewing and editing a single resource.
 * Integrates OperationsToggle and FieldsEditor components.
 */
import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, Package } from 'lucide-react';
import { OperationsToggle } from './OperationsToggle';
import { FieldsEditor } from './FieldsEditor';
export function ResourceCard({ resource, onChange, onDelete }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const operationCount = Object.values(resource.operations).filter(Boolean).length;
    return (_jsxs("div", { className: "border rounded-xl overflow-hidden bg-white shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer", onClick: () => setIsExpanded(!isExpanded), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Package, { className: "w-5 h-5 text-blue-600" }), isEditingName ? (_jsx("input", { type: "text", value: resource.displayName, onChange: (e) => onChange({ ...resource, displayName: e.target.value }), onBlur: () => setIsEditingName(false), onKeyDown: (e) => e.key === 'Enter' && setIsEditingName(false), onClick: (e) => e.stopPropagation(), className: "px-2 py-1 border rounded font-semibold", autoFocus: true })) : (_jsx("span", { className: "font-semibold text-gray-900", children: resource.displayName })), _jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    setIsEditingName(true);
                                }, className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(Edit2, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "text-sm text-gray-500", children: [resource.fields.length, " fields \u2022 ", operationCount, " operations"] }), _jsx("button", { onClick: (e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }, className: "p-1 text-gray-400 hover:text-red-500", children: _jsx(Trash2, { className: "w-4 h-4" }) }), isExpanded ? (_jsx(ChevronUp, { className: "w-5 h-5 text-gray-400" })) : (_jsx(ChevronDown, { className: "w-5 h-5 text-gray-400" }))] })] }), isExpanded && (_jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Endpoint" }), _jsx("input", { type: "text", value: resource.endpoint, onChange: (e) => onChange({ ...resource, endpoint: e.target.value }), className: "mt-1 w-full px-3 py-2 border rounded-lg text-sm font-mono", placeholder: "https://api.example.com/resource" })] }), _jsx(OperationsToggle, { operations: resource.operations, onChange: (operations) => onChange({ ...resource, operations }) }), _jsx(FieldsEditor, { fields: resource.fields, onChange: (fields) => onChange({ ...resource, fields }) })] }))] }));
}
