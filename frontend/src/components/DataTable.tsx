import { useState, type ReactNode } from "react";
import TabButton from "./TabButton";
import SearchBar from "./SearchBar";

export interface IDataTableColumnProps<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  maxWidth?: string;
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
  filterKey?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  pagination?: boolean; // pagination option
  itemsPerPage?: number; // Items per page
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  buttons = [],
  defaultFilter = "All",
  filterKey = "status",
  searchable = true,
  searchPlaceholder = "Search...",
  onRowClick,
  pagination = false,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [filter, setFilter] = useState(defaultFilter);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and search data
  const filteredData = data.filter((item) => {
    const matchesFilter = filter === "All" || item[filterKey] === filter;
    const matchesSearch = searchable
      ? Object.values(item).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        )
      : true;
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = pagination
    ? Math.ceil(filteredData.length / itemsPerPage)
    : 1;
  const startIndex = pagination ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = pagination ? startIndex + itemsPerPage : filteredData.length;
  const paginatedData = pagination
    ? filteredData.slice(startIndex, endIndex)
    : filteredData;

  return (
    <div className="w-full space-y-4">
      {/* Filters and Search */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {buttons.map((btn) => (
            <TabButton
              key={btn.value}
              label={btn.label}
              icon={btn.icon}
              selected={filter === btn.value}
              onClick={() => {
                setFilter(btn.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
            />
          ))}
        </div>
        {searchable && (
          <div className="w-80">
            <SearchBar
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
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
                  style={col.maxWidth ? { maxWidth: col.maxWidth } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b ${
                    onRowClick
                      ? "cursor-pointer hover:bg-gray-100"
                      : "hover:bg-gray-50"
                  } transition-colors`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key.toString()}
                      className="px-6 py-4 whitespace-nowrap"
                      style={
                        col.maxWidth ? { maxWidth: col.maxWidth } : undefined
                      }
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(endIndex, filteredData.length)}
              </span>{" "}
              of <span className="font-medium">{filteredData.length}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNumber
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
