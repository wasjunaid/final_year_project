import React from 'react';
import { useNavbar } from '../../hooks/useNavbar';

const AppointmentConfirmedPage: React.FC = () => {
  useNavbar({
    title: 'Appointment Details',
    showBackButton: true,
  });
  return (
    <>
      <div className="animate-slide-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Details Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">General Checkup</h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    ✓ Confirmed
                  </span>
                  <span className="text-sm text-gray-500">APT-2024-011</span>
                </div>
              </div>
            </div>

            {/* Success Alert */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <div className="font-semibold text-green-900 mb-1">Appointment Confirmed</div>
                  <p className="text-sm text-green-800">
                    The patient has been notified. Confirmation email and SMS sent successfully.
                  </p>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-semibold text-gray-800">Oct 15, 2025</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-semibold text-gray-800">9:00 AM</div>
                </div>
              </div>
            </div>

            {/* Patient & Provider Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Patient Information</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    MS
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Maria Silva</div>
                    <div className="text-sm text-gray-500">32 years • Female</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span>maria.silva@email.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span>+1 (555) 345-6789</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Provider Information</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 text-green-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    MJ
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Dr. Maria Johnson</div>
                    <div className="text-sm text-gray-500">General Practitioner</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Reason for Visit</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">Annual general checkup and health assessment.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Reschedule
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Appointment Timeline */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">Confirmed</div>
                    <div className="text-xs text-gray-500">Yesterday at 3:20 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reminder Settings */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Reminders</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-gray-700">Email reminder (24h before)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-gray-700">SMS reminder (2h before)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentConfirmedPage;
