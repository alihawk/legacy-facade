/**
 * SimpleBarChart component template for generated projects
 *
 * Displays a horizontal bar chart using Recharts library
 */
export const simpleBarChartTemplate = () => `import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  name: string;
  count: number;
}

interface SimpleBarChartProps {
  data: ChartData[];
  title?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export function SimpleBarChart({ data, title }: SimpleBarChartProps) {
  return (
    <div className="bg-white rounded-xl border p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" />
          <Tooltip
            formatter={(value) => [value.toLocaleString(), 'Records']}
            contentStyle={{ borderRadius: '8px' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
`;
