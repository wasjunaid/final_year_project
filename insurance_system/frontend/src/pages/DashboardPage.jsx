// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  FileText,
  Shield,
  Building,
  UserPlus,
  BadgeCheck,
  List,
} from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';
import { capitalizeFirstLetter } from '../utils/formatters';
import { userService } from '../services/userService';
import { hospitalService } from '../services/hospitalService';
import { claimService } from '../services/claimService';
import { insuranceService } from '../services/insuranceService';
import { personService } from '../services/personService';
import { ROLES } from '../constants/roles';
const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    hospitals: 0,
    claims: 0,
    insurances: 0,
    persons: 0,
    companies: 0,
    personInsurances: 0,
    plans: 0,
    insuranceStaff: 0,
    panelHospitals: 0,
  });

  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const isInsuranceAdmin = user?.role === ROLES.INSURANCE_ADMIN;
  const isInsuranceSubAdmin = user?.role === ROLES.INSURANCE_SUB_ADMIN;
  const isInsuranceStaff = isInsuranceAdmin || isInsuranceSubAdmin;

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const statsData = {};

      // Super Admin stats
      if (isSuperAdmin) {
        try {
          const usersRes = await userService.getAllUsers();
          statsData.users = usersRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.users = 0;
          }
        }

        try {
          const hospitalsRes = await hospitalService.getAllHospitals();
          statsData.hospitals = hospitalsRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.hospitals = 0;
          }
        }

        try {
          const companiesRes = await insuranceService.getAllInsuranceCompanies();
          statsData.companies = companiesRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.companies = 0;
          }
        }

        try {
          const staffRes = await insuranceService.getInsuranceStaffForSuperAdmin();
          statsData.insuranceStaff = staffRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.insuranceStaff = 0;
          }
        }
      }

      // Insurance Staff stats
      if (isInsuranceStaff) {
        try {
          const personsRes = await personService.getAllPersons();
          statsData.persons = personsRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.persons = 0;
          }
        }

        try {
          const hospitalsRes = await hospitalService.getAllHospitals();
          statsData.hospitals = hospitalsRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.hospitals = 0;
          }
        }

        try {
          const claimsRes = await claimService.getAllClaims();
          statsData.claims = claimsRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.claims = 0;
          }
        }

        try {
          const insurancesRes = await insuranceService.getAllInsurances();
          statsData.insurances = insurancesRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.insurances = 0;
          }
        }

        try {
          const personInsurancesRes = await personService.getAllPersonInsurances();
          statsData.personInsurances = personInsurancesRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.personInsurances = 0;
          }
        }

        try {
          const plansRes = await insuranceService.getAllInsurancePlans();
          statsData.plans = plansRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.plans = 0;
          }
        }

        try {
          const panelRes = await insuranceService.getInsurancePanelList();
          statsData.panelHospitals = panelRes.data?.length || 0;
        } catch (err) {
          if (err.response?.data?.status === 404 || err.response?.status === 404) {
            statsData.panelHospitals = 0;
          }
        }

        // Only Insurance Admin can see staff
        if (isInsuranceAdmin) {
          try {
            const staffRes = await insuranceService.getAllInsuranceStaff();
            statsData.insuranceStaff = staffRes.data?.length || 0;
          } catch (err) {
            if (err.response?.data?.status === 404 || err.response?.status === 404) {
              statsData.insuranceStaff = 0;
            }
          }
        }
      }

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuperAdminStats = () => [
    { title: 'Total Users', value: stats.users, icon: Users },
    { title: 'Total Hospitals', value: stats.hospitals, icon: Building2 },
    { title: 'Insurance Companies', value: stats.companies, icon: Building },
    { title: 'Insurance Staff', value: stats.insuranceStaff, icon: BadgeCheck },
  ];

  const getInsuranceAdminStats = () => [
    { title: 'Total Persons', value: stats.persons, icon: Users },
    { title: 'Total Hospitals', value: stats.hospitals, icon: Building2 },
    { title: 'Total Claims', value: stats.claims, icon: FileText },
    { title: 'Total Insurances', value: stats.insurances, icon: Shield },
    { title: 'Person Insurances', value: stats.personInsurances, icon: UserPlus },
    { title: 'Insurance Plans', value: stats.plans, icon: Shield },
    { title: 'Panel Hospitals', value: stats.panelHospitals, icon: List },
    { title: 'Insurance Staff', value: stats.insuranceStaff, icon: BadgeCheck },
  ];

  const getInsuranceSubAdminStats = () => [
    { title: 'Total Persons', value: stats.persons, icon: Users },
    { title: 'Total Hospitals', value: stats.hospitals, icon: Building2 },
    { title: 'Total Claims', value: stats.claims, icon: FileText },
    { title: 'Total Insurances', value: stats.insurances, icon: Shield },
    { title: 'Person Insurances', value: stats.personInsurances, icon: UserPlus },
    { title: 'Insurance Plans', value: stats.plans, icon: Shield },
    { title: 'Panel Hospitals', value: stats.panelHospitals, icon: List },
  ];

  const displayStats = isSuperAdmin 
    ? getSuperAdminStats() 
    : isInsuranceAdmin 
    ? getInsuranceAdminStats()
    : getInsuranceSubAdminStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <Header />
      <Sidebar />
      <main className="pt-20 md:pl-[17rem] px-4 pb-4 md:px-6 md:pb-6">
        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl border border-gray-200 dark:border-[#404040] p-5 mb-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.email} ({capitalizeFirstLetter(user?.role)})
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {displayStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="rounded-xl border border-gray-200 dark:border-[#404040] bg-white dark:bg-[#2d2d2d] p-4 shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 flex items-center justify-center mb-3">
                    <Icon size={20} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.title}</div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
