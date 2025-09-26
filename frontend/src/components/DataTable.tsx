import { useState, type ReactNode } from "react";
import TabButton from "./TabButton";
import SearchBar from "./SearchBar";

export interface IDataTableColumnProps<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
}

export interface IDataTableButtonProps {
  label: string;
  value: string;
  icon?: ReactNode;
}

interface DataTableProps<T> {
  columns: IDataTableColumnProps<T>[];
  data: T[];
  buttons?: IDataTableButtonProps[];
  defaultFilter?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  buttons = [],
  defaultFilter = "All",
  searchable = true,
  searchPlaceholder = "Search...",
  onRowClick,
}: DataTableProps<T>) {
  const [filter, setFilter] = useState(defaultFilter);
  const [search, setSearch] = useState("");

  const filteredData = data.filter((row) => {
    if (filter !== "All" && row.status !== filter) return false;
    if (
      search &&
      !JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 bg-white rounded-md shadow-md space-y-4 w-full">
      {/* Top controls */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {buttons.map((btn) => (
            <TabButton
              key={btn.value}
              label={btn.label}
              icon={btn.icon}
              selected={filter === btn.value}
              onClick={() => setFilter(btn.value)}
            />
          ))}
        </div>
        {searchable && (
          <div className="w-80">
            <SearchBar
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="text-left border-b">
              {columns.map((col) => (
                <th
                  key={col.key.toString()}
                  className="px-6 py-3 font-semibold whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b ${
                    onRowClick
                      ? "cursor-pointer hover:bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key.toString()}
                      className="px-6 py-3 whitespace-nowrap"
                    >
                      {col.render ? col.render(row) : row[col.key as keyof T]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
