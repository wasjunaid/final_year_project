import React, { useEffect, useState } from 'react';
import Dropdown from '../../components/Dropdown';
import TextInput from '../../components/TextInput';
import { PrimaryButton } from '../../components/Button';
import Alert from '../../components/Alert';
import { useAuthController } from '../../hooks/auth';
import { ROLES } from '../../constants/profile';
import { useHospitalController } from '../../hooks/hospital/useHospitalController';
import { useDoctorController } from '../../hooks/doctor';
import { useAppointmentController } from '../../hooks/appointment';
import type { AssociatedDoctorModel } from '../../models/associatedStaff/doctors/model';
import { useNavbarController } from '../../hooks/ui/navbar';
import { usePatientProfileController } from '../../hooks/profile';
import type { CreateAppointmentPayload } from '../../models/appointment/payload';

const CreateAppointmentPage: React.FC = () => {
  const { role } = useAuthController();
  if (role !== ROLES.PATIENT) return <Alert type="error" title="Access Forbidden" message="This page is not accessible by current role" />;

  const { hospitals, error: hospitalsError } = useHospitalController();
  const { createAppointment, loading: creating, error: createError, success: createSuccess } = useAppointmentController();
  const { profile } = usePatientProfileController();

  useNavbarController();

  const [hospitalId, setHospitalId] = useState<string>('');
  const { doctors: controllerDoctors, fetchForAppointmentBooking } = useDoctorController();
  const [doctorId, setDoctorId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');

  // Load doctors for selected hospital
  useEffect(() => {
    let mounted = true;
    const loadDoctors = async () => {
      if (!hospitalId) {
        // controllerDoctors will be empty if not fetched yet or hospital not selected
        setDoctorId('');
        return;
      }

      try {
        const allDoctors = await fetchForAppointmentBooking();
        if (!mounted) return;
        const filtered = (allDoctors || []).filter((d: AssociatedDoctorModel) => String(d.hospitalId) === String(hospitalId));

        // Debugging: if no doctors after filtering but API returned doctors, log for inspection and fallback
        if (filtered.length === 0 && (allDoctors || []).length > 0) {
          console.warn('[CreateAppointmentPage] No doctors matched selected hospitalId.', { hospitalId, allDoctors });
          // Fallback for debugging/UX: show first doctor so user can still pick one (remove in production)
          const all = allDoctors || [];
          if (all.length > 0) setDoctorId(String(all[0].id));
        } else {
          if (filtered.length > 0) setDoctorId(String(filtered[0].id));
          else setDoctorId('');
        }
      } catch (err: any) {
        console.error('Failed to load doctors for hospital', err);
      }
    };

    loadDoctors();
    return () => { mounted = false; };
  }, [hospitalId, fetchForAppointmentBooking]);

  const hospitalOptions = hospitals.map((h: any) => ({ value: String(h.hospital_id ?? h.id ?? h.hospitalId), label: h.name ?? h.hospital_name ?? `Hospital ${h.hospital_id ?? h.id ?? h.hospitalId}` }));
  const doctorOptions = (controllerDoctors || []).map((d) => ({ value: String(d.id), label: d.fullName || d.firstName || `${(d as any).firstName} ${(d as any).lastName ?? ''}` }));

  const handleSubmit = async () => {
    setLocalError('');
    if (!hospitalId) return setLocalError('Please select a hospital');
    if (!doctorId) return setLocalError('Please select a doctor');
    if (!date) return setLocalError('Please select a date');
    if (!time) return setLocalError('Please select a time');

    const patientIdRaw = profile && (profile as any).patientId ? (profile as any).patientId : (profile as any)?.personId;
    if (!patientIdRaw) return setLocalError('Patient profile not loaded. Please refresh or complete your profile.');

    // backend expects separate `date` and `time` fields and `hospital_id` + `reason`
    const payload: CreateAppointmentPayload = {
      patient_id: Number(patientIdRaw),
      doctor_id: Number(doctorId),
      hospital_id: Number(hospitalId),
      date,
      time,
      reason: notes || null,
    };

    try {
      await createAppointment(payload);
      // success handled by controller state
    } catch (err) {
      // controller already sets error; nothing additional needed
    }
  };

  return (
    <div className="p-4 max-w-3xl">
      {hospitalsError && <Alert type="error" title="Hospitals" message={hospitalsError} className="mb-3" />}
      {createError && <Alert type="error" title="Create" message={createError} className="mb-3" />}
      {createSuccess && <Alert type="success" title="Create" message={createSuccess} className="mb-3" />}
      {localError && <Alert type="error" title="Validation" message={localError} className="mb-3" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown label="Hospital" options={hospitalOptions} value={hospitalId} onChange={(v) => setHospitalId(v)} searchable />
        <div />
        
        <Dropdown label="Doctor" options={doctorOptions} value={doctorId} onChange={(v) => setDoctorId(v)} searchable />
        <div />

        <TextInput
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate((e.target as HTMLInputElement).value)}
        />

        <TextInput
          label="Time"
          type="time"
          value={time}
          onChange={(e) => setTime((e.target as HTMLInputElement).value)}
        />

        <div className="md:col-span-2">
          <TextInput
            label="Notes"
            value={notes}
            onChange={(e) => setNotes((e.target as HTMLInputElement).value)}
            multiline
            placeholder='Example: Persistent headaches and dizziness for 3 days. Prefer morning appointments.'
          />
        </div>
      </div>

      <div className="mt-4">
        <PrimaryButton onClick={handleSubmit} loading={creating}>Create Appointment Request</PrimaryButton>
      </div>
    </div>
  );
};

export default CreateAppointmentPage;
