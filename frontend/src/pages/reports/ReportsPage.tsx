import React from 'react';
import { useNavbar } from '../../hooks/useNavbar';

const ReportsPage: React.FC = () => {
  useNavbar({
    title: 'Reports & Analytics',
  });
  const stats = [
    {
      label: 'Total Appointments',
      value: '1,248',
      change: '↑ 12% from last month',
      color: 'text-primary',
      changeColor: 'text-green-500',
    },
    {
      label: 'Active Patients',
      value: '842',
      change: '↑ 8% from last month',
      color: 'text-green-600',
      changeColor: 'text-green-500',
    },
    {
      label: 'Pending Labs',
      value: '23',
      change: '↓ 3% from last month',
      color: 'text-orange-600',
      changeColor: 'text-red-500',
    },
    {
      label: 'Revenue',
      value: '$45.2K',
      change: '↑ 15% from last month',
      color: 'text-purple-600',
      changeColor: 'text-green-500',
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
              <div className="text-gray-500 text-xs md:text-sm mb-2">{stat.label}</div>
              <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className={`${stat.changeColor} text-xs mt-2`}>{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Appointments Overview</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
                <p className="text-sm">Chart visualization coming soon</p>
              </div>
            </div>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  ></path>
                </svg>
                <p className="text-sm">Chart visualization coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              {
                action: 'New appointment scheduled',
                details: 'Maria Silva - General Checkup',
                time: '2 hours ago',
              },
              {
                action: 'Lab results uploaded',
                details: 'John Doe - Complete Blood Count',
                time: '5 hours ago',
              },
              {
                action: 'Patient registered',
                details: 'Fatima Ahmed',
                time: '1 day ago',
              },
              {
                action: 'Appointment completed',
                details: 'Ali Khan - Teeth Cleaning',
                time: '2 days ago',
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="bg-primary/10 text-primary rounded-full w-2 h-2 mt-2"></div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.details}</div>
                </div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsPage;
