import React, { useMemo } from 'react';
import { useNavbar, useRouteState } from '../../hooks/useNavbar';
import { useNavigationStore } from '../../stores/navigation/navigationStore';
import type { NavbarConfig } from '../../models/navigation/model';

const AppointmentsDashboardPage: React.FC = () => {
  const { navigateTo } = useNavigationStore();
  const routeState = useRouteState();
  const activeTab = routeState.activeTab || 'all';
  const searchQuery = routeState.searchQuery || '';

  // Navbar configuration
  const navbarConfig: NavbarConfig = useMemo(() => ({
    title: 'Appointments',
    showSearch: true,
    searchPlaceholder: 'Search by patient name, ID, or service...',
    tabs: [
      { label: 'All', value: 'all' },
      { label: 'Requests', value: 'requests' },
      { label: 'Create', value: 'create' },
    ],
  }), []);

  useNavbar(navbarConfig);

  // Mock data - showing all appointment types
  const mockAppointments = [
    {
      id: 'APT-2025-001',
      service: 'Chest Pain Consultation',
      patient: 'John Doe',
      time: '2:00 PM',
      date: 'Nov 30, 2025',
      provider: 'Dr. Sarah Wilson',
      status: 'ongoing',
    },
    {
      id: 'APT-2025-002',
      service: 'Video Consultation',
      patient: 'Fatima Ahmed',
      time: '11:00 AM',
      date: 'Nov 30, 2025',
      provider: 'Dr. Ali Rahman',
      status: 'pending',
    },
    {
      id: 'APT-2025-003',
      service: 'Annual Checkup',
      patient: 'Zainab Ali',
      time: '9:00 AM',
      date: 'Dec 1, 2025',
      provider: 'Dr. Mike Chen',
      status: 'confirmed',
    },
    {
      id: 'APT-2025-004',
      service: 'Follow-up Visit',
      patient: 'Bilal Hassan',
      time: '4:15 PM',
      date: 'Dec 3, 2025',
      provider: 'Dr. Sara Johnson',
      status: 'upcoming',
    },
    {
      id: 'APT-2025-005',
      service: 'Teeth Cleaning',
      patient: 'Ali Khan',
      time: '10:30 AM',
      date: 'Nov 29, 2025',
      provider: 'Dr. Sara Johnson',
      status: 'completed',
    },
    {
      id: 'APT-2025-006',
      service: 'Blood Pressure Checkup',
      patient: 'Ahmed Hassan',
      time: '3:30 PM',
      date: 'Dec 2, 2025',
      provider: 'Dr. Emily Roberts',
      status: 'confirmed',
    },
    {
      id: 'APT-2025-007',
      service: 'Diabetes Management',
      patient: 'Sarah Johnson',
      time: '1:00 PM',
      date: 'Nov 30, 2025',
      provider: 'Dr. David Lee',
      status: 'pending',
    },
    {
      id: 'APT-2025-008',
      service: 'Physical Therapy',
      patient: 'Michael Brown',
      time: '8:30 AM',
      date: 'Nov 28, 2025',
      provider: 'Dr. Lisa Martinez',
      status: 'completed',
    },
    {
      id: 'APT-2025-009',
      service: 'Vaccination',
      patient: 'Emma Wilson',
      time: '2:45 PM',
      date: 'Dec 5, 2025',
      provider: 'Dr. James Anderson',
      status: 'upcoming',
    },
    {
      id: 'APT-2025-010',
      service: 'Mental Health Session',
      patient: 'Omar Khan',
      time: '10:00 AM',
      date: 'Dec 4, 2025',
      provider: 'Dr. Rachel Green',
      status: 'confirmed',
    },
  ];

  const mockRequests = [
    {
      id: 'REQ-001',
      requester: 'Fatima Ahmed',
      requestedFor: 'Dr. Ali Rahman',
      date: 'Nov 30, 2025',
      time: '11:00 AM',
      notes: 'Persistent headaches and dizziness',
    },
    {
      id: 'REQ-002',
      requester: 'John Doe',
      requestedFor: 'Dr. Maria Johnson',
      date: 'Dec 1, 2025',
      time: '2:00 PM',
      notes: 'Annual checkup - insurance required',
    },
    {
      id: 'REQ-003',
      requester: 'Sarah Johnson',
      requestedFor: 'Dr. David Lee',
      date: 'Dec 2, 2025',
      time: '10:30 AM',
      notes: 'Follow-up for diabetes management',
    },
    {
      id: 'REQ-004',
      requester: 'Ahmed Hassan',
      requestedFor: 'Dr. Emily Roberts',
      date: 'Dec 1, 2025',
      time: '3:00 PM',
      notes: 'High blood pressure symptoms',
    },
    {
      id: 'REQ-005',
      requester: 'Emma Wilson',
      requestedFor: 'Dr. James Anderson',
      date: 'Dec 3, 2025',
      time: '9:00 AM',
      notes: 'Flu vaccination appointment',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      ongoing: 'bg-green-100 text-green-700 animate-pulse',
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      upcoming: 'bg-purple-100 text-purple-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };

    const statusLabels = {
      ongoing: 'Ongoing',
      pending: 'Pending',
      confirmed: 'Confirmed',
      upcoming: 'Upcoming',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  const handleAppointmentClick = (appointment: any) => {
    if (appointment.status === 'pending') {
      navigateTo('appointments-pending');
    } else if (appointment.status === 'confirmed') {
      navigateTo('appointments-confirmed');
    } else if (appointment.status === 'upcoming') {
      navigateTo('appointments-upcoming');
    } else if (appointment.status === 'ongoing') {
      navigateTo('appointments-ongoing');
    } else if (appointment.status === 'completed') {
      navigateTo('appointments-completed');
    }
  };

  // Filter appointments based on search query
  const filteredAppointments = mockAppointments.filter(apt =>
    apt.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>

      <div className="flex-1 overflow-auto flex flex-col">
        {/* All Appointments Tab */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex-1 flex flex-col" style={{ animation: 'slideInTab 0.3s ease-out' }}>
            <div className="overflow-x-auto flex-1">
              <table className="table-auto w-full border-collapse">
                <thead className="bg-gradient-to-r from-primary/10 to-primary/5 sticky top-0">
                  <tr>
                    <th className="p-3 md:p-4 text-left text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20">
                      Service / Patient
                    </th>
                    <th className="p-3 md:p-4 text-left text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20 hidden sm:table-cell">
                      Time
                    </th>
                    <th className="p-3 md:p-4 text-left text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20 hidden md:table-cell">
                      Date
                    </th>
                    <th className="p-3 md:p-4 text-left text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20 hidden lg:table-cell">
                      Provider
                    </th>
                    <th className="p-3 md:p-4 text-left text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment, index) => (
                    <tr
                      key={appointment.id}
                      onClick={() => handleAppointmentClick(appointment)}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-primary/5 transition-colors cursor-pointer`}
                    >
                      <td className="p-3 md:p-4">
                        <div className="font-semibold text-gray-800">{appointment.service}</div>
                        <div className="text-sm text-gray-500">{appointment.patient}</div>
                        <div className="text-xs text-gray-400 mt-1">{appointment.id}</div>
                      </td>
                      <td className="p-3 md:p-4 text-gray-600 hidden sm:table-cell">
                        {appointment.time}
                      </td>
                      <td className="p-3 md:p-4 text-gray-600 hidden md:table-cell">
                        {appointment.date}
                      </td>
                      <td className="p-3 md:p-4 text-gray-600 hidden lg:table-cell">
                        {appointment.provider}
                      </td>
                      <td className="p-3 md:p-4">{getStatusBadge(appointment.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs md:text-sm text-gray-700">
                  Showing <span className="font-semibold">1</span> to{' '}
                  <span className="font-semibold">{mockAppointments.length}</span> of{' '}
                  <span className="font-semibold">{mockAppointments.length}</span> results
                </div>
                <div className="flex gap-1 md:gap-2 flex-wrap justify-center">
                  <button className="px-3 py-1 bg-primary text-white rounded-lg text-sm">1</button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                    2
                  </button>
                  <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                    3
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex-1 flex flex-col" style={{ animation: 'slideInTab 0.3s ease-out' }}>
            <div className="overflow-x-auto flex-1">
              <table className="table-auto w-full border-collapse">
                <thead className="bg-gradient-to-r from-primary/10 to-primary/5 sticky top-0">
                  <tr>
                    <th className="p-3 md:p-4 text-left text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20">
                      Requester
                    </th>
                    <th className="p-3 md:p-4 text-left text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20 hidden md:table-cell">
                      Requested For
                    </th>
                    <th className="p-3 md:p-4 text-left text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20 hidden lg:table-cell">
                      Date
                    </th>
                    <th className="p-3 md:p-4 text-left text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20 hidden xl:table-cell">
                      Notes
                    </th>
                    <th className="p-3 md:p-4 text-left text-xs font-bold text-primary uppercase tracking-wider border-b-2 border-primary/20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockRequests.map((request, index) => (
                    <tr
                      key={request.id}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-primary/5 transition-colors`}
                    >
                      <td className="p-3 md:p-4">
                        <div className="font-semibold text-gray-800">{request.requester}</div>
                        <div className="text-xs text-gray-400 mt-1">{request.id}</div>
                      </td>
                      <td className="p-3 md:p-4 text-gray-600 hidden md:table-cell">
                        {request.requestedFor}
                      </td>
                      <td className="p-3 md:p-4 text-gray-600 hidden lg:table-cell">
                        {request.date}
                      </td>
                      <td className="p-3 md:p-4 text-gray-600 hidden xl:table-cell">
                        {request.notes}
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigateTo('appointments-pending')}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                            Review
                          </button>
                          <button className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs md:text-sm text-gray-700">
                  Showing <span className="font-semibold">1</span> to{' '}
                  <span className="font-semibold">{mockRequests.length}</span> of{' '}
                  <span className="font-semibold">{mockRequests.length}</span> results
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200" style={{ animation: 'slideInTab 0.3s ease-out' }}>
            <form className="flex flex-col gap-3 md:gap-4 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Name
                </label>
                <input
                  name="patient"
                  placeholder="Enter patient name"
                  className="w-full border border-gray-300 p-2.5 md:p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date & Time
                </label>
                <input
                  name="datetime"
                  type="datetime-local"
                  className="w-full border border-gray-300 p-2.5 md:p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Provider
                </label>
                <select
                  name="provider"
                  className="w-full border border-gray-300 p-2.5 md:p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
                >
                  <option value="">Select a provider</option>
                  <option>Dr. Sara Johnson</option>
                  <option>Dr. Ali Rahman</option>
                  <option>Dr. Maria Johnson</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  name="service"
                  className="w-full border border-gray-300 p-2.5 md:p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
                >
                  <option value="">Select a service</option>
                  <option>General Checkup</option>
                  <option>Video Consultation</option>
                  <option>Teeth Cleaning</option>
                  <option>Follow-up</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Add any additional notes..."
                  className="w-full border border-gray-300 p-2.5 md:p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
                />
              </div>
              <div className="flex gap-2 md:gap-3 mt-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 md:px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-md text-sm md:text-base"
                >
                  Create Appointment
                </button>
                <button
                  type="reset"
                  className="border border-gray-300 px-4 md:px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentsDashboardPage;
