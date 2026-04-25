import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label = 'results',
}) => {
  if (!totalItems || totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="px-4 py-3 bg-gray-50 dark:bg-[#252424] border-t border-gray-200 dark:border-[#404040]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {start} to {end} of {totalItems} {label}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
