/**
 * StatsCard component template for generated projects
 * 
 * Displays a clickable stat card with icon, count, and title
 */

export const statsCardTemplate = () => `import { Link } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  count: number;
  icon: string;
  href: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatsCard({ title, count, icon, href, color = 'blue' }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <Link
      to={href}
      className={\`block p-6 rounded-xl border-2 \${colorClasses[color]} hover:shadow-lg transition-all duration-200 hover:scale-105\`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{count.toLocaleString()}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
      <p className="text-sm mt-3 opacity-70">View all →</p>
    </Link>
  );
}
`;
