import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FeatureToggleGroup({ title, icon, features, values, onChange }) {
    return (_jsxs("div", { className: "bg-white border rounded-xl p-5", children: [_jsxs("h3", { className: "flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4", children: [_jsx("span", { children: icon }), title] }), _jsx("div", { className: "space-y-3", children: features.map((feature) => (_jsxs("label", { className: `
              flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
              ${feature.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
              ${values[feature.key] ? 'bg-blue-50' : ''}
            `, children: [_jsx("input", { type: "checkbox", checked: values[feature.key] || false, onChange: (e) => onChange(feature.key, e.target.checked), disabled: feature.disabled, className: "mt-1 w-4 h-4 text-blue-600 rounded" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: feature.label }), feature.comingSoon && (_jsx("span", { className: "px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full", children: "Coming Soon" }))] }), _jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: feature.description })] })] }, feature.key))) })] }));
}
