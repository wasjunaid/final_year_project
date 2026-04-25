import React, { useMemo, useState } from 'react';
import Button from '../ui/Button';
import TablePagination from '../ui/TablePagination';
import { formatDate, formatCurrency } from '../../utils/formatters';

const ClaimsTable = ({ claims, onUpdateStatus, onMakePayment, paymentLoading, onSelectClaim, selectedClaimId }) => {
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const claimItems = useMemo(() => claims || [], [claims]);

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300';
    }
  };

  const totalPages = Math.ceil(claimItems.length / PAGE_SIZE);
  const currentPageSafe = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
    return claimItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [claimItems, currentPageSafe]);

  if (claimItems.length === 0) {
    return (
      <p className="text-center py-10 text-gray-500 dark:text-gray-400">
        No claims found
      </p>
    );
  }

  return (
    <div className="bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#404040] rounded-xl overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#252525]">
            <tr>
              {['Claim ID', 'Hospital', 'Amount', 'Claim Date', 'Status', 'Actions'].map((header) => (
                <th key={header} className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
          {paginatedClaims.map((claim) => (
            <tr
              key={claim.claim_id}
              className={`border-t border-gray-100 dark:border-[#3a3a3a] cursor-pointer ${selectedClaimId === claim.claim_id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-[#303030]'}`}
              onClick={() => onSelectClaim?.(claim)}
            >
              <td className="px-3 py-2">{claim.claim_id}</td>
              <td className="px-3 py-2">{claim.hospital_name || '-'}</td>
              <td className="px-3 py-2">
                {claim.claim_amount ? formatCurrency(claim.claim_amount) : '-'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{formatDate(claim.claim_date)}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(claim.status)}`}>
                  {claim.status}
                </span>
              </td>
              <td className="px-3 py-2">
                {claim.status === 'PENDING' && onUpdateStatus && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); onUpdateStatus(claim.claim_id, 'APPROVED'); }}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); onUpdateStatus(claim.claim_id, 'REJECTED'); }}>
                      Reject
                    </Button>
                  </div>
                )}
                {claim.status === 'APPROVED' && !claim.is_paid && onMakePayment && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => { e.stopPropagation(); onMakePayment(claim); }}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? 'Processing...' : 'Make Payment'}
                  </Button>
                )}
                {claim.status === 'APPROVED' && claim.is_paid && (
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Paid</span>
                )}
                {claim.status !== 'PENDING' && claim.status !== 'APPROVED' && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{claim.status}</span>
                )}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={currentPageSafe}
        totalPages={totalPages}
        totalItems={claimItems.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        label="claims"
      />
    </div>
  );
};

export default ClaimsTable;