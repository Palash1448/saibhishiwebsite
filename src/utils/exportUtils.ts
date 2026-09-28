/**
 * Exports data array to a clean CSV file and triggers download.
 * Adds UTF-8 BOM so MS Excel in India displays Rupee symbol and special characters properly.
 */
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  headersMap?: { [key in keyof T]?: string }
): void {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  const keys = Object.keys(rows[0]) as (keyof T)[];
  const headerLabels = keys.map((key) => headersMap?.[key] || String(key));

  const csvRows: string[] = [];
  csvRows.push(headerLabels.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));

  for (const row of rows) {
    const values = keys.map((key) => {
      const val = row[key];
      if (val === undefined || val === null) return '""';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports JSON object as a backup file.
 */
export function exportToJSON(filename: string, data: any): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers standard browser print dialog for document / invoice printing.
 */
export function printDocument(): void {
  window.print();
}
