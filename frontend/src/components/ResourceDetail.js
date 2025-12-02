"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./LoadingState";
import { ArrowLeft, Edit, Trash2, Mail, Calendar, Hash, Type, ToggleLeft, Sparkles } from "lucide-react";
import { FieldRenderer } from "./FieldRenderer";
export default function ResourceDetail({ resource, id, onEdit, isSpooky = false }) {
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        fetchDetail();
    }, [resource, id]);
    const fetchDetail = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`http://localhost:8000/proxy/${resource.name}/${id}`);
            setRecord(response.data);
        }
        catch (err) {
            console.error("Failed to fetch detail, using mock detail.", err);
            setError("Backend not reachable. Showing mock record.");
            setRecord(generateMockRecord(Number.parseInt(id, 10) || 1));
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockRecord = (num) => {
        const mock = {};
        mock[resource.primaryKey] = num;
        resource.fields.forEach((field, idx) => {
            if (field.name === resource.primaryKey)
                return;
            switch (field.type) {
                case "string":
                    mock[field.name] = `Sample ${field.displayName} ${num}`;
                    break;
                case "email":
                    mock[field.name] = `user${num}@example.com`;
                    break;
                case "number":
                    mock[field.name] = 1000 + num * 7;
                    break;
                case "boolean":
                    mock[field.name] = num % 2 === 0;
                    break;
                case "date":
                    mock[field.name] = new Date(2024, 0, idx + 1).toISOString();
                    break;
                default:
                    mock[field.name] = `Value ${num}`;
            }
        });
        return mock;
    };
    const getFieldIcon = (type) => {
        switch (type) {
            case "email":
                return _jsx(Mail, { className: "w-4 h-4" });
            case "date":
                return _jsx(Calendar, { className: "w-4 h-4" });
            case "number":
                return _jsx(Hash, { className: "w-4 h-4" });
            case "boolean":
                return _jsx(ToggleLeft, { className: "w-4 h-4" });
            default:
                return _jsx(Type, { className: "w-4 h-4" });
        }
    };
    if (loading || !record) {
        return _jsx(LoadingSpinner, { message: `Loading ${resource.displayName} #${id}` });
    }
    const primaryKeyValue = record[resource.primaryKey];
    return (_jsxs("div", { className: "space-y-6 animate-emerge", children: [_jsxs(Button, { variant: "outline", className: `rounded-xl shadow-sm ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`, onClick: () => navigate(`/portal/${resource.name}`), children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to ", resource.displayName] }), _jsxs(Card, { className: `border-0 shadow-xl rounded-2xl overflow-hidden ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`, children: [_jsx(CardHeader, { className: `border-b ${isSpooky ? 'border-cyan-500/20 bg-slate-800' : 'border-gray-100 bg-gradient-to-r from-gray-50 to-white'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `p-3 rounded-xl ${isSpooky ? 'bg-cyan-500/20' : 'bg-gradient-to-br from-indigo-100 to-purple-50'}`, children: _jsx(Sparkles, { className: `w-6 h-6 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}` }) }), _jsxs("div", { children: [_jsxs(CardTitle, { className: `text-2xl ${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'}`, children: [isSpooky ? '💀 ' : '', resource.displayName.slice(0, -1), " Details"] }), _jsxs("p", { className: `mt-1 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`, children: ["ID:", " ", _jsxs("span", { className: `font-mono font-semibold ${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`, children: ["#", primaryKeyValue] })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [onEdit && (_jsxs(Button, { variant: "outline", className: `rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`, onClick: onEdit, children: [_jsx(Edit, { className: "w-4 h-4 mr-2" }), "Edit"] })), _jsxs(Button, { variant: "outline", className: `rounded-xl ${isSpooky ? 'border-red-500/30 text-red-400 hover:bg-red-500/10 bg-slate-800' : 'border-red-200 text-red-600 hover:bg-red-50 bg-white'}`, onClick: () => window.alert("Delete is not wired yet. This is a demo action."), children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), "Delete"] })] })] }) }), _jsxs(CardContent, { className: "pt-6", children: [error && (_jsx("div", { className: `p-4 rounded-xl border text-sm mb-6 ${isSpooky ? 'bg-amber-900/20 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'}`, children: error })), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: resource.fields.map((field, index) => {
                                    const value = record[field.name];
                                    return (_jsxs("div", { className: `group p-5 rounded-xl border transition-all duration-300 ${isSpooky ? 'bg-slate-800 border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10' : 'bg-gradient-to-br from-gray-50 to-white border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50'}`, style: { animationDelay: `${index * 0.05}s` }, children: [_jsxs("div", { className: `flex items-center gap-2 text-sm mb-3 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`, children: [_jsx("div", { className: `p-1.5 rounded-lg transition-colors ${isSpooky ? 'bg-slate-700 group-hover:bg-cyan-500/20' : 'bg-gray-100 group-hover:bg-indigo-100'}`, children: getFieldIcon(field.type) }), _jsx("span", { className: "uppercase tracking-wider font-semibold text-xs", children: field.displayName })] }), _jsx("div", { className: `font-medium text-lg ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: _jsx(FieldRenderer, { value: value, type: field.type, mode: "detail", isSpooky: isSpooky }) })] }, field.name));
                                }) })] })] })] }));
}
