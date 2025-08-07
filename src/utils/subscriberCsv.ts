import { exportFile, QTableProps } from 'quasar';

// Define more specific types for clarity
type Row = Record<string, any>;
type Columns = Readonly<QTableProps['columns']>;

/**
 * Formats a single value for CSV, handling commas, quotes, and nulls.
 * It respects the formatter function from the column definition if available.
 * @param value - The value to format.
 * @param col - The column definition object.
 * @param row - The entire row object.
 * @returns A CSV-safe string.
 */
function formatValue(value: any, col: any, row: Row): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Use the column's formatter function if it exists, for consistency with the table display
  if (typeof col.format === 'function') {
    const formattedValue = col.format(value, row);
    return `"${String(formattedValue).replace(/"/g, '""')}"`;
  }

  // Handle specific fields that need special formatting
  if (col.field === 'startDate' || col.field === 'nextRenewal') {
    if (!value) return 'N/A';
    return new Date(value * 1000).toLocaleDateString();
  }

  const strValue = String(value);
  // If the string contains a comma or a quote, wrap it in double quotes as per CSV standard
  if (strValue.includes(',') || strValue.includes('"')) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }

  return strValue;
}

/**
 * Exports a list of subscriber rows to a CSV file.
 * @param rows - The array of row data to export.
 * @param columns - The QTable column definitions, used for headers and field mapping.
 * @returns `true` if the file export was initiated successfully, `false` otherwise.
 */
export function exportSubscribersToCsv(rows: Row[], columns: Columns): boolean {
  if (!columns) {
    console.error('Columns are not defined for CSV export.');
    return false;
  }
  // Filter out columns that shouldn't be in the export (like the 'actions' button column)
  const exportableColumns = columns.filter(c => c.name !== 'actions' && c.label);

  // Use column labels for the CSV header for readability
  const header = exportableColumns.map(c => c.label).join(',');

  const content = [header]
    .concat(
      rows.map(row =>
        exportableColumns
          .map(col => {
            // For the 'subscriber' column, we want to export the name, not the npub object
            const value = col.field === 'subscriberNpub' ? row.displayName : row[col.field as string];
            return formatValue(value, col, row);
          })
          .join(',')
      )
    )
    .join('\\n');

  const status = exportFile('subscribers-export.csv', content, 'text/csv');

  if (status !== true) {
    console.error('Error downloading file:', status);
    return false;
  }
  return true;
}
