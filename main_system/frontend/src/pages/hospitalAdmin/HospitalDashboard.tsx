import React, { useEffect, useMemo, useState } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useHospitalController } from '../../hooks/hospital';
import { useAppointmentController } from '../../hooks/appointment';
import { useHospitalStaffController } from '../../hooks/hospitalStaff';
import useLabTestController from '../../hooks/labTest/useLabTestController.instance';
import { useDoctorController } from '../../hooks/doctor';
import Alert from '../../components/Alert';
import TextInput from '../../components/TextInput';
import type { HospitalModel } from '../../models/hospital';
import { useHospitalStaffProfileController } from '../../hooks/profile';

const HospitalDashboard: React.FC = () => {
  const { 
    hospitalById, 
    error: hospitalsError, 
    success: hospitalSuccess, 
    fetchHospitalById,
    clearMessages: clearHospitalMessages 
  } = useHospitalController();

  const appointmentCtrl = useAppointmentController();
  const hospitalStaffCtrl = useHospitalStaffController();
  const labTestCtrl = useLabTestController();
  const doctorCtrl = useDoctorController();

  // Dashboard is read-only now; hospital updates are handled in the profile page
  const [hospital, setHospital] = useState<HospitalModel | null>();
  
  useEffect(() => {
    setHospital(hospitalById)
  }, [hospitalById]);

  const {profile : hospitalStaffProfile, fetchProfile: fetchHospitalStaffProfile } = useHospitalStaffProfileController();

  useEffect(() => {
    fetchHospitalStaffProfile();
  }, []); // Run once on mount

  useEffect(() => {
    if (hospitalStaffProfile?.hospitalId) {
      fetchHospitalById(hospitalStaffProfile.hospitalId.toString());
    }
  }, [hospitalStaffProfile]); // Run when hospitalStaffProfile changes

  // Fetch related stats on mount only
  useEffect(() => {
    appointmentCtrl.fetchForHospital();
    hospitalStaffCtrl.fetchHospitalStaff();
    labTestCtrl.fetchAllLabTests();
    // ensure doctors are loaded
    doctorCtrl.fetchForAppointmentBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // no update handlers here; profile page handles updates

  const navbarConfig = useMemo(() => ({ title: 'Hospital Dashboard' }), []);

  useNavbarController(navbarConfig);

  // Derived stats
  const appointmentCount = appointmentCtrl.hospitalAppointments.length;
  const todayString = new Date().toDateString();
  const upcomingCount = appointmentCtrl.hospitalAppointments.filter(a => {
    if (typeof a.date !== 'string') return false;
    const d = new Date(a.date);
    return d.toDateString() === todayString;
  }).length;
  const staffCount = hospitalStaffCtrl.hospitalStaff.length;
  const labTestCount = labTestCtrl.labTests.length;
  const doctorsCount = doctorCtrl.doctors.length;

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {hospitalSuccess && (
        <Alert type="success" title={hospitalSuccess} message="" onClose={clearHospitalMessages} />
      )}
      {hospitalsError && (
        <Alert type="error" title={hospitalsError} message="" onClose={clearHospitalMessages} />
      )}

      {/* Hospital Info Card */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-200 dark:border-dark-border p-6">
        <h2 className="text-xl font-semibold mb-2">Hospital Information</h2>
        {!hospital && (
          <p className="text-gray-500">No hospital found. Create or assign a hospital first.</p>
        )}

        {hospital && (
          <div className="space-y-4">
            <TextInput
              label="Name"
              value={hospital.name || ''}
              disabled
            />

            <TextInput
              label="Wallet Address"
              value={hospital.wallet_address || 'Not configured'}
              disabled
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TextInput label="Hospital ID" value={String(hospital.hospital_id)} disabled />
              <TextInput label="Created At" value={new Date(hospital.created_at).toLocaleString()} disabled />
              <TextInput label="Updated At" value={new Date(hospital.updated_at).toLocaleString()} disabled />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-white dark:from-blue-900/15 dark:to-dark-bg-secondary rounded-xl shadow-md border border-blue-100 dark:border-dark-border p-4">
          <div className="text-xs text-blue-700/80 dark:text-blue-300/90">Appointments</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{appointmentCount}</div>
          <div className="text-sm text-blue-700/70 dark:text-blue-300/80">Today: {upcomingCount}</div>
        </div>

        <div className="bg-linear-to-br from-emerald-50 to-white dark:from-emerald-900/15 dark:to-dark-bg-secondary rounded-xl shadow-md border border-emerald-100 dark:border-dark-border p-4">
          <div className="text-xs text-emerald-700/80 dark:text-emerald-300/90">Staff</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{staffCount}</div>
          <div className="text-sm text-emerald-700/70 dark:text-emerald-300/80">Active staff</div>
        </div>

        <div className="bg-linear-to-br from-amber-50 to-white dark:from-amber-900/15 dark:to-dark-bg-secondary rounded-xl shadow-md border border-amber-100 dark:border-dark-border p-4">
          <div className="text-xs text-amber-700/80 dark:text-amber-300/90">Lab Tests</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{labTestCount}</div>
          <div className="text-sm text-amber-700/70 dark:text-amber-300/80">Available lab tests</div>
        </div>

        <div className="bg-linear-to-br from-violet-50 to-white dark:from-violet-900/15 dark:to-dark-bg-secondary rounded-xl shadow-md border border-violet-100 dark:border-dark-border p-4">
          <div className="text-xs text-violet-700/80 dark:text-violet-300/90">Doctors</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{doctorsCount}</div>
          <div className="text-sm text-violet-700/70 dark:text-violet-300/80">Associated doctors</div>
        </div>
      </div>

    </div>
  );
};

export default HospitalDashboard;
