import React from 'react';

export type ColumnAlignment = 'left' | 'center' | 'right';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  align?: ColumnAlignment;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  pagination,
}: TableProps<T>) => {
  const getAlignmentClass = (align?: ColumnAlignment) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const getResponsiveClass = (col: TableColumn<T>) => {
    const classes = [];
    if (col.hideOnMobile) classes.push('hidden md:table-cell');
    else if (col.hideOnTablet) classes.push('hidden lg:table-cell');
    else if (col.hideOnDesktop) classes.push('lg:hidden');
    return classes.join(' ');
  };

  const renderCell = (column: TableColumn<T>, row: T, index: number) => {
    if (column.render) {
      return column.render(row, index);
    }
    return row[column.key];
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex-1 flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-linear-to-r from-primary/10 to-primary/5 sticky top-0">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`p-3 md:p-4 text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20 ${getAlignmentClass(
                    column.align
                  )} ${getResponsiveClass(column)}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-primary/5 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`p-3 md:p-4 ${getAlignmentClass(
                        column.align
                      )} ${getResponsiveClass(column)}`}
                    >
                      {renderCell(column, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && data.length > 0 && (
        <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs md:text-sm text-gray-700">
              Showing{' '}
              <span className="font-semibold">
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold">
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
              </span>{' '}
              of <span className="font-semibold">{pagination.totalItems}</span> results
            </div>
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    page === pagination.currentPage
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
