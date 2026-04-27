import React, { useEffect, useMemo, useState } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { dashboardStatsService, type DashboardSummaryDto } from '../../services/systemAdminUserManagement/dashboardStatsService';
import Alert from '../../components/Alert';
import Button from '../../components/Button';

const DoctorDashboard: React.FC = () => {
  const { navigateToPage } = useSidebarController();
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navbarConfig = useMemo(() => ({ title: 'Doctor Dashboard' }), []);
  useNavbarController(navbarConfig);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setError(null);
        const response = await dashboardStatsService.getSummary();
        if (response.success && response.data) {
          setSummary(response.data);
        } else {
          setError(response.message || 'Unable to load doctor stats');
        }
      } catch (err: any) {
        setError(err?.message || 'Unable to load doctor stats');
      }
    };

    loadSummary();
  }, []);

  const appointmentStatusCount = (status: string) => summary?.appointmentsByStatus?.[status] ?? 0;

  return (
    <div className="space-y-4">
      {error && (
        <Alert
          type="error"
          title="Stats Unavailable"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-6">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monitor your appointments at a glance.
        </p>

        {summary?.scope === 'doctor' && !summary.hospital_id && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-3 text-sm text-amber-900 dark:text-amber-200">
            You are currently not associated with a hospital. Appointment stats may remain at zero until association is active.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-white dark:from-blue-900/15 dark:to-dark-bg-secondary rounded-xl shadow-md border border-blue-100 dark:border-dark-border p-4">
          <div className="text-xs text-blue-700/80 dark:text-blue-300/90">Total Appointments</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary?.totalAppointments ?? 0}</div>
        </div>
        <div className="bg-linear-to-br from-emerald-50 to-white dark:from-emerald-900/15 dark:to-dark-bg-secondary rounded-xl shadow-md border border-emerald-100 dark:border-dark-border p-4">
          <div className="text-xs text-emerald-700/80 dark:text-emerald-300/90">Upcoming</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{appointmentStatusCount('upcoming')}</div>
        </div>
        <div className="bg-linear-to-br from-amber-50 to-white dark:from-amber-900/15 dark:to-dark-bg-secondary rounded-xl shadow-md border border-amber-100 dark:border-dark-border p-4">
          <div className="text-xs text-amber-700/80 dark:text-amber-300/90">In Progress</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{appointmentStatusCount('in progress')}</div>
        </div>
        <div className="bg-linear-to-br from-violet-50 to-white dark:from-violet-900/15 dark:to-dark-bg-secondary rounded-xl shadow-md border border-violet-100 dark:border-dark-border p-4">
          <div className="text-xs text-violet-700/80 dark:text-violet-300/90">Completed</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{appointmentStatusCount('completed')}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigateToPage('appointments')}>
            Go To Appointments
          </Button>
          <Button variant="outline" onClick={() => navigateToPage('access-requests')}>
            Manage Access Requests
          </Button>
          <Button variant="outline" onClick={() => navigateToPage('association')}>
            View Association Requests
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
