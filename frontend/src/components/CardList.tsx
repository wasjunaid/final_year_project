import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CardListProps<T = any> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  loading?: boolean;
  // Simple pagination - just specify items per page
  itemsPerPage?: number;
  // Progressive loading pagination - for API-driven data that accumulates
  progressivePagination?: {
    totalItems: number; // Total items available on server
    loadedItems: number; // How many items have been loaded so far
    pagesPerLoad?: number; // How many pages to load at once (default: 1)
    onLoadMore: (page: number) => void | Promise<void>; // Called when next page needs loading
  };
}

const CardList = <T extends Record<string, any>>({
  data,
  renderCard,
  emptyMessage = 'No items available',
  emptyIcon,
  emptyComponent,
  loading = false,
  itemsPerPage,
  progressivePagination,
}: CardListProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset to page 1 when data changes significantly (like search/filter)
  useEffect(() => {
    if (!progressivePagination && data.length > 0) {
      const maxPage = Math.ceil(data.length / (itemsPerPage || 10));
      if (currentPage > maxPage) {
        setCurrentPage(maxPage || 1);
      }
    }
  }, [data.length, itemsPerPage, progressivePagination, currentPage]);

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
    } else if (itemsPerPage) {
      // Frontend pagination
      const totalPages = Math.ceil(data.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const displayData = data.slice(startIndex, endIndex);
      return {
        currentPage,
        totalPages,
        totalItems: data.length,
        itemsPerPage,
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

  // Shimmer loading effect for a single card
  const ShimmerCard = () => (
    <div className="animate-pulse bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#404040] rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#2d2d2d] rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {loading ? (
          // Show shimmer loading cards
          <div className="space-y-3">
            {Array.from({ length: itemsPerPage || 5 }).map((_, index) => (
              <ShimmerCard key={index} />
            ))}
          </div>
        ) : displayData.length === 0 ? (
          // Check if this is an unloaded page (beyond loaded data)
          paginationData?.loadedPages !== undefined && 
          currentPage > paginationData.loadedPages ? (
            // Show shimmer for unloaded pages
            <div className="space-y-3">
              {Array.from({ length: itemsPerPage || 5 }).map((_, index) => (
                <ShimmerCard key={index} />
              ))}
            </div>
          ) : (
            // Show empty state
            <div className="flex flex-col items-center justify-center py-12">
              {emptyComponent || (
                <>
                  {emptyIcon && <div className="mb-3">{emptyIcon}</div>}
                  <p className="text-gray-500 dark:text-[#a0a0a0]">{emptyMessage}</p>
                </>
              )}
            </div>
          )
        ) : (
          // Render cards
          <div className="space-y-3">
            {displayData.map((item, index) => (
              <div key={index}>
                {renderCard(item, index)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {paginationData && paginationData.totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-[#252424] border-t border-gray-200 dark:border-[#404040]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-[#a0a0a0]">
              {paginationData.loadedPages !== undefined ? (
                // Progressive pagination - show loaded count
                <>
                  Loaded {paginationData.loadedPages * paginationData.itemsPerPage > paginationData.totalItems 
                    ? paginationData.totalItems 
                    : paginationData.loadedPages * paginationData.itemsPerPage} of {paginationData.totalItems} items
                  {' • '}
                  Showing {Math.min((paginationData.currentPage - 1) * paginationData.itemsPerPage + 1, paginationData.totalItems)} to{' '}
                  {Math.min(paginationData.currentPage * paginationData.itemsPerPage, paginationData.totalItems)}
                </>
              ) : (
                // Regular pagination
                <>
                  Showing {Math.min((paginationData.currentPage - 1) * paginationData.itemsPerPage + 1, paginationData.totalItems)} to{' '}
                  {Math.min(paginationData.currentPage * paginationData.itemsPerPage, paginationData.totalItems)} of{' '}
                  {paginationData.totalItems} results
                </>
              )}
            </div>
            <div className="flex gap-1 md:gap-2">
              <button
                onClick={() => paginationData.onPageChange(paginationData.currentPage - 1)}
                disabled={paginationData.currentPage === 1 || loading || isLoadingMore}
                className="px-2 md:px-3 py-1 bg-gray-200 dark:bg-[#1a1a1a] text-gray-700 dark:text-[#e5e5e5] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
                          : 'bg-gray-200 dark:bg-[#1a1a1a] text-gray-700 dark:text-[#e5e5e5] hover:bg-gray-300 dark:hover:bg-gray-600'
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
                className="px-2 md:px-3 py-1 bg-gray-200 dark:bg-[#1a1a1a] text-gray-700 dark:text-[#e5e5e5] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardList;
