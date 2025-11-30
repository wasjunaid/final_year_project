import React from 'react';
import { useNavbar } from '../../hooks/useNavbar';

const AppointmentCompletedPage: React.FC = () => {
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
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Teeth Cleaning</h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    Completed
                  </span>
                  <span className="text-sm text-gray-500">APT-2024-001</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Print">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                </button>
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
                  <div className="font-semibold text-gray-800">Oct 12, 2025</div>
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
                  <div className="font-semibold text-gray-800">10:30 AM - 11:15 AM</div>
                </div>
              </div>
            </div>

            {/* Patient & Provider Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Patient Information</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    AK
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Ali Khan</div>
                    <div className="text-sm text-gray-500">35 years • Male</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span>ali.khan@email.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Provider Information</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 text-green-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    SJ
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Dr. Sara Johnson</div>
                    <div className="text-sm text-gray-500">Dentist</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Clinical Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">
                  Routine dental cleaning completed. No cavities detected. Gums are healthy. Advised patient to continue current oral hygiene routine.
                  Recommended fluoride treatment for strengthening enamel. Next checkup scheduled in 6 months.
                </p>
              </div>
            </div>

            {/* Follow-up Actions */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Follow-up</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <div className="font-semibold text-blue-900 text-sm mb-1">Next Appointment Recommended</div>
                    <p className="text-sm text-blue-800">Schedule follow-up dental cleaning in 6 months (April 2026)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Session Summary */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Session Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">45 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-semibold">10:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ended:</span>
                  <span className="font-semibold">11:15 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Completed</span>
                </div>
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Billing</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee:</span>
                  <span className="font-semibold">$150</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance Coverage:</span>
                  <span className="font-semibold text-green-600">-$100</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                  <span className="font-semibold text-gray-800">Patient Paid:</span>
                  <span className="font-bold text-primary text-lg">$50</span>
                </div>
                <div className="mt-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Paid in Full
                  </span>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Documents</h3>
              <div className="space-y-2">
                <button className="w-full p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-left flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span>Treatment Summary.pdf</span>
                </button>
                <button className="w-full p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-left flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span>Invoice.pdf</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentCompletedPage;
