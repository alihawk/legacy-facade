import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./LoadingState";

interface ResourceDetailProps {
  resource: any;
  id: string;
  onEdit: () => void;
}

export default function ResourceDetail({
  resource,
  id,
  onEdit,
}: ResourceDetailProps) {
  const [record, setRecord] = useState<any | null>(null);
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
      const response = await axios.get(
        `http://localhost:8000/proxy/${resource.name}/${id}`
      );
      setRecord(response.data);
    } catch (err) {
      console.error("Failed to fetch detail, using mock detail.", err);
      setError("Backend not reachable. Showing mock record.");
      setRecord(generateMockRecord(parseInt(id, 10) || 1));
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecord = (num: number) => {
    const mock: any = {};
    mock[resource.primaryKey] = num;

    resource.fields.forEach((field: any, idx: number) => {
      if (field.name === resource.primaryKey) return;

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

  const formatValue = (value: any, field: any) => {
    if (value === null || value === undefined) return "-";

    switch (field.type) {
      case "date":
        return new Date(value).toLocaleString();
      case "boolean":
        return value ? "Yes" : "No";
      case "number":
        return Number(value).toLocaleString();
      case "email":
        return value;
      default:
        return String(value);
    }
  };

  if (loading || !record) {
    return <LoadingSpinner message={`Loading ${resource.displayName} #${id}`} />;
  }

  const primaryKeyValue = record[resource.primaryKey];

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="border-slate-700 text-gray-300 hover:bg-slate-800"
        onClick={() => navigate(`/portal/${resource.name}`)}
      >
        ← Back to list
      </Button>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              {resource.displayName.slice(0, -1)} Details
            </CardTitle>
            <p className="text-gray-400 mt-1">
              ID:{" "}
              <span className="font-mono text-green-400">
                {primaryKeyValue}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-slate-700 text-gray-300 hover:bg-slate-800"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              className="border-red-500/70 text-red-300 hover:bg-red-900/40"
              // demo only
              onClick={() =>
                window.alert(
                  "Delete is not wired yet. This is a demo action."
                )
              }
            >
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded bg-yellow-900/30 border border-yellow-600/50 text-yellow-200 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resource.fields.map((field: any) => {
              const value = record[field.name];

              if (field.type === "boolean") {
                return (
                  <div key={field.name} className="space-y-1">
                    <div className="text-xs uppercase text-gray-500 tracking-wide">
                      {field.displayName}
                    </div>
                    <Badge
                      className={
                        value
                          ? "bg-green-700 text-white"
                          : "bg-slate-700 text-gray-200"
                      }
                    >
                      {formatValue(value, field)}
                    </Badge>
                  </div>
                );
              }

              if (field.type === "email" && value) {
                return (
                  <div key={field.name} className="space-y-1">
                    <div className="text-xs uppercase text-gray-500 tracking-wide">
                      {field.displayName}
                    </div>
                    <a
                      href={`mailto:${value}`}
                      className="text-green-400 hover:underline break-all"
                    >
                      {value}
                    </a>
                  </div>
                );
              }

              return (
                <div key={field.name} className="space-y-1">
                  <div className="text-xs uppercase text-gray-500 tracking-wide">
                    {field.displayName}
                  </div>
                  <div className="text-gray-200 break-words">
                    {formatValue(value, field)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
