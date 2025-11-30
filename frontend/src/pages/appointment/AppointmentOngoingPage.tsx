import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavbar } from '../../hooks/useNavbar';

const AppointmentOngoingPage: React.FC = () => {
  const navigate = useNavigate();
  
  useNavbar({
    title: 'Ongoing Appointment',
  });

  const [activeTab, setActiveTab] = useState('notes');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-3 md:p-4 mb-3 md:mb-4 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/appointments')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">In-Session Consultation</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Session Active
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">Started at 2:00 PM</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pause
            </button>
            <button 
              onClick={() => setShowEndSessionModal(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              End Session
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Consultation Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient Info Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl">
                JD
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">John Doe</h2>
                <div className="flex flex-wrap gap-2 md:gap-4 text-sm text-gray-600 mt-1">
                  <span>45 years • Male</span>
                  <span>•</span>
                  <span>Blood Type: O+</span>
                  <span>•</span>
                  <span>MRN: 123456</span>
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-xs text-gray-500">Chief Complaint</div>
                <div className="font-semibold text-gray-800">Chest pain and shortness of breath</div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex gap-2 border-b border-gray-200 pb-3 mb-4 overflow-x-auto">
              {['notes', 'prescription', 'tests', 'vitals', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Clinical Notes Tab */}
            {activeTab === 'notes' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Clinical Notes (SOAP)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subjective (Patient's Description)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Patient reports chest pain that started 2 hours ago..."
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Objective (Physical Examination Findings)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="BP: 140/90, HR: 85, Temp: 98.6°F, Resp: 18/min..."
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assessment (Diagnosis)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Suspected angina pectoris, rule out myocardial infarction..."
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Plan (Treatment Plan)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="1. ECG and cardiac enzymes&#10;2. Prescribe nitroglycerin&#10;3. Follow-up in 48 hours..."
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <button className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                    Save Clinical Notes
                  </button>
                </div>
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === 'prescription' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Prescriptions</h3>
                  <button
                    onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-semibold flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Medication
                  </button>
                </div>

                {showPrescriptionForm && (
                  <div className="space-y-3 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Medication Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Lisinopril"
                          className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Dosage</label>
                        <input
                          type="text"
                          placeholder="e.g., 10mg"
                          className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency</label>
                        <select className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">
                          <option>Once daily</option>
                          <option>Twice daily</option>
                          <option>Three times daily</option>
                          <option>As needed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g., 7 days"
                          className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          placeholder="30"
                          className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm font-semibold">
                        Add Prescription
                      </button>
                      <button
                        onClick={() => setShowPrescriptionForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center text-gray-500 py-8">
                  <p>No prescriptions added yet</p>
                </div>
              </div>
            )}

            {/* Lab Tests Tab */}
            {activeTab === 'tests' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Order Lab Tests</h3>
                <div className="space-y-3">
                  {['Complete Blood Count (CBC)', 'Basic Metabolic Panel', 'Lipid Panel', 'Urinalysis'].map((test) => (
                    <div key={test} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-800">{test}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                  Order Selected Tests
                </button>
              </div>
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Record Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Heart Rate</label>
                    <input
                      type="text"
                      placeholder="75 bpm"
                      className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Temperature</label>
                    <input
                      type="text"
                      placeholder="98.6°F"
                      className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Respiratory Rate</label>
                    <input
                      type="text"
                      placeholder="16/min"
                      className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <button className="w-full mt-4 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                  Save Vitals
                </button>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Patient History</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">Previous Visit</div>
                      <div className="text-xs text-gray-500">Oct 15, 2025</div>
                    </div>
                    <p className="text-sm text-gray-600">Annual checkup - All vitals normal</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">Allergies</div>
                    </div>
                    <p className="text-sm text-gray-600">Penicillin, Shellfish</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">Current Medications</div>
                    </div>
                    <p className="text-sm text-gray-600">Lisinopril 10mg - Once daily</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Session Timer */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3">Session Time</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">00:23:45</div>
              <div className="text-xs text-gray-500 mt-1">Elapsed Time</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold">
                Take Photo
              </button>
              <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-semibold">
                Upload Document
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold">
                View EHR
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3">Quick Notes</h3>
            <textarea
              rows={4}
              placeholder="Add quick notes..."
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* End Session Modal */}
      {showEndSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">End Session?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end this consultation session? Make sure all notes and prescriptions
              are saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndSessionModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/appointments')}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentOngoingPage;
