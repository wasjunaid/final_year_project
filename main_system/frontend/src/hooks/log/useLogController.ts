import { useState, useEffect, useMemo } from 'react';
import type { LogModel } from '../../models/log/model';

export interface LogFilters {
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
  selectedUser: string;
}

export interface LogPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

// Factory to create log controller hook with DI for repository
export const createUseLogController = ({ logRepository }: { logRepository: any }) => {
  return () => {
    const [logs, setLogs] = useState<LogModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<LogPagination | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [filters, setFilters] = useState<LogFilters>({
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
      selectedUser: '',
    });

    // Fetch all logs
    const fetchLogs = async (forcedPage?: number) => {
      try {
        setLoading(true);
        setError(null);
        const nextPage = forcedPage ?? page;
        const data = await logRepository.getAllLogs({
          search: filters.searchQuery || undefined,
          user_id: filters.selectedUser || undefined,
          date_from: filters.dateFrom || undefined,
          date_to: filters.dateTo || undefined,
          page: nextPage,
          limit,
        });
        setLogs(data.logs);
        setPagination(data.pagination);
        if (data.pagination?.page) {
          setPage(data.pagination.page);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    // Get unique users for filter dropdown
    const uniqueUsers = useMemo(() => {
      const usersMap = new Map<number, { id: number; name: string; email: string }>();
      logs.forEach((log) => {
        if (!usersMap.has(log.person_id)) {
          usersMap.set(log.person_id, {
            id: log.person_id,
            name: log.user_name,
            email: log.email,
          });
        }
      });
      return Array.from(usersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [logs]);

    // Update filters
    const updateFilters = (newFilters: Partial<LogFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setPage(1);
    };

    // Reset filters
    const resetFilters = () => {
      setFilters({
        searchQuery: '',
        dateFrom: '',
        dateTo: '',
        selectedUser: '',
      });
      setPage(1);
    };

    // Clear error
    const clearError = () => {
      setError(null);
    };

    useEffect(() => {
      const timer = setTimeout(() => {
        fetchLogs(1);
      }, 250);

      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, limit]);

    const goToPage = (nextPage: number) => {
      const normalizedPage = Math.max(1, nextPage);
      setPage(normalizedPage);
      fetchLogs(normalizedPage);
    };

    const updateLimit = (nextLimit: number) => {
      const normalizedLimit = Math.max(1, nextLimit);
      setLimit(normalizedLimit);
      setPage(1);
    };

    return {
      logs,
      allLogs: logs,
      uniqueUsers,
      loading,
      error,
      filters,
      pagination,
      page,
      limit,
      fetchLogs,
      updateFilters,
      resetFilters,
      goToPage,
      updateLimit,
      clearError,
    };
  };
};
