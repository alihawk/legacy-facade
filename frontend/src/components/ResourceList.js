"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Plus, ChevronLeft, ChevronRight, Filter, Sparkles, ArrowUpDown, ArrowUp, ArrowDown, History, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { LoadingSpinner, EmptyState } from "./LoadingState";
import { getUIConfig } from "./ResourceSettings";
import { BulkActionsBar } from "./BulkActionsBar";
import { ConfirmDialog } from "./ConfirmDialog";
import { exportToCSV } from "@/utils/csvExport";
import { FieldRenderer } from "./FieldRenderer";
export default function ResourceList({ resource, isSpooky = false, customization: propCustomization }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(null);
    const navigate = useNavigate();
    // Use prop customization or read from localStorage
    const customization = propCustomization || (() => {
        try {
            const stored = localStorage.getItem("portal-customization");
            return stored ? JSON.parse(stored) : {
                listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true }
            };
        }
        catch {
            return { listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true } };
        }
    })();
    useEffect(() => {
        fetchData();
    }, [resource]);
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/proxy/${resource.name}`);
            // Handle multiple response formats:
            // 1. { data: [...] } - standard format
            // 2. { Data: [...] } - legacy format with capital D
            // 3. [...] - direct array
            // 4. { items: [...] } or { results: [...] } - other common formats
            const responseData = response.data;
            let extractedData = [];
            if (Array.isArray(responseData)) {
                extractedData = responseData;
            }
            else if (responseData?.data && Array.isArray(responseData.data)) {
                extractedData = responseData.data;
            }
            else if (responseData?.Data && Array.isArray(responseData.Data)) {
                extractedData = responseData.Data;
            }
            else if (responseData?.items && Array.isArray(responseData.items)) {
                extractedData = responseData.items;
            }
            else if (responseData?.results && Array.isArray(responseData.results)) {
                extractedData = responseData.results;
            }
            else if (typeof responseData === 'object' && responseData !== null) {
                // If it's an object, check if any property is an array
                const arrayProp = Object.values(responseData).find(v => Array.isArray(v));
                if (arrayProp) {
                    extractedData = arrayProp;
                }
            }
            setData(extractedData);
        }
        catch (error) {
            console.error("Failed to fetch:", error);
            setData(generateMockData());
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockData = () => {
        return Array.from({ length: 50 }, (_, i) => {
            const mockItem = {};
            mockItem[resource.primaryKey] = i + 1;
            resource.fields.forEach((field) => {
                if (field.name === resource.primaryKey)
                    return;
                switch (field.type) {
                    case "string":
                        mockItem[field.name] = `Sample ${field.displayName} ${i + 1}`;
                        break;
                    case "email":
                        mockItem[field.name] = `user${i + 1}@example.com`;
                        break;
                    case "number":
                        mockItem[field.name] = Math.floor(Math.random() * 1000);
                        break;
                    case "boolean":
                        mockItem[field.name] = Math.random() > 0.5;
                        break;
                    case "date":
                        mockItem[field.name] = new Date(2024, 0, i + 1).toISOString();
                        break;
                    default:
                        mockItem[field.name] = `Value ${i + 1}`;
                }
            });
            return mockItem;
        });
    };
    // Get UI config from localStorage
    const uiConfig = getUIConfig(resource.name);
    // Apply UI config to visible fields
    const visibleFields = resource.fields
        .filter((f) => {
        if (f.name === resource.primaryKey)
            return false;
        if (!uiConfig)
            return true;
        return uiConfig.fieldSettings[f.name]?.visibleInList ?? true;
    })
        .slice(0, 5);
    // Helper to get display label
    const getDisplayLabel = (field) => {
        return uiConfig?.fieldSettings[field.name]?.displayLabel || field.displayName;
    };
    const handleSort = (fieldName) => {
        if (sortField === fieldName) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortField(fieldName);
            setSortDirection('asc');
        }
    };
    const filteredData = data.filter((item) => {
        if (!searchTerm)
            return true;
        return visibleFields.some((field) => {
            const value = String(item[field.name] || "").toLowerCase();
            return value.includes(searchTerm.toLowerCase());
        });
    });
    const sortedData = sortField
        ? [...filteredData].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            // Handle null/undefined
            if (aVal == null && bVal == null)
                return 0;
            if (aVal == null)
                return 1;
            if (bVal == null)
                return -1;
            // Compare values
            let comparison = 0;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
            }
            else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                comparison = aVal === bVal ? 0 : aVal ? 1 : -1;
            }
            else {
                comparison = String(aVal).localeCompare(String(bVal));
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        })
        : filteredData;
    const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
    const currentSafePage = Math.min(currentPage, totalPages);
    const startIndex = (currentSafePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);
    const handleRowClick = (item) => {
        const id = item[resource.primaryKey];
        navigate(`/portal/${resource.name}/${id}`);
    };
    // Bulk selection handlers
    const handleSelectAll = (checked) => {
        if (checked === true) {
            // Select all items on current page
            const allIds = new Set(paginatedData.map(item => item[resource.primaryKey] ?? item.id));
            setSelectedIds(allIds);
        }
        else {
            // Deselect all
            setSelectedIds(new Set());
        }
    };
    const toggleSelectItem = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        }
        else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };
    const handleExport = () => {
        const selectedData = data.filter(item => selectedIds.has(item[resource.primaryKey]));
        const dataToExport = selectedData.length > 0 ? selectedData : paginatedData;
        exportToCSV(dataToExport, `${resource.name}-export`, resource.fields);
    };
    const handleBulkDelete = () => {
        setShowDeleteDialog(true);
    };
    const confirmBulkDelete = async () => {
        const deleteCount = selectedIds.size;
        // In a real app, this would call the API for each item
        console.log('Deleting items:', Array.from(selectedIds));
        // Simulate deletion
        const newData = data.filter(item => !selectedIds.has(item[resource.primaryKey]));
        setData(newData);
        setSelectedIds(new Set());
        // Show success message
        setShowSuccessMessage(`Successfully deleted ${deleteCount} item${deleteCount !== 1 ? 's' : ''}`);
        // Auto-hide after 3 seconds
        setTimeout(() => setShowSuccessMessage(null), 3000);
    };
    if (loading) {
        return _jsx(LoadingSpinner, { message: `Loading ${resource.displayName}...` });
    }
    return (_jsxs("div", { className: "space-y-6 animate-emerge", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-xl ${isSpooky ? 'bg-cyan-500/20' : 'bg-gradient-to-br from-indigo-100 to-purple-50'}`, children: _jsx(Sparkles, { className: `w-5 h-5 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}` }) }), _jsxs("h1", { className: `text-2xl font-bold ${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'}`, children: [isSpooky ? '💀 ' : '', resource.displayName] })] }), _jsxs("p", { className: `mt-2 ml-12 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`, children: ["Manage and view all ", resource.displayName.toLowerCase()] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate(`/portal/${resource.name}/settings`), className: `rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`, children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Settings"] }), _jsxs(Button, { variant: "outline", onClick: () => navigate(`/portal/${resource.name}/activity`), className: `rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`, children: [_jsx(History, { className: "w-4 h-4 mr-2" }), "Activity Log"] }), resource.operations?.create !== false && (_jsxs(Button, { className: `shadow-lg hover:shadow-xl transition-all ${isSpooky ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white`, onClick: () => navigate(`/portal/${resource.name}/new`), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add ", resource.displayName.slice(0, -1)] }))] })] }), (customization.listView?.bulkSelection || customization.listView?.bulkDelete || customization.listView?.csvExport) && (_jsx(BulkActionsBar, { selectedCount: selectedIds.size, onClearSelection: () => setSelectedIds(new Set()), onExport: customization.listView?.csvExport ? handleExport : undefined, onDelete: customization.listView?.bulkDelete && resource.operations?.delete !== false ? handleBulkDelete : undefined, isSpooky: isSpooky })), showSuccessMessage && (_jsxs("div", { className: `flex items-center gap-3 px-4 py-3 rounded-xl border animate-emerge ${isSpooky ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`, children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }), _jsx("span", { className: "font-medium", children: showSuccessMessage }), _jsx("button", { onClick: () => setShowSuccessMessage(null), className: `ml-auto p-1 rounded-lg transition-colors ${isSpooky ? 'hover:bg-emerald-500/20' : 'hover:bg-emerald-100'}`, children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }))] }), _jsxs("div", { className: `flex gap-4 p-5 rounded-2xl border-0 shadow-lg ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`, children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: `absolute left-4 top-3.5 w-5 h-5 ${isSpooky ? 'text-cyan-400' : 'text-gray-400'}` }), _jsx(Input, { value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: `Search ${resource.displayName.toLowerCase()}...`, className: `pl-12 h-12 border-0 rounded-xl transition-all ${isSpooky ? 'bg-slate-800 text-cyan-400 placeholder:text-gray-500 focus:bg-slate-700 focus:ring-2 focus:ring-cyan-500/20' : 'bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20'}` })] }), _jsxs(Select, { value: itemsPerPage.toString(), onValueChange: (v) => setItemsPerPage(Number(v)), children: [_jsxs(SelectTrigger, { className: `w-40 h-12 border-0 rounded-xl ${isSpooky ? 'bg-slate-800 text-cyan-400' : 'bg-gray-50 text-gray-900'}`, children: [_jsx(Filter, { className: `w-4 h-4 mr-2 ${isSpooky ? 'text-cyan-400' : 'text-gray-400'}` }), _jsx(SelectValue, { placeholder: "Per page" })] }), _jsxs(SelectContent, { className: `rounded-xl ${isSpooky ? 'bg-slate-800 border-cyan-500/30' : 'bg-white'}`, children: [_jsx(SelectItem, { value: "10", className: isSpooky ? 'text-cyan-400 focus:bg-slate-700 focus:text-cyan-300' : '', children: "10 per page" }), _jsx(SelectItem, { value: "20", className: isSpooky ? 'text-cyan-400 focus:bg-slate-700 focus:text-cyan-300' : '', children: "20 per page" }), _jsx(SelectItem, { value: "50", className: isSpooky ? 'text-cyan-400 focus:bg-slate-700 focus:text-cyan-300' : '', children: "50 per page" }), _jsx(SelectItem, { value: "100", className: isSpooky ? 'text-cyan-400 focus:bg-slate-700 focus:text-cyan-300' : '', children: "100 per page" })] })] })] }), _jsx("div", { className: `border-0 rounded-2xl shadow-lg overflow-hidden ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`, children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: `${isSpooky ? 'bg-slate-800 border-cyan-500/20' : 'bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-100'}`, children: [customization.listView?.bulkSelection && (_jsx(TableHead, { className: "w-12 py-4", children: _jsx(Checkbox, { checked: paginatedData.length > 0 && selectedIds.size === paginatedData.length
                                                ? true
                                                : selectedIds.size > 0
                                                    ? "indeterminate"
                                                    : false, onCheckedChange: handleSelectAll, "aria-label": "Select all" }) })), _jsx(TableHead, { className: `font-semibold w-20 py-4 cursor-pointer transition-colors select-none ${isSpooky ? 'text-cyan-400 hover:text-cyan-300' : 'text-gray-600 hover:text-indigo-600'}`, onClick: () => handleSort(resource.primaryKey), children: _jsxs("div", { className: "flex items-center gap-2", children: ["ID", sortField === resource.primaryKey ? (sortDirection === 'asc' ? (_jsx(ArrowUp, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}` })) : (_jsx(ArrowDown, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}` }))) : (_jsx(ArrowUpDown, { className: "w-4 h-4 opacity-30" }))] }) }), visibleFields.map((field) => (_jsx(TableHead, { className: `font-semibold py-4 cursor-pointer transition-colors select-none ${isSpooky ? 'text-cyan-400 hover:text-cyan-300' : 'text-gray-600 hover:text-indigo-600'}`, onClick: () => handleSort(field.name), children: _jsxs("div", { className: "flex items-center gap-2", children: [getDisplayLabel(field), sortField === field.name ? (sortDirection === 'asc' ? (_jsx(ArrowUp, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}` })) : (_jsx(ArrowDown, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}` }))) : (_jsx(ArrowUpDown, { className: "w-4 h-4 opacity-30" }))] }) }, field.name))), _jsx(TableHead, { className: `font-semibold text-right w-24 py-4 ${isSpooky ? 'text-cyan-400' : 'text-gray-600'}`, children: "Actions" })] }) }), _jsx(TableBody, { children: paginatedData.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: visibleFields.length + 3, className: "text-center py-12", children: _jsx(EmptyState, { message: searchTerm
                                            ? `No ${resource.displayName.toLowerCase()} found matching "${searchTerm}"`
                                            : `No ${resource.displayName.toLowerCase()} found` }) }) })) : (paginatedData.map((item, index) => {
                                const itemId = item[resource.primaryKey] ?? item.id ?? index;
                                const isSelected = selectedIds.has(itemId);
                                return (_jsxs(TableRow, { className: `cursor-pointer transition-all duration-200 ${isSpooky
                                        ? `border-cyan-500/20 hover:bg-cyan-500/10 ${isSelected ? 'bg-cyan-500/20' : ''}`
                                        : `border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30 ${isSelected ? 'bg-indigo-50/30' : ''}`}`, onClick: () => handleRowClick(item), style: { animationDelay: `${index * 0.03}s` }, children: [customization.listView?.bulkSelection && (_jsx(TableCell, { className: "py-4", onClick: (e) => e.stopPropagation(), children: _jsx(Checkbox, { checked: isSelected, onCheckedChange: () => toggleSelectItem(itemId), "aria-label": `Select item ${itemId}` }) })), _jsx(TableCell, { className: "font-mono font-semibold py-4", children: _jsxs("span", { className: `${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`, children: ["#", itemId] }) }), visibleFields.map((field) => (_jsx(TableCell, { className: `py-4 ${isSpooky ? 'text-gray-300' : 'text-gray-700'}`, children: _jsx(FieldRenderer, { value: item[field.name], type: field.type, mode: "list" }) }, field.name))), _jsx(TableCell, { className: "text-right py-4", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                                                    e.stopPropagation();
                                                    handleRowClick(item);
                                                }, className: `rounded-xl ${isSpooky ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20' : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100'}`, children: _jsx(Eye, { className: "w-4 h-4" }) }) })] }, `${resource.name}-${itemId}-${index}`));
                            })) })] }) }), _jsxs("div", { className: `flex items-center justify-between border-0 rounded-2xl px-5 py-4 shadow-lg ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`, children: [_jsxs("div", { className: `text-sm ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`, children: ["Showing ", _jsx("span", { className: `font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: sortedData.length === 0 ? 0 : startIndex + 1 }), " ", "- ", _jsx("span", { className: `font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: Math.min(endIndex, sortedData.length) }), " of", " ", _jsx("span", { className: `font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: sortedData.length }), " ", resource.displayName.toLowerCase()] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", disabled: currentSafePage === 1, onClick: () => setCurrentPage((p) => p - 1), className: `disabled:opacity-30 rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`, children: [_jsx(ChevronLeft, { className: "w-4 h-4 mr-1" }), "Previous"] }), _jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    }
                                    else if (currentSafePage <= 3) {
                                        pageNum = i + 1;
                                    }
                                    else if (currentSafePage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    }
                                    else {
                                        pageNum = currentSafePage - 2 + i;
                                    }
                                    return (_jsx(Button, { variant: currentSafePage === pageNum ? "default" : "outline", size: "sm", onClick: () => setCurrentPage(pageNum), className: currentSafePage === pageNum
                                            ? isSpooky
                                                ? "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white border-0 rounded-xl"
                                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 rounded-xl"
                                            : isSpooky
                                                ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-xl"
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl", children: pageNum }, pageNum));
                                }) }), _jsxs(Button, { variant: "outline", size: "sm", disabled: currentSafePage === totalPages, onClick: () => setCurrentPage((p) => p + 1), className: `disabled:opacity-30 rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`, children: ["Next", _jsx(ChevronRight, { className: "w-4 h-4 ml-1" })] })] })] }), _jsx(ConfirmDialog, { open: showDeleteDialog, onOpenChange: setShowDeleteDialog, title: "Delete Selected Items", description: `Are you sure you want to delete ${selectedIds.size} item${selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.`, confirmLabel: "Delete", onConfirm: confirmBulkDelete, variant: "danger" })] }));
}
