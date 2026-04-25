import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type ColumnAlignment = 'left' | 'center' | 'right';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  align?: ColumnAlignment;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  render?: (row: T, index: number, currentTab?: string) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  loading?: boolean;
  /**
   * Whether the table container should render with elevation (shadow).
   * Set to false to render a flat table (no shadow).
   * Default: true
   */
  elevated?: boolean;
  // Simple pagination - just specify items per page
  itemsPerPage?: number;
  // Progressive loading pagination - for API-driven data that accumulates
  progressivePagination?: {
    totalItems: number; // Total items available on server
    loadedItems: number; // How many items have been loaded so far
    pagesPerLoad?: number; // How many pages to load at once (default: 1)
    onLoadMore: (page: number) => void | Promise<void>; // Called when next page needs loading
  };
  // Current tab identifier to pass to render functions
  currentTab?: string;
  // Disable automatic local pagination when using server-side pagination outside this component
  disableAutoPagination?: boolean;
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  emptyIcon,
  emptyComponent,
  loading = false,
  elevated = true,
  itemsPerPage,
  progressivePagination,
  currentTab,
  disableAutoPagination = false,
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const defaultItemsPerPage = 10;
  const resolvedItemsPerPage = itemsPerPage || defaultItemsPerPage;
  const shouldAutoPaginate = !disableAutoPagination && !progressivePagination && !itemsPerPage && data.length > defaultItemsPerPage;

  // Reset to page 1 when data changes significantly (like search/filter)
  useEffect(() => {
    if (!progressivePagination && data.length > 0 && (itemsPerPage || shouldAutoPaginate)) {
      const maxPage = Math.ceil(data.length / resolvedItemsPerPage);
      if (currentPage > maxPage) {
        setCurrentPage(maxPage || 1);
      }
    }
  }, [data.length, itemsPerPage, progressivePagination, currentPage, resolvedItemsPerPage, shouldAutoPaginate]);

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
      return column.render(row, index, currentTab);
    }
    return row[column.key];
  };

  // Calculate pagination values
  const getPaginationData = () => {
    if (progressivePagination) {
      // Progressive loading pagination
      const perPage = itemsPerPage || 10;
      const pagesPerLoad = progressivePagination.pagesPerLoad || 1;
      const totalPages = Math.ceil(progressivePagination.totalItems / perPage);
      const loadedPages = Math.ceil(progressivePagination.loadedItems / perPage);
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = startIndex + perPage;
      const displayData = data.slice(startIndex, endIndex);
      const hasMore = progressivePagination.loadedItems < progressivePagination.totalItems;
      
      return {
        currentPage,
        totalPages,
        loadedPages,
        pagesPerLoad,
        totalItems: progressivePagination.totalItems,
        itemsPerPage: perPage,
        displayData,
        hasMore,
        onPageChange: async (page: number) => {
          // If navigating to unloaded page, show loading shimmer
          if (page > loadedPages && hasMore) {
            setCurrentPage(page); // Set page first to show shimmer
            setIsLoadingMore(true);
            await progressivePagination.onLoadMore(loadedPages + 1);
            setIsLoadingMore(false);
          } 
          // Silent preload: if on last loaded page, silently load next batch
          else if (page === loadedPages && hasMore && !isLoadingMore) {
            setCurrentPage(page);
            // Silent load in background without showing loading state
            progressivePagination.onLoadMore(loadedPages + 1);
          }
          else {
            setCurrentPage(page);
          }
        },
      };
    } else if (itemsPerPage || shouldAutoPaginate) {
      // Frontend pagination
      const totalPages = Math.ceil(data.length / resolvedItemsPerPage);
      const startIndex = (currentPage - 1) * resolvedItemsPerPage;
      const endIndex = startIndex + resolvedItemsPerPage;
      const displayData = data.slice(startIndex, endIndex);
      return {
        currentPage,
        totalPages,
        totalItems: data.length,
        itemsPerPage: resolvedItemsPerPage,
        displayData,
        hasMore: false,
        onPageChange: (page: number) => setCurrentPage(page),
      };
    }
    // No pagination
    return null;
  };

  const paginationData = getPaginationData();
  const displayData = paginationData?.displayData || data;

  const renderPageNumbers = () => {
    if (!paginationData) return null;

    const { currentPage, totalPages } = paginationData;
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Shimmer loading effect for a single row
  const ShimmerRow = () => (
    <tr className="animate-pulse">
      {columns.map((column, index) => (
        <td
          key={index}
          className={`p-3 md:p-4 ${getAlignmentClass(column.align)} ${getResponsiveClass(column)}`}
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </td>
      ))}
    </tr>
  );

  const containerClass = `bg-white dark:bg-[#2d2d2d] rounded-lg ${elevated ? 'shadow-lg' : ''} overflow-hidden flex flex-col flex-1 min-h-full`;

  return (
    <div className={containerClass}>
      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full">
          <thead className="bg-gray-200 dark:bg-[#252525] border-b-2 border-gray-200 dark:border-dark-border">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-white uppercase tracking-wider ${getAlignmentClass(
                    column.align
                  )} ${getResponsiveClass(column)}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="h-full">
            {loading ? (
              // Show shimmer loading rows
              <>
                {Array.from({ length: itemsPerPage || 5 }).map((_, index) => (
                  <ShimmerRow key={index} />
                ))}
              </>
            ) : displayData.length === 0 ? (
              // Check if this is an unloaded page (beyond loaded data)
              paginationData?.loadedPages !== undefined && 
              currentPage > paginationData.loadedPages ? (
                // Show shimmer for unloaded pages
                <>
                  {Array.from({ length: itemsPerPage || 5 }).map((_, index) => (
                    <ShimmerRow key={index} />
                  ))}
                </>
              ) : (
                // Show empty state
                <tr className="h-full">
                  <td colSpan={columns.length} className="p-8 text-center h-full align-middle">
                    {emptyComponent || (
                      <div className="flex flex-col items-center justify-center py-12">
                        {emptyIcon && <div className="mb-3">{emptyIcon}</div>}
                        <p className="text-gray-500 dark:text-dark-text-secondary">{emptyMessage}</p>
                      </div>
                    )}
                  </td>
                </tr>
              )
            ) : (
              <>
                {displayData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`${
                      rowIndex % 2 === 0 ? 'bg-white dark:bg-dark-bg-secondary' : 'bg-gray-50 dark:bg-dark-bg-tertiary'
                    } hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => onRowClick?.(row, rowIndex)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`p-3 md:p-4 ${getAlignmentClass(
                          column.align
                        )} ${getResponsiveClass(column)} text-gray-900 dark:text-dark-text`}
                      >
                        {renderCell(column, row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Always show when pagination is enabled */}
      {paginationData && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-[#252424] border-t border-gray-200 dark:border-dark-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
              {paginationData.loadedPages !== undefined ? (
                // Progressive pagination - show loaded count
                <>
                  Loaded {paginationData.loadedPages * paginationData.itemsPerPage > paginationData.totalItems 
                    ? paginationData.totalItems 
                    : paginationData.loadedPages * paginationData.itemsPerPage} of {paginationData.totalItems} documents
                  {' • '}
                  Showing {Math.min((paginationData.currentPage - 1) * paginationData.itemsPerPage + 1, paginationData.totalItems)} to{' '}
                  {Math.min(paginationData.currentPage * paginationData.itemsPerPage, paginationData.totalItems)}
                </>
              ) : (
                // Regular pagination
                <>
                  Showing {paginationData.totalItems > 0 ? Math.min((paginationData.currentPage - 1) * paginationData.itemsPerPage + 1, paginationData.totalItems) : 0} to{' '}
                  {Math.min(paginationData.currentPage * paginationData.itemsPerPage, paginationData.totalItems)} of{' '}
                  {paginationData.totalItems} result{paginationData.totalItems !== 1 ? 's' : ''}
                </>
              )}
            </div>
            {paginationData.totalPages > 1 && (
              <div className="flex gap-1 md:gap-2">
                <button
                  onClick={() => paginationData.onPageChange(paginationData.currentPage - 1)}
                  disabled={paginationData.currentPage === 1 || loading || isLoadingMore}
                  className="px-2 md:px-3 py-1 bg-gray-200 dark:bg-dark-bg text-gray-700 dark:text-dark-text rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>
                {renderPageNumbers()?.map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-2 md:px-3 py-1 text-gray-500 dark:text-gray-400 flex items-center">
                        ...
                      </span>
                    ) : (
                      <button
                        onClick={() => paginationData.onPageChange(page as number)}
                        disabled={loading || isLoadingMore}
                        className={`px-2 md:px-3 py-1 rounded-lg text-sm transition-colors disabled:cursor-not-allowed ${
                          page === paginationData.currentPage
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 dark:bg-dark-bg text-gray-700 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
                <button
                  onClick={() => paginationData.onPageChange(paginationData.currentPage + 1)}
                  disabled={paginationData.currentPage === paginationData.totalPages || loading || isLoadingMore}
                  className="px-2 md:px-3 py-1 bg-gray-200 dark:bg-dark-bg text-gray-700 dark:text-dark-text rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
