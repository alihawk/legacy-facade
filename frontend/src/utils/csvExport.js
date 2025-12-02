/**
 * Export data to CSV file
 */
export function exportToCSV(data, filename, fields) {
    if (data.length === 0) {
        console.warn('No data to export');
        return;
    }
    // Determine columns
    let columns;
    if (fields && fields.length > 0) {
        columns = fields.map(f => f.name);
    }
    else {
        columns = Object.keys(data[0]);
    }
    // Create CSV header
    const header = columns.map(col => {
        const field = fields?.find(f => f.name === col);
        return field?.displayName || col;
    }).join(',');
    // Create CSV rows
    const rows = data.map(item => {
        return columns.map(col => {
            const value = item[col];
            // Handle null/undefined
            if (value === null || value === undefined)
                return '';
            // Handle strings with commas or quotes
            const strValue = String(value);
            if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                return `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
        }).join(',');
    });
    // Combine header and rows
    const csv = [header, ...rows].join('\n');
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
