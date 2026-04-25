import React, { useMemo, useState } from 'react';
import TablePagination from '../ui/TablePagination';
import { formatCNICDisplay } from '../../utils/formatters';

const PersonsTable = ({ persons }) => {
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const personItems = useMemo(() => persons || [], [persons]);

  const totalPages = Math.ceil(personItems.length / PAGE_SIZE);
  const currentPageSafe = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedPersons = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
    return personItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [personItems, currentPageSafe]);

  if (personItems.length === 0) {
    return (
      <p className="text-center py-10 text-gray-500 dark:text-gray-400">
        No persons found
      </p>
    );
  }

  return (
    <div className="bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#404040] rounded-xl overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#252525]">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">CNIC</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">First Name</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-200">Last Name</th>
            </tr>
          </thead>
          <tbody>
          {paginatedPersons.map((person) => (
            <tr key={person.cnic} className="border-t border-gray-100 dark:border-[#3a3a3a]">
              <td className="px-3 py-2 whitespace-nowrap">{formatCNICDisplay(person.cnic)}</td>
              <td className="px-3 py-2">{person.first_name}</td>
              <td className="px-3 py-2">{person.last_name}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={currentPageSafe}
        totalPages={totalPages}
        totalItems={personItems.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        label="persons"
      />
    </div>
  );
};

export default PersonsTable;