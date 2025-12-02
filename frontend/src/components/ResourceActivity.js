import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Clock, User, ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "./LoadingState";
export default function ResourceActivity({ resource, isSpooky = false }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAction, setFilterAction] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState("timestamp");
    const [sortDirection, setSortDirection] = useState("desc");
    const itemsPerPage = 20;
    const navigate = useNavigate();
    useEffect(() => {
        fetchActivityData();
    }, [resource]);
    const fetchActivityData = async () => {
        setLoading(true);
        // In a real app, fetch from API
        // For now, generate mock data
        setTimeout(() => {
            setData(generateMockActivity(resource));
            setLoading(false);
        }, 500);
    };
    const generateMockActivity = (resource) => {
        const actions = ["created", "updated", "deleted"];
        const users = ["Admin", "Sarah Chen", "John Smith", "Manager", "System"];
        return Array.from({ length: 50 }, (_, i) => ({
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            action: actions[Math.floor(Math.random() * actions.length)],
            user: users[Math.floor(Math.random() * users.length)],
            resourceId: Math.floor(Math.random() * 100) + 1,
            details: resource.fields[Math.floor(Math.random() * Math.min(3, resource.fields.length))]?.displayName || "Data",
        }));
    };
    const handleSort = (fieldName) => {
        if (sortField === fieldName) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        }
        else {
            setSortField(fieldName);
            setSortDirection("asc");
        }
    };
    const filteredData = data.filter((item) => {
        // Apply action filter
        if (filterAction !== "all" && item.action !== filterAction)
            return false;
        // Apply search
        if (!searchTerm)
            return true;
        const searchLower = searchTerm.toLowerCase();
        return (item.user.toLowerCase().includes(searchLower) ||
            item.details?.toLowerCase().includes(searchLower) ||
            String(item.resourceId).includes(searchLower));
    });
    const sortedData = [...filteredData].sort((a, b) => {
        let comparison = 0;
        if (sortField === "timestamp") {
            comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        else if (sortField === "action") {
            comparison = a.action.localeCompare(b.action);
        }
        else if (sortField === "user") {
            comparison = a.user.localeCompare(b.user);
        }
        else if (sortField === "resourceId") {
            comparison = Number(a.resourceId) - Number(b.resourceId);
        }
        return sortDirection === "asc" ? comparison : -comparison;
    });
    const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
    const currentSafePage = Math.min(currentPage, totalPages);
    const startIndex = (currentSafePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterAction]);
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return "Just now";
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };
    const getActionBadge = (action) => {
        const variants = {
            created: "bg-gradient-to-r from-emerald-100 to-emerald-50 text-teal-700 border-teal-200",
            updated: "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200",
            deleted: "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200",
        };
        return variants[action] || variants.updated;
    };
    const handleExport = () => {
        // Generate CSV
        const headers = ["Timestamp", "Action", "User", "Resource ID", "Details"];
        const rows = sortedData.map((item) => [
            new Date(item.timestamp).toISOString(),
            item.action,
            item.user,
            item.resourceId,
            item.details || "",
        ]);
        const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resource.name}-activity-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    if (loading) {
        return _jsx(LoadingSpinner, { message: `Loading activity log...` });
    }
    return (_jsxs("div", { className: "space-y-6 animate-emerge", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate(`/portal/${resource.name}`), className: `rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`, children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to ", resource.displayName] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-xl ${isSpooky ? 'bg-cyan-500/20' : 'bg-gradient-to-br from-amber-100 to-orange-50'}`, children: _jsx(Clock, { className: `w-5 h-5 ${isSpooky ? 'text-cyan-400' : 'text-amber-600'}` }) }), _jsxs("h1", { className: `text-2xl font-bold ${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'}`, children: [isSpooky ? '💀 ' : '', "Activity Log"] })] }), _jsxs("p", { className: `mt-2 ml-12 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`, children: ["Recent activity on ", resource.displayName.toLowerCase()] })] })] }), _jsxs(Button, { onClick: handleExport, className: `text-white shadow-lg hover:shadow-xl transition-all rounded-xl ${isSpooky ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-cyan-500/25' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/25'}`, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Log"] })] }), _jsxs("div", { className: `flex gap-4 p-5 rounded-2xl border-0 shadow-lg ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`, children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(User, { className: "absolute left-4 top-3.5 w-5 h-5 text-gray-400" }), _jsx(Input, { value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Search by user, details, or ID...", className: `pl-12 h-12 border-0 rounded-xl transition-all ${isSpooky ? 'bg-slate-800 text-cyan-400 placeholder:text-gray-500 focus:bg-slate-700 focus:ring-2 focus:ring-cyan-500/20' : 'bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20'}` })] }), _jsxs(Select, { value: filterAction, onValueChange: setFilterAction, children: [_jsxs(SelectTrigger, { className: `w-48 h-12 border-0 rounded-xl ${isSpooky ? 'bg-slate-800 text-cyan-400' : 'bg-gray-50 text-gray-900'}`, children: [_jsx(Filter, { className: `w-4 h-4 mr-2 ${isSpooky ? 'text-cyan-400' : 'text-gray-400'}` }), _jsx(SelectValue, { placeholder: "All actions" })] }), _jsxs(SelectContent, { className: "rounded-xl", children: [_jsx(SelectItem, { value: "all", children: "All actions" }), _jsx(SelectItem, { value: "created", children: "Created" }), _jsx(SelectItem, { value: "updated", children: "Updated" }), _jsx(SelectItem, { value: "deleted", children: "Deleted" })] })] })] }), _jsx("div", { className: `border-0 rounded-2xl shadow-lg overflow-hidden ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`, children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { className: `${isSpooky ? 'bg-slate-800 border-cyan-500/20' : 'bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-100'}`, children: [_jsx(TableHead, { className: `font-semibold py-4 cursor-pointer transition-colors select-none ${isSpooky ? 'text-cyan-400 hover:text-cyan-300' : 'text-gray-600 hover:text-amber-600'}`, onClick: () => handleSort("timestamp"), children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), "Time", sortField === "timestamp" ? (sortDirection === "asc" ? (_jsx(ArrowUp, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-amber-600'}` })) : (_jsx(ArrowDown, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-amber-600'}` }))) : (_jsx(ArrowUpDown, { className: "w-4 h-4 opacity-30" }))] }) }), _jsx(TableHead, { className: `font-semibold py-4 cursor-pointer transition-colors select-none ${isSpooky ? 'text-cyan-400 hover:text-cyan-300' : 'text-gray-600 hover:text-amber-600'}`, onClick: () => handleSort("action"), children: _jsxs("div", { className: "flex items-center gap-2", children: ["Action", sortField === "action" ? (sortDirection === "asc" ? (_jsx(ArrowUp, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-amber-600'}` })) : (_jsx(ArrowDown, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-amber-600'}` }))) : (_jsx(ArrowUpDown, { className: "w-4 h-4 opacity-30" }))] }) }), _jsx(TableHead, { className: `font-semibold py-4 cursor-pointer transition-colors select-none ${isSpooky ? 'text-cyan-400 hover:text-cyan-300' : 'text-gray-600 hover:text-amber-600'}`, onClick: () => handleSort("user"), children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "w-4 h-4" }), "User", sortField === "user" ? (sortDirection === "asc" ? (_jsx(ArrowUp, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-amber-600'}` })) : (_jsx(ArrowDown, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-amber-600'}` }))) : (_jsx(ArrowUpDown, { className: "w-4 h-4 opacity-30" }))] }) }), _jsx(TableHead, { className: `font-semibold py-4 cursor-pointer transition-colors select-none ${isSpooky ? 'text-cyan-400 hover:text-cyan-300' : 'text-gray-600 hover:text-amber-600'}`, onClick: () => handleSort("resourceId"), children: _jsxs("div", { className: "flex items-center gap-2", children: ["Resource ID", sortField === "resourceId" ? (sortDirection === "asc" ? (_jsx(ArrowUp, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-amber-600'}` })) : (_jsx(ArrowDown, { className: `w-4 h-4 ${isSpooky ? 'text-cyan-400' : 'text-amber-600'}` }))) : (_jsx(ArrowUpDown, { className: "w-4 h-4 opacity-30" }))] }) }), _jsx(TableHead, { className: `font-semibold py-4 ${isSpooky ? 'text-cyan-400' : 'text-gray-600'}`, children: "Details" })] }) }), _jsx(TableBody, { children: paginatedData.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: `text-center py-12 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`, children: searchTerm || filterAction !== "all"
                                        ? "No activity found matching your filters"
                                        : "No activity recorded yet" }) })) : (paginatedData.map((entry, index) => (_jsxs(TableRow, { className: `transition-all duration-200 ${isSpooky ? 'border-cyan-500/20 hover:bg-cyan-500/5' : 'border-gray-100 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/30'}`, style: { animationDelay: `${index * 0.03}s` }, children: [_jsx(TableCell, { className: `py-4 font-medium ${isSpooky ? 'text-cyan-400' : 'text-gray-600'}`, children: formatTimestamp(entry.timestamp) }), _jsx(TableCell, { className: "py-4", children: _jsx(Badge, { className: `${getActionBadge(entry.action)} border capitalize`, children: entry.action }) }), _jsx(TableCell, { className: `py-4 ${isSpooky ? 'text-cyan-300' : 'text-gray-700'}`, children: entry.user }), _jsx(TableCell, { className: "py-4", children: _jsxs("span", { className: `font-mono font-semibold ${isSpooky ? 'text-cyan-400' : 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'}`, children: ["#", entry.resourceId] }) }), _jsx(TableCell, { className: `py-4 ${isSpooky ? 'text-gray-400' : 'text-gray-600'}`, children: entry.details || "-" })] }, `${entry.timestamp}-${index}`)))) })] }) }), _jsxs("div", { className: `flex items-center justify-between border-0 rounded-2xl px-5 py-4 shadow-lg ${isSpooky ? 'bg-slate-900 border border-cyan-500/30 shadow-cyan-500/10' : 'bg-white shadow-gray-200/50'}`, children: [_jsxs("div", { className: `text-sm ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`, children: ["Page ", _jsx("span", { className: `font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: currentSafePage }), " of", " ", _jsx("span", { className: `font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: totalPages }), " \u2022 Showing", " ", _jsx("span", { className: `font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: sortedData.length === 0 ? 0 : startIndex + 1 }), " -", " ", _jsx("span", { className: `font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: Math.min(endIndex, sortedData.length) }), " of", " ", _jsx("span", { className: `font-semibold ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: sortedData.length }), " entries"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: currentSafePage === 1, onClick: () => setCurrentPage((p) => p - 1), className: `disabled:opacity-30 rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`, children: "Previous" }), _jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                                                : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0 rounded-xl"
                                            : isSpooky
                                                ? "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-800 rounded-xl"
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-white rounded-xl", children: pageNum }, pageNum));
                                }) }), _jsx(Button, { variant: "outline", size: "sm", disabled: currentSafePage === totalPages, onClick: () => setCurrentPage((p) => p + 1), className: `disabled:opacity-30 rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`, children: "Next" })] })] })] }));
}
