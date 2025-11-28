import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Menu, Skull } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ResourceList from "@/components/ResourceList";
import ResourceDetail from "@/components/ResourceDetail";
import ResourceForm from "@/components/ResourceForm";
import Dashboard from "@/components/Dashboard";
import { LoadingSpinner } from "@/components/LoadingState";

export default function PortalPage() {
  const { resource, id } = useParams();
  const navigate = useNavigate();
  const [schema, setSchema] = useState<any | null>(null);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<"list" | "detail" | "create" | "edit">(
    "list"
  );

  useEffect(() => {
    const stored = localStorage.getItem("app-schema");
    if (!stored) {
      navigate("/");
      return;
    }

    const parsed = JSON.parse(stored);
    setSchema(parsed);

    if (!resource) {
      setSelectedResource(null);
      return;
    }

    const res = parsed.resources.find((r: any) => r.name === resource);
    if (res) {
      setSelectedResource(res);

      if (id === "new") {
        setMode("create");
      } else if (id) {
        setMode("detail");
      } else {
        setMode("list");
      }
    }
  }, [resource, id, navigate]);

  if (!schema) {
    return <LoadingSpinner message="Loading schema..." />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar
        resources={schema.resources}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-800 rounded transition"
              >
                <Menu className="w-6 h-6 text-gray-400" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <Skull className="w-8 h-8 text-green-500 ghost-float" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  {selectedResource ? selectedResource.displayName : "Dashboard"}
                </h1>
                {selectedResource && (
                  <p className="text-sm text-gray-400">
                    {mode === "create"
                      ? "Create New"
                      : mode === "edit"
                      ? "Edit Record"
                      : mode === "detail"
                      ? `Details #${id}`
                      : "All Records"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {!selectedResource ? (
            <Dashboard resources={schema.resources} />
          ) : mode === "list" ? (
            <ResourceList resource={selectedResource} />
          ) : mode === "detail" ? (
            <ResourceDetail
              resource={selectedResource}
              id={id as string}
              onEdit={() => setMode("edit")}
            />
          ) : mode === "create" ? (
            <ResourceForm
              resource={selectedResource}
              mode="create"
              onSuccess={() => navigate(`/portal/${resource}`)}
              onCancel={() => navigate(`/portal/${resource}`)}
            />
          ) : (
            <ResourceForm
              resource={selectedResource}
              mode="edit"
              id={id as string}
              onSuccess={() => navigate(`/portal/${resource}/${id}`)}
              onCancel={() => navigate(`/portal/${resource}/${id}`)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
