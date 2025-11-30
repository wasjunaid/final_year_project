import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavbar } from '../../hooks/useNavbar';

const AppointmentUpcomingPage: React.FC = () => {
  const navigate = useNavigate();

  useNavbar({
    title: 'Appointment Details',
    showBackButton: true,
  });

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Details Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Follow-up Visit</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Upcoming
                </span>
                <span className="text-sm text-gray-500">APT-2025-015</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-sm text-purple-700 font-semibold">Time until appointment</div>
                <div className="text-2xl font-bold text-purple-900">2 days, 5 hours</div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="bg-primary/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-semibold text-gray-800">Dec 3, 2025</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="bg-primary/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Time</div>
                <div className="font-semibold text-gray-800">4:15 PM - 5:00 PM</div>
              </div>
            </div>
          </div>

          {/* Patient & Provider Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Patient Information</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                  BH
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Bilal Hassan</div>
                  <div className="text-sm text-gray-500">42 years • Male</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>bilal.hassan@email.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1 (555) 456-7890</span>
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
                  <div className="text-sm text-gray-500">General Practitioner</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Room 305, 3rd Floor</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>45 min duration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Purpose */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Appointment Purpose</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 text-sm">
                Follow-up visit to review recent lab results and discuss ongoing treatment plan. Patient has
                been experiencing mild symptoms that need evaluation.
              </p>
            </div>
          </div>

          {/* Preparation Instructions */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Preparation Instructions</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2 text-sm text-blue-900">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Bring all current medications and prescriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Arrive 15 minutes early for check-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Bring insurance card and photo ID</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>List any new symptoms or concerns since last visit</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-semibold">
                Send Reminder
              </button>
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold">
                Reschedule
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold">
                Print Details
              </button>
              <button className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold">
                Cancel Appointment
              </button>
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3">Reminders</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="reminder-24h" className="rounded" defaultChecked />
                <label htmlFor="reminder-24h" className="text-sm text-gray-700">
                  24 hours before
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="reminder-2h" className="rounded" defaultChecked />
                <label htmlFor="reminder-2h" className="text-sm text-gray-700">
                  2 hours before
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="reminder-sms" className="rounded" />
                <label htmlFor="reminder-sms" className="text-sm text-gray-700">
                  SMS Reminder
                </label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3">Location</h3>
            <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center text-gray-500 text-sm mb-3">
              Map Placeholder
            </div>
            <div className="text-sm text-gray-600">
              <div className="font-semibold">Main Medical Center</div>
              <div>123 Healthcare Ave</div>
              <div>Suite 305, 3rd Floor</div>
              <div>City, State 12345</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentUpcomingPage;
