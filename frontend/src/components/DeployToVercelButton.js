import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Rocket, Loader2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
export function DeployToVercelButton({ resources, proxyConfig, className, isSpooky = false }) {
    const [deploymentState, setDeploymentState] = useState("idle");
    const [token, setToken] = useState("");
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [deploymentResult, setDeploymentResult] = useState({});
    const handleButtonClick = () => {
        // Always show modal and ask for token
        // Pre-fill with saved token if available, but don't auto-deploy
        const savedToken = localStorage.getItem("vercel_token");
        if (savedToken) {
            setToken(savedToken);
        }
        setShowTokenModal(true);
        setDeploymentState("idle");
    };
    const handleModalDeploy = () => {
        if (!token.trim())
            return;
        // Save token and deploy
        localStorage.setItem("vercel_token", token);
        deployToVercel(token);
    };
    const deployToVercel = async (deployToken) => {
        setDeploymentState("deploying");
        setDeploymentResult({});
        try {
            // Don't send frontend_files - let the backend generate fresh files
            // with the correct Vercel proxy URL baked in
            const response = await fetch("http://localhost:8000/api/deploy/vercel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: deployToken,
                    resources,
                    proxy_config: proxyConfig || {},
                    // frontend_files omitted - backend will generate with correct proxy URL
                    project_name: "admin-portal"
                }),
            });
            const data = await response.json();
            if (data.success) {
                setDeploymentState("success");
                setDeploymentResult({
                    frontendUrl: data.frontend_url,
                    proxyUrl: data.proxy_url
                });
            }
            else {
                setDeploymentState("error");
                setDeploymentResult({
                    error: data.error || "Deployment failed"
                });
                // If token was invalid, clear it
                if (data.error?.includes("token") || data.error?.includes("Invalid")) {
                    localStorage.removeItem("vercel_token");
                }
            }
        }
        catch (error) {
            setDeploymentState("error");
            setDeploymentResult({
                error: error.message || "Network error occurred"
            });
        }
    };
    const handleCloseModal = () => {
        setShowTokenModal(false);
        setDeploymentState("idle");
        setToken("");
        setDeploymentResult({});
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Button, { onClick: handleButtonClick, disabled: deploymentState === "deploying", className: className, children: [_jsx(Rocket, { className: "w-4 h-4 mr-2" }), "Deploy to Vercel"] }), _jsx(Dialog, { open: showTokenModal, onOpenChange: (open) => {
                    // Prevent closing during deployment
                    if (!open && deploymentState !== "deploying") {
                        handleCloseModal();
                    }
                }, children: _jsxs(DialogContent, { className: `sm:max-w-md ${isSpooky ? 'bg-slate-900 border-cyan-500/30' : 'bg-white'}`, children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: isSpooky ? 'text-cyan-400' : 'text-gray-900', children: [isSpooky ? '💀 ' : '', "Deploy to Vercel"] }), _jsxs(DialogDescription, { className: isSpooky ? 'text-gray-400' : 'text-gray-600', children: [deploymentState === "idle" && "Enter your Vercel API token to deploy your admin portal.", deploymentState === "deploying" && "Deploying your application to Vercel...", deploymentState === "success" && "Your application has been deployed successfully!", deploymentState === "error" && "Deployment failed. Please try again."] })] }), deploymentState === "idle" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { htmlFor: "token", className: `text-sm font-medium ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: "Vercel API Token" }), localStorage.getItem("vercel_token") && (_jsx("button", { type: "button", onClick: () => {
                                                                localStorage.removeItem("vercel_token");
                                                                setToken("");
                                                            }, className: "text-xs text-red-500 hover:text-red-400 underline", children: "Clear saved token" }))] }), _jsx("input", { id: "token", type: "password", placeholder: "vercel_xxxxxxxxxxxxx", value: token, onChange: (e) => setToken(e.target.value), onKeyDown: (e) => {
                                                        if (e.key === 'Enter' && token.trim()) {
                                                            handleModalDeploy();
                                                        }
                                                    }, className: `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${isSpooky ? 'border-cyan-500/30 text-cyan-400 bg-slate-800 focus:ring-cyan-500/30' : 'border-gray-300 text-gray-900 bg-white focus:ring-cyan-500'}`, autoFocus: true })] }), _jsxs("div", { className: `rounded-md p-3 ${isSpooky ? 'bg-amber-900/20 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`, children: [_jsxs("p", { className: `text-sm font-medium mb-2 flex items-center gap-2 ${isSpooky ? 'text-amber-400' : 'text-amber-800'}`, children: [_jsx(AlertCircle, { className: "w-4 h-4" }), "Running a local API?"] }), _jsxs("p", { className: `text-xs mb-2 ${isSpooky ? 'text-amber-300/80' : 'text-amber-700'}`, children: ["Vercel can't access ", _jsx("code", { className: "px-1 py-0.5 rounded bg-amber-100 text-amber-800", children: "localhost" }), ". To connect your local API:"] }), _jsxs("ol", { className: `text-xs space-y-1 ml-4 list-decimal ${isSpooky ? 'text-amber-300/80' : 'text-amber-700'}`, children: [_jsxs("li", { children: ["Use ", _jsx("a", { href: "https://ngrok.com", target: "_blank", rel: "noopener noreferrer", className: "underline font-medium", children: "ngrok" }), " to expose your API: ", _jsx("code", { className: "px-1 py-0.5 rounded bg-amber-100 text-amber-800", children: "ngrok http 8081" })] }), _jsxs("li", { children: ["Copy the public URL (e.g., ", _jsx("code", { className: "px-1 py-0.5 rounded bg-amber-100 text-amber-800", children: "https://abc123.ngrok.io" }), ")"] }), _jsx("li", { children: "Re-analyze your API using that URL" }), _jsx("li", { children: "Then deploy to Vercel" })] }), _jsxs("p", { className: `text-xs mt-2 ${isSpooky ? 'text-amber-400/70' : 'text-amber-600'}`, children: [_jsx("strong", { children: "Or:" }), " Deploy anyway to see a demo with mock data."] })] }), _jsxs("div", { className: `rounded-md p-3 ${isSpooky ? 'bg-violet-900/20 border border-violet-500/30' : 'bg-blue-50 border border-blue-200'}`, children: [_jsx("p", { className: `text-sm font-medium mb-2 ${isSpooky ? 'text-violet-400' : 'text-blue-900'}`, children: "How to get your Vercel API token:" }), _jsxs("ol", { className: `text-sm space-y-1 ml-4 list-decimal ${isSpooky ? 'text-violet-300' : 'text-blue-800'}`, children: [_jsxs("li", { children: ["Visit ", _jsx("a", { href: "https://vercel.com/account/tokens", target: "_blank", rel: "noopener noreferrer", className: "underline font-medium", children: "vercel.com/account/tokens" })] }), _jsx("li", { children: "Click \"Create Token\" button" }), _jsx("li", { children: "Give it a name (e.g., \"Admin Portal\")" }), _jsxs("li", { children: ["Select scope: ", _jsx("span", { className: "font-medium", children: "Full Account" })] }), _jsx("li", { children: "Copy the generated token" }), _jsx("li", { children: "Paste it in the field above" })] }), _jsx("div", { className: `mt-3 pt-3 ${isSpooky ? 'border-t border-violet-500/30' : 'border-t border-blue-200'}`, children: _jsxs("p", { className: `text-xs ${isSpooky ? 'text-violet-400' : 'text-blue-700'}`, children: [_jsx("strong", { children: "Note:" }), " Your token will be saved locally for convenience, but you can always change it."] }) })] })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "outline", onClick: handleCloseModal, className: `${isSpooky ? 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`, children: "Cancel" }), _jsxs(Button, { onClick: handleModalDeploy, disabled: !token.trim(), className: "bg-cyan-600 hover:bg-cyan-700 text-white", children: [_jsx(Rocket, { className: "w-4 h-4 mr-2" }), "Deploy"] })] })] })), deploymentState === "deploying" && (_jsxs("div", { className: "py-8 flex flex-col items-center justify-center space-y-4", children: [_jsx(Loader2, { className: `w-12 h-12 animate-spin ${isSpooky ? 'text-cyan-400' : 'text-cyan-600'}` }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: `text-sm font-medium ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`, children: "Deploying to Vercel..." }), _jsx("p", { className: `text-xs mt-1 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`, children: "This may take a few minutes" })] })] })), deploymentState === "success" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "py-6 space-y-4", children: [_jsx("div", { className: "flex items-center justify-center", children: _jsx(CheckCircle2, { className: `w-16 h-16 ${isSpooky ? 'text-cyan-400' : 'text-cyan-600'}` }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: `rounded-md p-3 ${isSpooky ? 'bg-cyan-900/20 border border-cyan-500/30' : 'bg-cyan-50 border border-cyan-200'}`, children: [_jsx("p", { className: `text-sm font-medium mb-2 ${isSpooky ? 'text-cyan-400' : 'text-cyan-900'}`, children: "Frontend URL:" }), _jsxs("a", { href: deploymentResult.frontendUrl, target: "_blank", rel: "noopener noreferrer", className: `text-sm break-all flex items-center gap-1 ${isSpooky ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-700 hover:text-cyan-800'}`, children: [deploymentResult.frontendUrl, _jsx(ExternalLink, { className: "w-3 h-3 flex-shrink-0" })] })] }), _jsxs("div", { className: `rounded-md p-3 ${isSpooky ? 'bg-violet-900/20 border border-violet-500/30' : 'bg-blue-50 border border-blue-200'}`, children: [_jsx("p", { className: `text-sm font-medium mb-2 ${isSpooky ? 'text-violet-400' : 'text-blue-900'}`, children: "Proxy URL:" }), _jsxs("a", { href: deploymentResult.proxyUrl, target: "_blank", rel: "noopener noreferrer", className: `text-sm break-all flex items-center gap-1 ${isSpooky ? 'text-violet-300 hover:text-violet-200' : 'text-blue-700 hover:text-blue-800'}`, children: [deploymentResult.proxyUrl, _jsx(ExternalLink, { className: "w-3 h-3 flex-shrink-0" })] })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: handleCloseModal, className: `text-white ${isSpooky ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-600 hover:bg-cyan-700'}`, children: "Done" }) })] })), deploymentState === "error" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "py-6 space-y-4", children: [_jsx("div", { className: "flex items-center justify-center", children: _jsx(AlertCircle, { className: "w-16 h-16 text-red-600" }) }), _jsxs("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: [_jsx("p", { className: "text-sm font-medium text-red-900 mb-2", children: "Error Details:" }), _jsx("p", { className: "text-sm text-red-700 whitespace-pre-wrap break-words", children: deploymentResult.error })] })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "outline", onClick: handleCloseModal, className: "text-gray-700 border-gray-300 hover:bg-gray-50", children: "Close" }), _jsx(Button, { onClick: () => {
                                                setDeploymentState("idle");
                                                setDeploymentResult({});
                                            }, className: "bg-cyan-600 hover:bg-cyan-700 text-white", children: "Try Again" })] })] }))] }) })] }));
}
