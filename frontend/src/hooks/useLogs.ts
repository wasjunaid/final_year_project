import { useState, useCallback, useMemo } from 'react';
import { logsApi } from '../services/LogsApi';
import type { Log } from '../models/Log';
import StatusCodes from '../constants/StatusCodes';

export function useLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Memoized clear messages function
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Get all logs
  const getAllLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await logsApi.getAll();
      setLogs(response.data || []);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === StatusCodes.NOT_FOUND) {
        setLogs([]);
        return [];
      }
      const errorMsg = err?.response?.data?.message || 'Failed to fetch logs';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized return value
  const returnValue = useMemo(() => ({
    logs,
    loading,
    error,
    success,
    clearMessages,
    getAllLogs,
  }), [
    logs,
    loading,
    error,
    success,
    clearMessages,
    getAllLogs,
  ]);

  return returnValue;
}

export default useLogs;