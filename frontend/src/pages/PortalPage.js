"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { Download, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ResourceList from "@/components/ResourceList";
import ResourceDetail from "@/components/ResourceDetail";
import ResourceForm from "@/components/ResourceForm";
import ResourceActivity from "@/components/ResourceActivity";
import ResourceSettings from "@/components/ResourceSettings";
import { Button } from "@/components/ui/button";
import { projectGenerator } from "@/services/ProjectGenerator";
import { DeployToVercelButton } from "@/components/DeployToVercelButton";
import { ThemeToggle } from "@/components/ThemeToggle";
export default function PortalPage() {
    const [resources, setResources] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [proxyConfig, setProxyConfig] = useState(null);
    const [customization, setCustomization] = useState(null);
    const [currentTheme, setCurrentTheme] = useState('light');
    const navigate = useNavigate();
    useEffect(() => {
        const stored = localStorage.getItem("app-schema");
        const storedCustomization = localStorage.getItem("portal-customization");
        if (stored) {
            const parsed = JSON.parse(stored);
            setResources(parsed.resources || []);
        }
        else {
            navigate("/");
        }
        // Load customization settings
        if (storedCustomization) {
            const parsedCustomization = JSON.parse(storedCustomization);
            setCustomization(parsedCustomization);
            // Set theme from customization (default to light if not set or if auto)
            const themeMode = parsedCustomization.theme?.mode;
            setCurrentTheme(themeMode === 'dark' ? 'dark' : 'light');
        }
        else {
            // Default customization if none found
            const defaultCustomization = {
                dashboard: { statsCards: true, barChart: true, recentActivity: true },
                listView: { bulkSelection: true, bulkDelete: true, csvExport: true, smartFieldRendering: true },
                forms: { smartInputs: true },
                theme: { mode: 'light', accentColor: 'blue' }
            };
            setCustomization(defaultCustomization);
            setCurrentTheme('light');
        }
        // Fetch proxy configuration
        const fetchProxyConfig = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/proxy/config");
                if (response.ok) {
                    const data = await response.json();
                    setProxyConfig(data);
                }
            }
            catch (error) {
                console.warn("Could not fetch proxy config:", error);
            }
        };
        fetchProxyConfig();
    }, [navigate]);
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // Get schemas from localStorage
            const stored = localStorage.getItem("app-schema");
            if (!stored) {
                alert("No schema found. Please analyze an API first.");
                return;
            }
            const parsed = JSON.parse(stored);
            const schemas = parsed.resources || [];
            if (schemas.length === 0) {
                alert("No resources found in schema.");
                return;
            }
            // Get baseUrl from localStorage or use default
            const baseUrl = localStorage.getItem("api-base-url") || "http://localhost:8000";
            // Fetch proxy configuration from backend
            let proxyConfig = null;
            try {
                const proxyConfigResponse = await fetch("http://localhost:8000/api/proxy/config");
                if (proxyConfigResponse.ok) {
                    const data = await proxyConfigResponse.json();
                    proxyConfig = data;
                    console.log("✓ Proxy configuration loaded from backend");
                }
                else if (proxyConfigResponse.status === 404) {
                    console.warn("⚠ Proxy not configured - using defaults");
                    // Show warning to user
                    const useDefaults = confirm("⚠️ Proxy server not configured.\n\n" +
                        "The downloaded project will include a proxy server with default configuration.\n" +
                        "You'll need to update proxy-server/config.json with your API details.\n\n" +
                        "Continue with download?");
                    if (!useDefaults) {
                        return;
                    }
                }
                else {
                    console.warn("⚠ Failed to fetch proxy config - using defaults");
                }
            }
            catch (error) {
                console.warn("⚠ Could not connect to backend - using defaults", error);
                // Backend might not be running, continue with defaults
            }
            // Get customization settings
            const storedCustomization = localStorage.getItem("portal-customization");
            const customizationSettings = storedCustomization ? JSON.parse(storedCustomization) : null;
            // Generate the project ZIP with proxy config and customization
            const blob = await projectGenerator.generate(schemas, baseUrl, proxyConfig, customizationSettings);
            // Create download link and trigger download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `admin-portal-${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            // Show success message
            if (proxyConfig) {
                alert("✅ Project downloaded successfully with proxy configuration!");
            }
            else {
                alert("✅ Project downloaded successfully!\n\n" +
                    "⚠️ Note: Using default proxy configuration.\n" +
                    "Please update proxy-server/config.json with your API details.");
            }
        }
        catch (error) {
            console.error("Failed to generate project:", error);
            alert(`❌ Failed to generate project: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        finally {
            setIsDownloading(false);
        }
    };
    if (resources.length === 0) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading portal..." })] }) }));
    }
    // Handle theme change
    const handleThemeChange = (theme) => {
        setCurrentTheme(theme);
        // Update customization in localStorage
        const updatedCustomization = {
            ...customization,
            theme: { ...customization?.theme, mode: theme }
        };
        setCustomization(updatedCustomization);
        localStorage.setItem("portal-customization", JSON.stringify(updatedCustomization));
    };
    // Determine if spooky theme is enabled
    const isSpookyTheme = currentTheme === 'dark';
    return (_jsxs("div", { className: `min-h-screen ${isSpookyTheme ? 'bg-slate-950' : 'bg-gray-50'}`, children: [_jsx(Sidebar, { resources: resources, open: sidebarOpen, onToggle: () => setSidebarOpen(!sidebarOpen), isSpooky: isSpookyTheme }), _jsxs("main", { className: `transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`, children: [_jsx("div", { className: `${isSpookyTheme ? 'bg-slate-900 border-cyan-500/30' : 'bg-white border-gray-200'} border-b px-8 py-4 sticky top-0 z-30 shadow-sm`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: `text-xl font-semibold ${isSpookyTheme ? 'text-cyan-400' : 'text-gray-900'}`, children: ["Admin Portal", isSpookyTheme ? ' 💀' : ''] }), _jsxs("p", { className: `text-sm ${isSpookyTheme ? 'text-gray-400' : 'text-gray-500'}`, children: [resources.length, " resources loaded"] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ThemeToggle, { currentTheme: currentTheme, onThemeChange: handleThemeChange, isSpooky: isSpookyTheme }), _jsx(Button, { onClick: handleDownload, disabled: isDownloading, className: `shadow-lg text-white ${isSpookyTheme ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-violet-500/25' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`, children: isDownloading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Generating..."] })) : (_jsxs(_Fragment, { children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download Project"] })) }), _jsx(DeployToVercelButton, { resources: resources, proxyConfig: proxyConfig, className: `shadow-lg text-white ${isSpookyTheme ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-cyan-500/25' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/25'}`, isSpooky: isSpookyTheme })] })] }) }), _jsx("div", { className: `p-8 ${isSpookyTheme ? 'bg-slate-950' : ''}`, children: _jsxs(Routes, { children: [_jsx(Route, { index: true, element: _jsx(Dashboard, { resources: resources, customization: customization, isSpooky: isSpookyTheme }) }), _jsx(Route, { path: ":resourceName", element: _jsx(ResourceListWrapper, { resources: resources, isSpooky: isSpookyTheme, customization: customization }) }), _jsx(Route, { path: ":resourceName/activity", element: _jsx(ResourceActivityWrapper, { resources: resources, isSpooky: isSpookyTheme }) }), _jsx(Route, { path: ":resourceName/settings", element: _jsx(ResourceSettingsWrapper, { resources: resources, isSpooky: isSpookyTheme }) }), _jsx(Route, { path: ":resourceName/new", element: _jsx(ResourceFormWrapper, { resources: resources, mode: "create", isSpooky: isSpookyTheme }) }), _jsx(Route, { path: ":resourceName/:id", element: _jsx(ResourceDetailWrapper, { resources: resources, isSpooky: isSpookyTheme }) }), _jsx(Route, { path: ":resourceName/:id/edit", element: _jsx(ResourceFormWrapper, { resources: resources, mode: "edit", isSpooky: isSpookyTheme }) })] }) })] })] }));
}
// Wrapper components to extract params
function ResourceListWrapper({ resources, isSpooky, customization }) {
    const { resourceName } = useParams();
    const resource = resources.find((r) => r.name === resourceName);
    if (!resource)
        return _jsx("div", { className: isSpooky ? "text-gray-400" : "text-gray-600", children: "Resource not found" });
    return _jsx(ResourceList, { resource: resource, isSpooky: isSpooky, customization: customization });
}
function ResourceActivityWrapper({ resources, isSpooky }) {
    const { resourceName } = useParams();
    const resource = resources.find((r) => r.name === resourceName);
    if (!resource)
        return _jsx("div", { className: isSpooky ? "text-gray-400" : "text-gray-600", children: "Resource not found" });
    return _jsx(ResourceActivity, { resource: resource, isSpooky: isSpooky });
}
function ResourceSettingsWrapper({ resources, isSpooky }) {
    const { resourceName } = useParams();
    const resource = resources.find((r) => r.name === resourceName);
    if (!resource)
        return _jsx("div", { className: isSpooky ? "text-gray-400" : "text-gray-600", children: "Resource not found" });
    return _jsx(ResourceSettings, { resource: resource, isSpooky: isSpooky });
}
function ResourceDetailWrapper({ resources, isSpooky }) {
    const { resourceName, id } = useParams();
    const resource = resources.find((r) => r.name === resourceName);
    if (!resource || !id)
        return _jsx("div", { className: isSpooky ? "text-gray-400" : "text-gray-600", children: "Resource not found" });
    return _jsx(ResourceDetail, { resource: resource, id: id, isSpooky: isSpooky });
}
function ResourceFormWrapper({ resources, mode, isSpooky, }) {
    const { resourceName, id } = useParams();
    const navigate = useNavigate();
    const resource = resources.find((r) => r.name === resourceName);
    if (!resource)
        return _jsx("div", { className: isSpooky ? "text-gray-400" : "text-gray-600", children: "Resource not found" });
    return (_jsx(ResourceForm, { resource: resource, mode: mode, id: id, onSuccess: () => navigate(`/portal/${resourceName}`), onCancel: () => navigate(mode === "edit" ? `/portal/${resourceName}/${id}` : `/portal/${resourceName}`), isSpooky: isSpooky }));
}
