import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useHospitalController } from '../../hooks/hospital';
import { useAppointmentController } from '../../hooks/appointment';
import { useHospitalStaffController } from '../../hooks/hospitalStaff';
import useLabTestController from '../../hooks/labTest/useLabTestController.instance';
import { useDoctorController } from '../../hooks/doctor';
import Alert from '../../components/Alert';
import TextInput from '../../components/TextInput';

const HospitalDashboard: React.FC = () => {
  const { hospitals, error: hospitalsError, updateHospital, success: hospitalSuccess, clearMessages: clearHospitalMessages } = useHospitalController();
  const appointmentCtrl = useAppointmentController();
  const hospitalStaffCtrl = useHospitalStaffController();
  const labTestCtrl = useLabTestController();
  const doctorCtrl = useDoctorController();

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState<string>('');
  const [localAddress, setLocalAddress] = useState<string>('');
  // const [localSaveMsg, setLocalSaveMsg] = useState<string | null>(null);

  // Pick primary hospital (first in list) — adapt later for multi-hospital flows
  const hospital = hospitals && hospitals.length > 0 ? hospitals[0] : null;

  useEffect(() => {
    if (hospital) setFormName(hospital.name || '');
  }, [hospital]);

  // Load local address from localStorage (backend doesn't currently expose address)
  useEffect(() => {
    if (!hospital) return;
    try {
      const key = `hospital_address_${hospital.hospital_id}`;
      const saved = localStorage.getItem(key) || '';
      setLocalAddress(saved);
    } catch (e) {
      setLocalAddress('');
    }
  }, [hospital]);

  // Fetch related stats
  useEffect(() => {
    appointmentCtrl.fetchForHospital();
    hospitalStaffCtrl.fetchHospitalStaff();
    labTestCtrl.fetchAllLabTests();
    // ensure doctors are loaded
    doctorCtrl.fetchForAppointmentBooking();
  }, [appointmentCtrl, hospitalStaffCtrl, labTestCtrl, doctorCtrl]);

  const handleSave = useCallback(async () => {
    if (!hospital) return;
    const updated = await updateHospital(hospital.hospital_id, formName);
    if (updated) {
      setIsEditing(false);
    }
  }, [hospital, formName, updateHospital]);

  const handleCancel = useCallback(() => {
    if (hospital) setFormName(hospital.name || '');
    setIsEditing(false);
    clearHospitalMessages();
    // setLocalSaveMsg(null);
  }, [hospital, clearHospitalMessages]);

  // const handleSaveAddress = useCallback(() => {
  //   if (!hospital) return;
  //   const key = `hospital_address_${hospital.hospital_id}`;
  //   try {
  //     localStorage.setItem(key, localAddress || '');
  //     setLocalSaveMsg('Address saved locally');
  //     setTimeout(() => setLocalSaveMsg(null), 2500);
  //   } catch (e) {
  //     setLocalSaveMsg('Failed to save address locally');
  //   }
  // }, [hospital, localAddress]);

  const navbarConfig = useMemo(() => ({
    title: 'Hospital Dashboard',
    actions: isEditing
      ? [
          { label: 'Cancel', onClick: handleCancel, variant: 'ghost' as const },
          { label: 'Save', onClick: handleSave, variant: 'primary' as const },
        ]
      : [{ label: 'Edit', onClick: () => setIsEditing(true), variant: 'primary' as const }],
  }), [isEditing, handleCancel, handleSave]);

  useNavbarController(navbarConfig);

  // Derived stats
  const appointmentCount = appointmentCtrl.hospitalAppointments.length;
  const upcomingCount = appointmentCtrl.hospitalAppointments.filter(a => {
    try { return new Date(a.date).toDateString() === new Date().toDateString(); } catch { return false; }
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
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-6">
        <h2 className="text-xl font-semibold mb-2">Hospital Information</h2>
        {!hospital && (
          <p className="text-gray-500">No hospital found. Create or assign a hospital first.</p>
        )}

        {hospital && (
          <div className="space-y-4">
            <TextInput
              label="Name"
              value={formName}
              onChange={(e: any) => setFormName(e.target.value)}
              disabled={!isEditing}
              required
            />

            {/* <TextInput
              label="Address"
              multiline
              rows={3}
              value={localAddress}
              onChange={(e: any) => setLocalAddress(e.target.value)}
              helperText="Address is stored locally until backend support is added"
            />
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost" onClick={handleSaveAddress}>Save Address</button>
              {localSaveMsg && <span className="text-sm text-gray-600">{localSaveMsg}</span>}
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextInput label="Hospital ID" value={String(hospital.hospital_id)} disabled />
              <TextInput label="Created At" value={new Date(hospital.created_at).toLocaleString()} disabled />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-4">
          <div className="text-xs text-gray-500">Appointments</div>
          <div className="text-2xl font-bold">{appointmentCount}</div>
          <div className="text-sm text-gray-500">Today: {upcomingCount}</div>
        </div>

        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-4">
          <div className="text-xs text-gray-500">Staff</div>
          <div className="text-2xl font-bold">{staffCount}</div>
          <div className="text-sm text-gray-500">Active staff</div>
        </div>

        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-4">
          <div className="text-xs text-gray-500">Lab Tests</div>
          <div className="text-2xl font-bold">{labTestCount}</div>
          <div className="text-sm text-gray-500">Available lab tests</div>
        </div>

        <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-4">
          <div className="text-xs text-gray-500">Doctors</div>
          <div className="text-2xl font-bold">{doctorsCount}</div>
          <div className="text-sm text-gray-500">Associated doctors</div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
