import React from 'react';
import { useNavbar } from '../../hooks/useNavbar';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  lastVisit: string;
  upcomingAppointment?: string;
}

const PatientsPage: React.FC = () => {
  useNavbar({
    title: 'Patients',
    showSearch: true,
    searchPlaceholder: 'Search patients by name, ID, or contact...',
  });

  const mockPatients: Patient[] = [
    {
      id: 'PAT-001',
      name: 'Ali Khan',
      age: 35,
      gender: 'Male',
      phone: '+1 (555) 123-4567',
      email: 'ali.khan@email.com',
      lastVisit: 'Nov 29, 2025',
    },
    {
      id: 'PAT-002',
      name: 'Maria Silva',
      age: 32,
      gender: 'Female',
      phone: '+1 (555) 345-6789',
      email: 'maria.silva@email.com',
      lastVisit: 'Nov 27, 2025',
      upcomingAppointment: 'Dec 2, 2025',
    },
    {
      id: 'PAT-003',
      name: 'Fatima Ahmed',
      age: 28,
      gender: 'Female',
      phone: '+1 (555) 234-5678',
      email: 'fatima.ahmed@email.com',
      lastVisit: 'Nov 25, 2025',
      upcomingAppointment: 'Nov 30, 2025',
    },
    {
      id: 'PAT-004',
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      phone: '+1 (555) 456-7890',
      email: 'john.doe@email.com',
      lastVisit: 'Nov 28, 2025',
      upcomingAppointment: 'Nov 30, 2025',
    },
    {
      id: 'PAT-005',
      name: 'Ahmed Hassan',
      age: 52,
      gender: 'Male',
      phone: '+1 (555) 567-8901',
      email: 'ahmed.hassan@email.com',
      lastVisit: 'Nov 26, 2025',
      upcomingAppointment: 'Dec 2, 2025',
    },
    {
      id: 'PAT-006',
      name: 'Sarah Johnson',
      age: 41,
      gender: 'Female',
      phone: '+1 (555) 678-9012',
      email: 'sarah.johnson@email.com',
      lastVisit: 'Nov 30, 2025',
    },
    {
      id: 'PAT-007',
      name: 'Emma Wilson',
      age: 29,
      gender: 'Female',
      phone: '+1 (555) 789-0123',
      email: 'emma.wilson@email.com',
      lastVisit: 'Nov 24, 2025',
      upcomingAppointment: 'Dec 5, 2025',
    },
    {
      id: 'PAT-008',
      name: 'Bilal Hassan',
      age: 42,
      gender: 'Male',
      phone: '+1 (555) 890-1234',
      email: 'bilal.hassan@email.com',
      lastVisit: 'Nov 27, 2025',
      upcomingAppointment: 'Dec 3, 2025',
    },
    {
      id: 'PAT-009',
      name: 'Omar Khan',
      age: 38,
      gender: 'Male',
      phone: '+1 (555) 901-2345',
      email: 'omar.khan@email.com',
      lastVisit: 'Nov 29, 2025',
      upcomingAppointment: 'Dec 4, 2025',
    },
    {
      id: 'PAT-010',
      name: 'Zainab Ali',
      age: 31,
      gender: 'Female',
      phone: '+1 (555) 012-3456',
      email: 'zainab.ali@email.com',
      lastVisit: 'Nov 28, 2025',
      upcomingAppointment: 'Dec 1, 2025',
    },
    {
      id: 'PAT-011',
      name: 'Michael Brown',
      age: 55,
      gender: 'Male',
      phone: '+1 (555) 111-2222',
      email: 'michael.brown@email.com',
      lastVisit: 'Nov 22, 2025',
    },
    {
      id: 'PAT-012',
      name: 'Rachel Green',
      age: 36,
      gender: 'Female',
      phone: '+1 (555) 222-3333',
      email: 'rachel.green@email.com',
      lastVisit: 'Nov 30, 2025',
      upcomingAppointment: 'Dec 6, 2025',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {mockPatients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                  {patient.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{patient.name}</h3>
                  <p className="text-sm text-gray-500">
                    {patient.age} years • {patient.gender}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                <span className="truncate">{patient.email}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Visit:</span>
                <span className="font-semibold text-gray-800">{patient.lastVisit}</span>
              </div>
              {patient.upcomingAppointment && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Next Appointment:</span>
                  <span className="font-semibold text-green-600">{patient.upcomingAppointment}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm">
                View Profile
              </button>
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PatientsPage;
