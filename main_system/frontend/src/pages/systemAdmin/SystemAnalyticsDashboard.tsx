import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  ClipboardList,
  FileClock,
  Hospital,
  ShieldCheck,
  Stethoscope,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { DashboardSummaryDto } from '../../services/systemAdminUserManagement/dashboardStatsService';
import { dashboardStatsService } from '../../services/systemAdminUserManagement/dashboardStatsService';
import { useNavbarController } from '../../hooks/ui/navbar';

type AnalyticsCard = {
  title: string;
  value: number;
  detail: string;
};

export const SystemAnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  const navbarConfig = useMemo(() => ({ title: 'System Analytics' }), []);
  useNavbarController(navbarConfig);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const response = await dashboardStatsService.getSummary();
        if (response.success && response.data) {
          setSummary(response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const cards = useMemo(() => {
    if (!summary) {
      return [];
    }

    const baseCards: AnalyticsCard[] = [
      {
        title: 'Appointments',
        value: summary.totalAppointments ?? 0,
        detail: `Upcoming: ${summary.appointmentsByStatus?.upcoming ?? 0} | In Progress: ${summary.appointmentsByStatus?.['in progress'] ?? 0} | Completed: ${summary.appointmentsByStatus?.completed ?? 0}`,
      },
      {
        title: 'Claims',
        value: summary.totalClaims ?? 0,
        detail: `Pending: ${summary.claimsByStatus?.pending ?? 0} | Approved: ${summary.claimsByStatus?.approved ?? 0} | Rejected: ${summary.claimsByStatus?.rejected ?? 0}`,
      },
      {
        title: 'Doctors',
        value: summary.totalDoctors ?? 0,
        detail: 'Total doctor accounts',
      },
      {
        title: 'Patients',
        value: summary.totalPatients ?? 0,
        detail: 'Total patient accounts',
      },
    ];

    if (summary.scope === 'system') {
      return [
        {
          title: 'Hospitals',
          value: summary.totalHospitals ?? 0,
          detail: 'Total registered hospitals',
        },
        {
          title: 'Insurance Companies',
          value: summary.totalInsuranceCompanies ?? 0,
          detail: 'Synchronized insurance companies',
        },
        ...baseCards,
        {
          title: 'EHR Access Requests',
          value: summary.totalEhrAccessRequests ?? 0,
          detail: `Requested: ${summary.ehrAccessByStatus?.requested ?? 0} | Granted: ${summary.ehrAccessByStatus?.granted ?? 0}`,
        },
        {
          title: 'System Sub Admins',
          value: summary.totalSystemSubAdmins ?? 0,
          detail: `Active: ${summary.activeSystemSubAdmins ?? 0} | Deactivated: ${summary.deactivatedSystemSubAdmins ?? 0}`,
        },
        {
          title: 'Hospital Admins',
          value: summary.totalHospitalAdmins ?? 0,
          detail: `Active: ${summary.activeHospitalAdmins ?? 0} | Deactivated: ${summary.deactivatedHospitalAdmins ?? 0}`,
        },
      ];
    }

    if (summary.scope === 'hospital') {
      return [
        ...baseCards,
        {
          title: 'Hospital Staff',
          value: summary.totalHospitalStaff ?? 0,
          detail: 'Staff associated with your hospital',
        },
      ];
    }

    return baseCards;
  }, [summary]);

  const cardStyles: Record<string, { icon: LucideIcon; chip: string; gradient: string; detailColor: string }> = {
    Hospitals: {
      icon: Hospital,
      chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      gradient: 'from-emerald-50 to-white dark:from-emerald-900/15 dark:to-dark-bg-secondary',
      detailColor: 'text-emerald-700/80 dark:text-emerald-300/90',
    },
    'Insurance Companies': {
      icon: Building2,
      chip: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      gradient: 'from-cyan-50 to-white dark:from-cyan-900/15 dark:to-dark-bg-secondary',
      detailColor: 'text-cyan-700/80 dark:text-cyan-300/90',
    },
    Appointments: {
      icon: Activity,
      chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      gradient: 'from-indigo-50 to-white dark:from-indigo-900/15 dark:to-dark-bg-secondary',
      detailColor: 'text-indigo-700/80 dark:text-indigo-300/90',
    },
    Claims: {
      icon: FileClock,
      chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      gradient: 'from-amber-50 to-white dark:from-amber-900/15 dark:to-dark-bg-secondary',
      detailColor: 'text-amber-700/80 dark:text-amber-300/90',
    },
    Doctors: {
      icon: Stethoscope,
      chip: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
      gradient: 'from-sky-50 to-white dark:from-sky-900/15 dark:to-dark-bg-secondary',
      detailColor: 'text-sky-700/80 dark:text-sky-300/90',
    },
    Patients: {
      icon: Users,
      chip: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
      gradient: 'from-violet-50 to-white dark:from-violet-900/15 dark:to-dark-bg-secondary',
      detailColor: 'text-violet-700/80 dark:text-violet-300/90',
    },
    'EHR Access Requests': {
      icon: ShieldCheck,
      chip: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      gradient: 'from-rose-50 to-white dark:from-rose-900/15 dark:to-dark-bg-secondary',
      detailColor: 'text-rose-700/80 dark:text-rose-300/90',
    },
    'System Sub Admins': {
      icon: UserCog,
      chip: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
      gradient: 'from-slate-100 to-white dark:from-slate-800/40 dark:to-dark-bg-secondary',
      detailColor: 'text-slate-700/80 dark:text-slate-300/90',
    },
    'Hospital Admins': {
      icon: UserPlus,
      chip: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      gradient: 'from-teal-50 to-white dark:from-teal-900/15 dark:to-dark-bg-secondary',
      detailColor: 'text-teal-700/80 dark:text-teal-300/90',
    },
    'Hospital Staff': {
      icon: ClipboardList,
      chip: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      gradient: 'from-orange-50 to-white dark:from-orange-900/15 dark:to-dark-bg-secondary',
      detailColor: 'text-orange-700/80 dark:text-orange-300/90',
    },
  };

  const getCardStyle = (title: string) =>
    cardStyles[title] || {
      icon: Activity,
      chip: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
      gradient: 'from-gray-50 to-white dark:from-gray-800/30 dark:to-dark-bg-secondary',
      detailColor: 'text-gray-600 dark:text-gray-400',
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/*<div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Centralized metrics dashboard for your role scope.</p>
      </div>*/}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          (() => {
            const style = getCardStyle(card.title);
            const Icon = style.icon;

            return (
              <div
                key={card.title}
                className={`bg-gradient-to-br ${style.gradient} rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{card.title}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</div>
                  </div>
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${style.chip}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className={`text-xs mt-3 ${style.detailColor}`}>{card.detail}</div>
              </div>
            );
          })()
        ))}
      </div>
    </div>
  );
};
