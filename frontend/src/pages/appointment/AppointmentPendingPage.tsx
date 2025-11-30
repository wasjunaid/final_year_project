import React from 'react';
import { useNavbar } from '../../hooks/useNavbar';

const AppointmentPendingPage: React.FC = () => {
  useNavbar({
    title: 'Appointment Details',
    showBackButton: true,
  });
  return (
    <>
      {/* Appointment Details */}
      <div className="animate-slide-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Details Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Video Consultation</h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold flex items-center gap-1">
                    <span className="animate-pulse">●</span> Pending Approval
                  </span>
                  <span className="text-sm text-gray-500">APT-2024-013</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Edit">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Cancel">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Pending Alert */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div>
                  <div className="font-semibold text-yellow-900 mb-1">Action Required</div>
                  <p className="text-sm text-yellow-800">
                    This appointment is awaiting your confirmation. Please review the details and approve or reschedule the appointment.
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
                  <div className="text-sm text-gray-500">Requested Date</div>
                  <div className="font-semibold text-gray-800">Oct 13, 2025</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Requested Time</div>
                  <div className="font-semibold text-gray-800">2:00 PM</div>
                </div>
              </div>
            </div>

            {/* Patient & Provider Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Patient Information</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    FA
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Fatima Ahmed</div>
                    <div className="text-sm text-gray-500">28 years • Female</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span>fatima.ahmed@email.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span>+1 (555) 234-5678</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span>New Patient</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Requested Provider</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 text-green-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    AR
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Dr. Ali Rahman</div>
                    <div className="text-sm text-gray-500">Internal Medicine</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Reason for Visit</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">
                  Patient requesting consultation for persistent headaches and fatigue over the past two weeks. Would like to discuss symptoms and potential treatment options.
                </p>
              </div>
            </div>

            {/* Approval Actions */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Review & Approve</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Approve Appointment
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Suggest Alternative
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Decline
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Request Timeline */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Request Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">Awaiting Response</div>
                    <div className="text-xs text-gray-500">Since 2 hours ago</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient History Summary */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Patient History</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Previous Visits:</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancelled:</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No-Shows:</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="mt-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    New Patient
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentPendingPage;
