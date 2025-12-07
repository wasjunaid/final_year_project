import { useState, useEffect, useMemo } from 'react';
import type { LogModel } from '../../models/log/model';

export interface LogFilters {
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
  selectedUser: string;
}

// Factory to create log controller hook with DI for repository
export const createUseLogController = ({ logRepository }: { logRepository: any }) => {
  return () => {
    const [logs, setLogs] = useState<LogModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<LogFilters>({
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
      selectedUser: '',
    });

    // Fetch all logs
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await logRepository.getAllLogs();
        setLogs(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    // Filter logs based on current filters
    const filteredLogs = useMemo(() => {
      let filtered = [...logs];

      // Search filter (action or user name)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (log) =>
            log.action.toLowerCase().includes(query) ||
            log.user_name.toLowerCase().includes(query) ||
            log.email.toLowerCase().includes(query)
        );
      }

      // User filter
      if (filters.selectedUser) {
        filtered = filtered.filter((log) => log.person_id.toString() === filters.selectedUser);
      }

      // Date from filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filtered = filtered.filter((log) => new Date(log.created_at) >= fromDate);
      }

      // Date to filter
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        filtered = filtered.filter((log) => new Date(log.created_at) <= toDate);
      }

      return filtered;
    }, [logs, filters]);

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
    };

    // Reset filters
    const resetFilters = () => {
      setFilters({
        searchQuery: '',
        dateFrom: '',
        dateTo: '',
        selectedUser: '',
      });
    };

    // Clear error
    const clearError = () => {
      setError(null);
    };

    // Auto-fetch on mount
    useEffect(() => {
      fetchLogs();
    }, []);

    return {
      logs: filteredLogs,
      allLogs: logs,
      uniqueUsers,
      loading,
      error,
      filters,
      fetchLogs,
      updateFilters,
      resetFilters,
      clearError,
    };
  };
};
