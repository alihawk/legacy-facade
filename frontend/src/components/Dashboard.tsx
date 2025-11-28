import { useNavigate } from "react-router-dom";
import { Database, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  resources: any[];
}

export default function Dashboard({ resources }: DashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome to Your Resurrected Portal
        </h2>
        <p className="text-gray-400">
          Your legacy API has been transformed into a modern interface. Select a
          resource from the sidebar to begin.
        </p>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <Card
            key={resource.name}
            className="bg-slate-900 border-slate-700 hover:border-green-500/50 transition cursor-pointer group"
            onClick={() => navigate(`/portal/${resource.name}`)}
          >
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-3">
                <Database className="w-6 h-6 text-green-500" />
                {resource.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fields:</span>
                  <span className="text-white font-medium">
                    {resource.fields.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Operations:</span>
                  <span className="text-white font-medium">
                    {resource.operations.join(", ")}
                  </span>
                </div>
                <Button className="w-full mt-2 bg-slate-800 hover:bg-green-600 group-hover:bg-green-600 transition">
                  View Records
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">
                {resources.length}
              </div>
              <div className="text-sm text-gray-400">Resources Available</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">
                {resources.reduce(
                  (sum: number, r: any) => sum + r.fields.length,
                  0
                )}
              </div>
              <div className="text-sm text-gray-400">Total Fields</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">100%</div>
              <div className="text-sm text-gray-400">API Coverage</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
