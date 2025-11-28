import { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResourceFormProps {
  resource: any;
  mode: "create" | "edit";
  id?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ResourceForm({
  resource,
  mode,
  id,
  onSuccess,
  onCancel,
}: ResourceFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === "edit" && id) {
      fetchExisting();
    } else {
      const initial: Record<string, any> = {};
      resource.fields.forEach((field: any) => {
        if (field.name === resource.primaryKey) return;
        initial[field.name] =
          field.type === "boolean" ? false : field.type === "number" ? 0 : "";
      });
      setFormData(initial);
    }
  }, [mode, id, resource]);

  const fetchExisting = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await axios.get(
        `http://localhost:8000/proxy/${resource.name}/${id}`
      );
      setFormData(response.data);
    } catch (err) {
      console.error("Failed to fetch record for edit, using mock data.", err);
      setLoadError("Backend not reachable. Using mock values for editing.");
      const mock: Record<string, any> = {};
      resource.fields.forEach((field: any, idx: number) => {
        if (field.name === resource.primaryKey) {
          mock[field.name] = id;
          return;
        }
        switch (field.type) {
          case "string":
            mock[field.name] = `Sample ${field.displayName} ${id}`;
            break;
          case "email":
            mock[field.name] = `user${id}@example.com`;
            break;
          case "number":
            mock[field.name] = 1000 + Number(id || 1) * 7 + idx;
            break;
          case "boolean":
            mock[field.name] = Number(id || 1) % 2 === 0;
            break;
          case "date":
            mock[field.name] = new Date(2024, 0, idx + 1)
              .toISOString()
              .substring(0, 10);
            break;
          default:
            mock[field.name] = `Value ${id}`;
        }
      });
      setFormData(mock);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setLoading(true);
    try {
      if (mode === "create") {
        await axios.post(
          `http://localhost:8000/proxy/${resource.name}`,
          formData
        );
      } else if (mode === "edit" && id) {
        await axios.put(
          `http://localhost:8000/proxy/${resource.name}/${id}`,
          formData
        );
      }
      onSuccess();
    } catch (err) {
      console.error("Save failed, simulating success in demo.", err);
      setSaveError(
        "Backend not reachable. Simulating successful save for demo."
      );
      setTimeout(() => {
        onSuccess();
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  const titlePrefix = mode === "create" ? "Create" : "Edit";

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="border-slate-700 text-gray-300 hover:bg-slate-800"
        onClick={() =>
          mode === "create"
            ? navigate(`/portal/${resource.name}`)
            : navigate(`/portal/${resource.name}/${id}`)
        }
      >
        ← Back
      </Button>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            {titlePrefix} {resource.displayName.slice(0, -1)}
          </CardTitle>
          {loadError && (
            <p className="text-sm text-yellow-300 mt-2">{loadError}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resource.fields.map((field: any) => {
                const isPrimary = field.name === resource.primaryKey;
                const value = formData[field.name] ?? "";

                if (mode === "create" && isPrimary) {
                  return null;
                }

                const label = field.displayName;

                if (field.type === "boolean") {
                  return (
                    <div key={field.name} className="space-y-1">
                      <div className="text-xs uppercase text-gray-500 tracking-wide">
                        {label}
                      </div>
                      <Select
                        value={value ? "true" : "false"}
                        onValueChange={(v) =>
                          handleChange(field.name, v === "true")
                        }
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                if (field.type === "text") {
                  return (
                    <div key={field.name} className="space-y-1 md:col-span-2">
                      <div className="text-xs uppercase text-gray-500 tracking-wide">
                        {label}
                      </div>
                      <Textarea
                        value={value}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  );
                }

                const inputType =
                  field.type === "number"
                    ? "number"
                    : field.type === "email"
                    ? "email"
                    : field.type === "date"
                    ? "date"
                    : "text";

                return (
                  <div key={field.name} className="space-y-1">
                    <div className="text-xs uppercase text-gray-500 tracking-wide">
                      {label}
                    </div>
                    <Input
                      type={inputType}
                      value={value}
                      onChange={(e) =>
                        handleChange(
                          field.name,
                          inputType === "number"
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                      disabled={isPrimary && mode === "edit"}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                );
              })}
            </div>

            {saveError && (
              <div className="p-3 rounded bg-yellow-900/30 border border-yellow-600/50 text-yellow-200 text-sm">
                {saveError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="border-slate-700 text-gray-300 hover:bg-slate-800"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
