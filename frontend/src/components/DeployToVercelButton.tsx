import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Rocket, Loader2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface DeployToVercelButtonProps {
  resources: any[];
  proxyConfig: any;
  className?: string;
  isSpooky?: boolean;
}

type DeploymentState = "idle" | "deploying" | "success" | "error";

export function DeployToVercelButton({ resources, proxyConfig, className, isSpooky = false }: DeployToVercelButtonProps) {
  const [deploymentState, setDeploymentState] = useState<DeploymentState>("idle");
  const [token, setToken] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    frontendUrl?: string;
    proxyUrl?: string;
    error?: string;
  }>({});

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
    if (!token.trim()) return;
    
    // Save token and deploy
    localStorage.setItem("vercel_token", token);
    deployToVercel(token);
  };

  const deployToVercel = async (deployToken: string) => {
    setDeploymentState("deploying");
    setDeploymentResult({});
    
    try {
      // Don't send frontend_files - let the backend generate fresh files
      // with the correct Vercel proxy URL baked in
      const response = await fetch(`${API_URL}/api/deploy/vercel`, {
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
      } else {
        setDeploymentState("error");
        setDeploymentResult({
          error: data.error || "Deployment failed"
        });
        
        // If token was invalid, clear it
        if (data.error?.includes("token") || data.error?.includes("Invalid")) {
          localStorage.removeItem("vercel_token");
        }
      }
    } catch (error: any) {
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

  return (
    <>
      <Button
        onClick={handleButtonClick}
        disabled={deploymentState === "deploying"}
        className={className}
      >
        <Rocket className="w-4 h-4 mr-2" />
        Deploy to Vercel
      </Button>

      <Dialog 
        open={showTokenModal} 
        onOpenChange={(open) => {
          // Prevent closing during deployment
          if (!open && deploymentState !== "deploying") {
            handleCloseModal();
          }
        }}
      >
        <DialogContent className={`sm:max-w-md ${isSpooky ? 'bg-slate-900 border-cyan-500/30' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={isSpooky ? 'text-cyan-400' : 'text-gray-900'}>{isSpooky ? '💀 ' : ''}Deploy to Vercel</DialogTitle>
            <DialogDescription className={isSpooky ? 'text-gray-400' : 'text-gray-600'}>
              {deploymentState === "idle" && "Enter your Vercel API token to deploy your admin portal."}
              {deploymentState === "deploying" && "Deploying your application to Vercel..."}
              {deploymentState === "success" && "Your application has been deployed successfully!"}
              {deploymentState === "error" && "Deployment failed. Please try again."}
            </DialogDescription>
          </DialogHeader>
          
          {/* Idle State - Token Input */}
          {deploymentState === "idle" && (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="token" className={`text-sm font-medium ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`}>
                      Vercel API Token
                    </label>
                    {localStorage.getItem("vercel_token") && (
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem("vercel_token");
                          setToken("");
                        }}
                        className="text-xs text-red-500 hover:text-red-400 underline"
                      >
                        Clear saved token
                      </button>
                    )}
                  </div>
                  <input
                    id="token"
                    type="password"
                    placeholder="vercel_xxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && token.trim()) {
                        handleModalDeploy();
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${isSpooky ? 'border-cyan-500/30 text-cyan-400 bg-slate-800 focus:ring-cyan-500/30' : 'border-gray-300 text-gray-900 bg-white focus:ring-cyan-500'}`}
                    autoFocus
                  />
                </div>

                {/* Warning about local APIs */}
                <div className={`rounded-md p-3 ${isSpooky ? 'bg-amber-900/20 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
                  <p className={`text-sm font-medium mb-2 flex items-center gap-2 ${isSpooky ? 'text-amber-400' : 'text-amber-800'}`}>
                    <AlertCircle className="w-4 h-4" />
                    Running a local API?
                  </p>
                  <p className={`text-xs mb-2 ${isSpooky ? 'text-amber-300/80' : 'text-amber-700'}`}>
                    Vercel can't access <code className="px-1 py-0.5 rounded bg-amber-100 text-amber-800">localhost</code>. To connect your local API:
                  </p>
                  <ol className={`text-xs space-y-1 ml-4 list-decimal ${isSpooky ? 'text-amber-300/80' : 'text-amber-700'}`}>
                    <li>Use <a href="https://ngrok.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">ngrok</a> to expose your API: <code className="px-1 py-0.5 rounded bg-amber-100 text-amber-800">ngrok http 8081</code></li>
                    <li>Copy the public URL (e.g., <code className="px-1 py-0.5 rounded bg-amber-100 text-amber-800">https://abc123.ngrok.io</code>)</li>
                    <li>Re-analyze your API using that URL</li>
                    <li>Then deploy to Vercel</li>
                  </ol>
                  <p className={`text-xs mt-2 ${isSpooky ? 'text-amber-400/70' : 'text-amber-600'}`}>
                    <strong>Or:</strong> Deploy anyway to see a demo with mock data.
                  </p>
                </div>

                <div className={`rounded-md p-3 ${isSpooky ? 'bg-violet-900/20 border border-violet-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-sm font-medium mb-2 ${isSpooky ? 'text-violet-400' : 'text-blue-900'}`}>How to get your Vercel API token:</p>
                  <ol className={`text-sm space-y-1 ml-4 list-decimal ${isSpooky ? 'text-violet-300' : 'text-blue-800'}`}>
                    <li>Visit <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="underline font-medium">vercel.com/account/tokens</a></li>
                    <li>Click "Create Token" button</li>
                    <li>Give it a name (e.g., "Admin Portal")</li>
                    <li>Select scope: <span className="font-medium">Full Account</span></li>
                    <li>Copy the generated token</li>
                    <li>Paste it in the field above</li>
                  </ol>
                  <div className={`mt-3 pt-3 ${isSpooky ? 'border-t border-violet-500/30' : 'border-t border-blue-200'}`}>
                    <p className={`text-xs ${isSpooky ? 'text-violet-400' : 'text-blue-700'}`}>
                      <strong>Note:</strong> Your token will be saved locally for convenience, but you can always change it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className={`${isSpooky ? 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleModalDeploy}
                  disabled={!token.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy
                </Button>
              </div>
            </>
          )}

          {/* Deploying State */}
          {deploymentState === "deploying" && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <Loader2 className={`w-12 h-12 animate-spin ${isSpooky ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <div className="text-center">
                <p className={`text-sm font-medium ${isSpooky ? 'text-cyan-400' : 'text-gray-900'}`}>Deploying to Vercel...</p>
                <p className={`text-xs mt-1 ${isSpooky ? 'text-gray-400' : 'text-gray-500'}`}>This may take a few minutes</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {deploymentState === "success" && (
            <>
              <div className="py-6 space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle2 className={`w-16 h-16 ${isSpooky ? 'text-cyan-400' : 'text-cyan-600'}`} />
                </div>
                
                <div className="space-y-3">
                  <div className={`rounded-md p-3 ${isSpooky ? 'bg-cyan-900/20 border border-cyan-500/30' : 'bg-cyan-50 border border-cyan-200'}`}>
                    <p className={`text-sm font-medium mb-2 ${isSpooky ? 'text-cyan-400' : 'text-cyan-900'}`}>Frontend URL:</p>
                    <a
                      href={deploymentResult.frontendUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm break-all flex items-center gap-1 ${isSpooky ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-700 hover:text-cyan-800'}`}
                    >
                      {deploymentResult.frontendUrl}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                  
                  <div className={`rounded-md p-3 ${isSpooky ? 'bg-violet-900/20 border border-violet-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                    <p className={`text-sm font-medium mb-2 ${isSpooky ? 'text-violet-400' : 'text-blue-900'}`}>Proxy URL:</p>
                    <a
                      href={deploymentResult.proxyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm break-all flex items-center gap-1 ${isSpooky ? 'text-violet-300 hover:text-violet-200' : 'text-blue-700 hover:text-blue-800'}`}
                    >
                      {deploymentResult.proxyUrl}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleCloseModal}
                  className={`text-white ${isSpooky ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                >
                  Done
                </Button>
              </div>
            </>
          )}

          {/* Error State */}
          {deploymentState === "error" && (
            <>
              <div className="py-6 space-y-4">
                <div className="flex items-center justify-center">
                  <AlertCircle className="w-16 h-16 text-red-600" />
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm font-medium text-red-900 mb-2">Error Details:</p>
                  <p className="text-sm text-red-700 whitespace-pre-wrap break-words">
                    {deploymentResult.error}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setDeploymentState("idle");
                    setDeploymentResult({});
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
