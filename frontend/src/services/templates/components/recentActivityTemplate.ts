/**
 * RecentActivity component template for generated projects
 * 
 * Displays a list of recent items with links to detail pages
 */

export const recentActivityTemplate = () => `import { Link } from 'react-router-dom';

interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  timestamp?: string;
  href: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
  resourceName: string;
}

export function RecentActivity({ items, resourceName }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="text-lg font-semibold mb-4">Recent {resourceName}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900">{item.title}</p>
              {item.subtitle && (
                <p className="text-sm text-gray-500">{item.subtitle}</p>
              )}
            </div>
            <div className="text-right">
              {item.timestamp && (
                <p className="text-xs text-gray-400">{item.timestamp}</p>
              )}
              <span className="text-blue-600 text-sm">View →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
`;
