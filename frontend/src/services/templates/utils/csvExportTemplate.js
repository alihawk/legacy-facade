/**
 * CSV Export utility template for generated projects
 *
 * Provides functionality to export data to CSV files
 */
export const csvExportTemplate = () => `/**
 * Export data to CSV file and trigger download
 */
export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  columns?: { key: string; label: string }[]
) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine columns from first row if not provided
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));
  
  // Build CSV content
  const headers = cols.map(c => \`"\${c.label}"\`).join(',');
  
  const rows = data.map(row =>
    cols.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '""';
      if (typeof value === 'string') return \`"\${value.replace(/"/g, '""')}"\`;
      if (typeof value === 'object') return \`"\${JSON.stringify(value).replace(/"/g, '""')}"\`;
      return \`"\${value}"\`;
    }).join(',')
  );
  
  const csv = [headers, ...rows].join('\\n');
  
  // Create blob and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = \`\${filename}-\${new Date().toISOString().split('T')[0]}.csv\`;
  link.click();
  
  URL.revokeObjectURL(url);
}
`;
