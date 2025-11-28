import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Database, Home, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  resources: any[];
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ resources, open, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentResource = location.pathname.split("/")[2];

  if (!open) return null;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-700 flex flex-col z-40">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className="w-6 h-6 text-green-500" />
          <span className="text-sm font-bold text-white">Legacy Portal</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-slate-800 rounded transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Dashboard Link */}
        <button
          onClick={() => navigate("/portal")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left",
            !currentResource
              ? "bg-green-600 text-white"
              : "text-gray-300 hover:bg-slate-800"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </button>

        <div className="pt-4 pb-2 px-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Resources
          </span>
        </div>

        {/* Resource Links */}
        {resources.map((resource) => (
          <button
            key={resource.name}
            onClick={() => navigate(`/portal/${resource.name}`)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left",
              currentResource === resource.name
                ? "bg-green-600 text-white"
                : "text-gray-300 hover:bg-slate-800"
            )}
          >
            <Database className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-medium">{resource.displayName}</div>
              <div className="text-xs opacity-75">
                {resource.fields.length} fields
              </div>
            </div>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-gray-500">
          {resources.length} resource{resources.length !== 1 ? "s" : ""} loaded
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="w-full mt-2 text-gray-400 hover:text-white justify-start"
        >
          ← Back to Analyzer
        </Button>
      </div>
    </aside>
  );
}
