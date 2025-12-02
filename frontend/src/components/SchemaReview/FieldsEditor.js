import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * FieldsEditor Component
 *
 * Table-based editor for managing resource fields.
 * Allows adding, removing, and editing field properties.
 */
import { Plus, Trash2 } from 'lucide-react';
import { FIELD_TYPES } from '../../types/schemaTypes';
export function FieldsEditor({ fields, onChange }) {
    const handleFieldChange = (index, updates) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updates };
        // If setting as primary key, unset others
        if (updates.isPrimaryKey) {
            newFields.forEach((f, i) => {
                if (i !== index)
                    f.isPrimaryKey = false;
            });
        }
        onChange(newFields);
    };
    const handleAddField = () => {
        onChange([
            ...fields,
            {
                name: `field_${fields.length + 1}`,
                displayName: `Field ${fields.length + 1}`,
                type: 'string',
                isPrimaryKey: false,
                isVisible: true,
                isRequired: false,
            },
        ]);
    };
    const handleRemoveField = (index) => {
        onChange(fields.filter((_, i) => i !== index));
    };
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Fields" }), _jsxs("button", { onClick: handleAddField, className: "flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Field"] })] }), _jsx("div", { className: "border rounded-lg overflow-hidden", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Name" }), _jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Display Name" }), _jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Type" }), _jsx("th", { className: "px-3 py-2 text-center font-medium text-gray-600", children: "Primary Key" }), _jsx("th", { className: "px-3 py-2 text-center font-medium text-gray-600", children: "Visible" }), _jsx("th", { className: "px-3 py-2 text-center font-medium text-gray-600", children: "Required" }), _jsx("th", { className: "px-3 py-2 w-10" })] }) }), _jsx("tbody", { className: "divide-y", children: fields.map((field, index) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-3 py-2", children: _jsx("input", { type: "text", value: field.name, onChange: (e) => handleFieldChange(index, { name: e.target.value }), className: "w-full px-2 py-1 border rounded text-sm" }) }), _jsx("td", { className: "px-3 py-2", children: _jsx("input", { type: "text", value: field.displayName, onChange: (e) => handleFieldChange(index, { displayName: e.target.value }), className: "w-full px-2 py-1 border rounded text-sm" }) }), _jsx("td", { className: "px-3 py-2", children: _jsx("select", { value: field.type, onChange: (e) => handleFieldChange(index, { type: e.target.value }), className: "w-full px-2 py-1 border rounded text-sm bg-white", children: FIELD_TYPES.map((type) => (_jsx("option", { value: type.value, children: type.label }, type.value))) }) }), _jsx("td", { className: "px-3 py-2 text-center", children: _jsx("input", { type: "radio", name: "primaryKey", checked: field.isPrimaryKey, onChange: () => handleFieldChange(index, { isPrimaryKey: true }), className: "w-4 h-4 text-blue-600" }) }), _jsx("td", { className: "px-3 py-2 text-center", children: _jsx("input", { type: "checkbox", checked: field.isVisible, onChange: (e) => handleFieldChange(index, { isVisible: e.target.checked }), className: "w-4 h-4 text-blue-600 rounded" }) }), _jsx("td", { className: "px-3 py-2 text-center", children: _jsx("input", { type: "checkbox", checked: field.isRequired, onChange: (e) => handleFieldChange(index, { isRequired: e.target.checked }), className: "w-4 h-4 text-blue-600 rounded" }) }), _jsx("td", { className: "px-3 py-2", children: _jsx("button", { onClick: () => handleRemoveField(index), className: "p-1 text-gray-400 hover:text-red-500", children: _jsx(Trash2, { className: "w-4 h-4" }) }) })] }, index))) })] }) })] }));
}
