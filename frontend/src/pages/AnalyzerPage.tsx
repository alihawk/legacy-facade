import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Skull, Upload, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";

interface ResourceField {
  name: string;
  type: string;
  displayName: string;
}

interface ResourceSchema {
  name: string;
  displayName: string;
  endpoint: string;
  primaryKey: string;
  fields: ResourceField[];
  operations: string[];
}

export default function AnalyzerPage() {
  const [specJson, setSpecJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resources, setResources] = useState<ResourceSchema[]>([]);
  const [analyzed, setAnalyzed] = useState(false);
  const navigate = useNavigate();

  const buildFallbackResources = (): ResourceSchema[] => {
    // Simple demo schema that matches the "Legacy HR API" example
    return [
      {
        name: "users",
        displayName: "Users",
        endpoint: "/api/v1/GetAllUsers",
        primaryKey: "user_id",
        fields: [
          { name: "user_id", type: "number", displayName: "User ID" },
          { name: "full_name", type: "string", displayName: "Full Name" },
          { name: "email_address", type: "email", displayName: "Email" },
          { name: "dept_code", type: "string", displayName: "Department" },
          { name: "is_active", type: "boolean", displayName: "Active" },
          { name: "hire_date", type: "date", displayName: "Hire Date" },
        ],
        operations: ["list", "detail", "create", "update"],
      },
    ];
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");

    let spec: unknown;
    try {
      spec = JSON.parse(specJson);
    } catch {
      setLoading(false);
      setError("Invalid JSON format. Please check your OpenAPI spec.");
      return;
    }

    try {
      // Call FastAPI backend if available
      const response = await axios.post("http://localhost:8000/api/analyze", {
        specJson: spec,
      });

      const backendResources = response.data.resources as ResourceSchema[];
      setResources(backendResources);
      setAnalyzed(true);
    } catch (err: any) {
      console.warn("Backend analyze failed, using fallback resources.", err);
      setError(
        err?.response?.data?.detail ||
          "Backend not reachable. Using local demo resources."
      );
      const fallback = buildFallbackResources();
      setResources(fallback);
      setAnalyzed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    // Save schema to localStorage for portal to use
    localStorage.setItem("app-schema", JSON.stringify({ resources }));
    navigate("/portal");
  };

  // Demo: Load example OpenAPI spec
  const loadExample = () => {
    const exampleSpec = {
      openapi: "3.0.0",
      info: { title: "Legacy HR API", version: "1.0.0" },
      paths: {
        "/api/v1/GetAllUsers": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        Data: {
                          type: "object",
                          properties: {
                            Users: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  user_id: { type: "integer" },
                                  full_name: { type: "string" },
                                  email_address: { type: "string" },
                                  dept_code: { type: "string" },
                                  is_active: { type: "integer" },
                                  hire_date: { type: "string" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    setSpecJson(JSON.stringify(exampleSpec, null, 2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Skull className="w-20 h-20 text-green-500 ghost-float" />
            <h1 className="text-6xl font-bold text-white">
              Legacy UX <span className="text-green-500">Reviver</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Resurrect your dead APIs with modern, beautiful UIs. No backend
            changes required.
          </p>
        </div>

        {!analyzed ? (
          // UPLOAD INTERFACE
          <Card className="bg-slate-900 border-green-500/30 shadow-2xl">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <FileJson className="w-6 h-6 text-green-500" />
                Step 1: Paste Your OpenAPI Spec
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              <Textarea
                value={specJson}
                onChange={(e) => setSpecJson(e.target.value)}
                placeholder='{"openapi": "3.0.0", "paths": {...}}'
                className="min-h-[400px] font-mono text-sm bg-slate-950 text-green-400 border-green-500/30 focus:border-green-500"
              />

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={loadExample}
                  className="border-slate-700 text-gray-300 hover:bg-slate-800"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Load Example
                </Button>

                <div className="text-sm text-gray-500">
                  {specJson.length} characters
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={loading || !specJson}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 spooky-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Analyzing API...
                  </>
                ) : (
                  <>
                    <Skull className="mr-2 w-5 h-5" />
                    Analyze &amp; Resurrect
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // RESULTS INTERFACE
          <Card className="bg-slate-900 border-green-500/30 shadow-2xl">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                ✅ Found {resources.length} Resources
              </CardTitle>
              <p className="text-gray-400 mt-2">
                Your API has been analyzed and is ready for resurrection
              </p>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              {resources.map((resource) => (
                <div
                  key={resource.name}
                  className="p-5 bg-slate-950 border border-green-500/20 rounded-lg hover:border-green-500/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-green-400 mb-2">
                        {resource.displayName}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3">
                        {resource.fields.length} fields •{" "}
                        {resource.operations.length} operations
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {resource.operations.map((op) => (
                          <span
                            key={op}
                            className="text-xs px-3 py-1 bg-slate-800 text-gray-300 rounded-full border border-slate-700"
                          >
                            {op}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={handleGenerate}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 mt-6 spooky-glow"
              >
                <Skull className="mr-2 w-5 h-5" />
                Generate Portal →
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setAnalyzed(false);
                  setResources([]);
                  setSpecJson("");
                  setError("");
                }}
                className="w-full text-gray-400 hover:text-white"
              >
                ← Start Over
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
