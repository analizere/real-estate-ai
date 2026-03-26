"use client";

import { cn } from "@/lib/utils";

type Column<T> = {
  key: string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string) => void;
  className?: string;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onSort,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left font-medium text-muted-foreground",
                  onSort && "cursor-pointer select-none hover:text-foreground"
                )}
                onClick={onSort ? () => onSort(col.key) : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b last:border-b-0 hover:bg-muted/25">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render
                    ? col.render(row[col.key], row)
                    : (row[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
