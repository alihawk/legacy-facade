/**
 * Enhanced Dashboard template for generated projects
 *
 * Displays stats cards, charts, and recent activity
 */
export const dashboardTemplate = () => `import { useEffect, useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { SimpleBarChart } from '../components/SimpleBarChart';
import { RecentActivity } from '../components/RecentActivity';
import { ResourceSchema } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/proxy';

const ICONS = ['👥', '📦', '🏷️', '📋', '🔔', '⚙️'];
const COLORS = ['blue', 'green', 'purple', 'orange'] as const;

interface DashboardProps {
  resources: ResourceSchema[];
}

export function Dashboard({ resources }: DashboardProps) {
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const newStats: { [key: string]: number } = {};
      
      for (const resource of resources) {
        try {
          const res = await fetch(\`\${API_URL}/\${resource.name}\`);
          const data = await res.json();
          newStats[resource.name] = Array.isArray(data) ? data.length : 0;
          
          // Get recent items from first resource
          if (resource === resources[0] && Array.isArray(data)) {
            const primaryKey = resource.primaryKey || 'id';
            const titleField = resource.fields[0]?.name || 'name';
            
            setRecentItems(
              data.slice(0, 5).map((item: any) => ({
                id: item[primaryKey] || item.id || Math.random().toString(),
                title: item[titleField] || item.name || 'Item',
                subtitle: item.description || item.email || undefined,
                timestamp: item.createdAt || item.updatedAt || undefined,
                href: \`/\${resource.name}/\${item[primaryKey] || item.id}\`
              }))
            );
          }
        } catch (e) {
          console.error(\`Failed to fetch \${resource.name}:\`, e);
          newStats[resource.name] = 0;
        }
      }
      
      setStats(newStats);
      setLoading(false);
    }
    
    if (resources.length > 0) {
      fetchStats();
    }
  }, [resources]);

  const chartData = resources.map((r) => ({
    name: r.displayName || r.name,
    count: stats[r.name] || 0
  }));

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Loading your data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back! Here's an overview of your data for {currentDate}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((resource, i) => (
          <StatsCard
            key={resource.name}
            title={resource.displayName || resource.name}
            count={stats[resource.name] || 0}
            icon={ICONS[i % ICONS.length]}
            href={\`/\${resource.name}\`}
            color={COLORS[i % COLORS.length]}
          />
        ))}
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart 
          data={chartData} 
          title="Records by Resource" 
        />
        <RecentActivity
          items={recentItems}
          resourceName={resources[0]?.displayName || resources[0]?.name || 'Items'}
        />
      </div>
    </div>
  );
}
`;
