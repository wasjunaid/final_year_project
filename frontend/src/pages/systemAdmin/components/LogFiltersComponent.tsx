import React from 'react';
import TextInput from '../../../components/TextInput';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';
import { RefreshCw, X } from 'lucide-react';
import type { LogFilters } from '../../../hooks/log';

interface LogFiltersComponentProps {
  filters: LogFilters;
  uniqueUsers: Array<{ id: number; name: string; email: string }>;
  onUpdateFilters: (filters: Partial<LogFilters>) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const LogFiltersComponent: React.FC<LogFiltersComponentProps> = ({
  filters,
  uniqueUsers,
  onUpdateFilters,
  onResetFilters,
  onRefresh,
  isLoading = false,
}) => {
  const userOptions = [
    { value: '', label: 'All Users' },
    ...uniqueUsers.map((user) => ({
      value: user.id.toString(),
      label: `${user.name} (${user.email})`,
    })),
  ];

  const hasActiveFilters =
    !!(filters.searchQuery || filters.dateFrom || filters.dateTo || filters.selectedUser);

  return (
    <div className="bg-white dark:bg-[#272829] rounded-lg shadow p-6 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-[repeat(4,1fr)_auto] gap-4 items-end">
      {/* Search Query */}
      <TextInput
        label="Search"
        id="search"
        name="search"
        type="text"
        value={filters.searchQuery}
        onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
        placeholder="Search action or user..."
        disabled={isLoading}
        minWidth='200px'
      />

      {/* User Filter */}
      <Dropdown
        label="User"
        options={userOptions}
        value={filters.selectedUser}
        onChange={(value) => onUpdateFilters({ selectedUser: value })}
        searchable
        searchPlaceholder="Search users..."
        disabled={isLoading}
        minWidth='200px'
      />

      {/* Date From */}
      <TextInput
        label="Date From"
        id="dateFrom"
        name="dateFrom"
        type="date"
        value={filters.dateFrom}
        onChange={(e) => onUpdateFilters({ dateFrom: e.target.value })}
        disabled={isLoading}
        minWidth='200px'
      />

      {/* Date To */}
      <TextInput
        label="Date To"
        id="dateTo"
        name="dateTo"
        type="date"
        value={filters.dateTo}
        onChange={(e) => onUpdateFilters({ dateTo: e.target.value })}
        disabled={isLoading}
        minWidth='200px'
      />

      {/* Buttons */}
      <div className="flex gap-2 justify-center md:justify-end w-full">
        <Button
          variant="outline"
          onClick={onResetFilters}
          disabled={!hasActiveFilters || isLoading}
          icon={X}
          className="w-auto p-2"
        />
        <Button
          variant="primary"
          onClick={onRefresh}
          disabled={isLoading}
          icon={RefreshCw}
          className="w-auto p-2"
        />
      </div>
    </div>
  </div>
  );
};
