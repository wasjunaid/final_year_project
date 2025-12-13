import React, { useEffect, useMemo, useState } from 'react';
import TextInput from '../../components/TextInput';
import Alert from '../../components/Alert';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import { Badge } from '../../components/TableHelpers';
import { useAppointmentController } from '../../hooks/appointment';
import { useDoctorController } from '../../hooks/doctor';
import { useAuthController } from '../../hooks/auth';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { ROLES } from '../../constants/profile';
import type { AppointmentModel } from '../../models/appointment/model';
import { AppointmentStatus } from '../../models/appointment/enums';

const AppointmentsDetailsPage: React.FC = () => {
  const appointmentCtrl = useAppointmentController();
  const { role } = useAuthController();
  const { selectedAppointmentId } = useSidebarController();

  const appointment = useMemo(() => {
    if (!selectedAppointmentId) return null;
    return appointmentCtrl.appointments.find((a) => a.appointmentId === selectedAppointmentId) ?? null;
  }, [selectedAppointmentId, appointmentCtrl.appointments]);

  const [local, setLocal] = useState<AppointmentModel | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const { doctors: controllerDoctors, fetchForAppointmentBooking } = useDoctorController();

  // new state for patient reschedule reason (visible when patient rescheduling)
  const [rescheduleReason, setRescheduleReason] = useState<string>('');

  useEffect(() => {
    if (appointment) {
      setLocal((prev) => {
        const buildDoctorName = () => {
          if ((appointment as any).doctorName) return (appointment as any).doctorName;
          const df = `${(appointment as any).doctor_first_name ?? ''}`.trim();
          const dl = `${(appointment as any).doctor_last_name ?? ''}`.trim();
          const combined = `${df} ${dl}`.trim();
          return combined || undefined;
        };

        const buildDoctorId = () => {
          return (appointment as any).doctorId ?? (appointment as any).doctor_id ?? (appointment as any).doctor ?? undefined;
        };

        const buildPatientName = () => {
          return appointment.patientName ?? (appointment as any).patient_full_name ?? undefined;
        };

        const buildHospitalName = () => {
          return appointment.hospitalName ?? (appointment as any).hospital_name ?? undefined;
        };

        const buildHospitalId = () => {
          return (appointment as any).hospitalId ?? (appointment as any).hospital_id ?? (appointment as any).hospital ?? undefined;
        };

        if (!prev) return { ...appointment, patientName: buildPatientName(), doctorName: buildDoctorName(), hospitalName: buildHospitalName(), doctorId: buildDoctorId(), hospitalId: buildHospitalId() } as AppointmentModel;
        return {
          ...prev,
          ...appointment,
          patientName: buildPatientName() ?? prev.patientName,
          doctorName: buildDoctorName() ?? prev.doctorName,
          hospitalName: buildHospitalName() ?? prev.hospitalName,
          doctorId: buildDoctorId() ?? prev.doctorId,
          hospitalId: buildHospitalId() ?? prev.hospitalId,
        };
      });
    } else {
      setLocal(null);
    }
  }, [appointment]);

  // Ensure doctors are fetched so front-desk dropdown has options
  useEffect(() => {
    let mounted = true;
    const loadDoctors = async () => {
      try {
        await fetchForAppointmentBooking?.();
      } catch (e) {
        // ignore
      }
    };
    if (mounted) loadDoctors();
    return () => { mounted = false; };
  }, [fetchForAppointmentBooking, selectedAppointmentId]);

  // derive doctor options (filter by hospital when available)
  const doctorOptions = (controllerDoctors || []).filter((d: any) => {
    if (!local) return true;
    const hid = String(d.hospitalId ?? d.hospital_id ?? '');
    const lh = String(local.hospitalId ?? '');
    if (lh && hid !== lh) return false;
    return true;
  }).map((d: any) => ({ value: String(d.id ?? d.doctor_id ?? ''), label: d.fullName || `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() }));

  // Ensure local.doctorName is filled using controllerDoctors when missing
  useEffect(() => {
    if (!local) return;
    if (local.doctorName && String(local.doctorName).trim() !== '') return;
    const did = String(local.doctorId ?? '');
    if (!did) return;
    const found = (controllerDoctors || []).find((d: any) => String(d.id ?? d.doctor_id ?? '') === did);
    if (found) {
      updateLocalField({ doctorName: found.fullName || `${found.firstName ?? ''} ${found.lastName ?? ''}`.trim() });
    }
  }, [controllerDoctors, local]);

  const isPatient = role === ROLES.PATIENT;
  const isDoctor = role === ROLES.DOCTOR;
  const isFrontDesk =
    role === ROLES.HOSPITAL_FRONT_DESK || role === ROLES.HOSPITAL_SUB_ADMIN || role === ROLES.HOSPITAL_ADMIN;

  useEffect(() => {
    let mounted = true;
    const tryFetch = async () => {
      if (!selectedAppointmentId) return;
      if (appointment) return;
      try {
        if (isPatient) await appointmentCtrl.fetchForPatient?.();
        else if (isDoctor) await appointmentCtrl.fetchForDoctor?.();
        else await appointmentCtrl.fetchForHospital?.();
        // also fetch doctors for dropdown when needed
        try {
          await fetchForAppointmentBooking?.();
        } catch (e) {
          // ignore
        }
      } catch (err) {
        if (!mounted) return;
      }
    };
    tryFetch();
    return () => {
      mounted = false;
    };
  }, [selectedAppointmentId, appointment, isPatient, isDoctor, appointmentCtrl]);

  if (!selectedAppointmentId) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">No appointment selected</h2>
        <p className="text-sm text-gray-600">Select an appointment from the list to see details.</p>
      </div>
    );
  }

  if (!local) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Loading...</h2>
      </div>
    );
  }

  const writeableByFrontdesk = local.status === AppointmentStatus.processing && isFrontDesk;
  const canStart = local.status === AppointmentStatus.upcoming && isDoctor;
  const canCancel = local.status === AppointmentStatus.upcoming && (isPatient || isDoctor || isFrontDesk);
  const canReschedule = local.status === AppointmentStatus.upcoming && (isPatient || isDoctor || isFrontDesk);
  const doctorCanComplete = local.status === AppointmentStatus.in_progress && isDoctor;

  const updateLocalField = (patch: Partial<AppointmentModel>) => {
    setLocal((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  // detect if front-desk user made any changes compared to original appointment
  const appointmentDoctorId = (appointment as any)?.doctorId ?? (appointment as any)?.doctor_id ?? (appointment as any)?.doctor ?? undefined;
  const hasChanges = !!(appointment && local && (
    String(local.doctorId ?? '') !== String(appointmentDoctorId ?? '') ||
    String(local.date ?? '') !== String(appointment.date ?? '') ||
    String(local.time ?? '') !== String(appointment.time ?? '') ||
    (local.appointmentCost ?? '') !== (appointment.appointmentCost ?? '')
  ));

  // const handleSaveChanges = async () => {
  //   if (!local) return;

  //   if (!local.doctorId) {
  //     alert('Doctor ID is required');
  //     return;
  //   }
  //   if (!local.date) {
  //     alert('Date is required');
  //     return;
  //   }
  //   if (!local.time) {
  //     alert('Time is required');
  //     return;
  //   }

  //   setSaving(true);
  //   try {
  //     const payload: any = {
  //       doctor_id: local.doctorId,
  //       date: local.date,
  //       time: local.time,
  //     };

  //     const updated = await appointmentCtrl.rescheduleForHospital(local.appointmentId, payload);
  //     setLocal((prev) => ({
  //       ...prev!,
  //       ...updated,
  //       patientName: updated.patientName || prev?.patientName,
  //       doctorName: updated.doctorName || prev?.doctorName,
  //       hospitalName: updated.hospitalName || prev?.hospitalName,
  //     }));
  //     alert('Changes saved successfully');
  //   } catch (err: any) {
  //     alert(err?.message || 'Failed to save changes');
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleApprove = async () => {
    if (!local) return;
    setSaving(true);
    try {
      const payload: any = { appointment_cost: local.appointmentCost };
      if (local.date) payload.date = local.date;
      if (local.time) payload.time = local.time;
      if (local.doctorId) payload.doctor_id = local.doctorId;
      const updated = await appointmentCtrl.approve(local.appointmentId, payload);
      setLocal((prev) => ({
        ...prev!,
        ...updated,
        patientName: updated.patientName || prev?.patientName,
        doctorName: updated.doctorName || prev?.doctorName,
        hospitalName: updated.hospitalName || prev?.hospitalName,
      }));
    } catch (err: any) {
      alert(err?.message || 'Failed to approve');
    } finally {
      setSaving(false);
    }
  };

  const handleDeny = async () => {
    if (!local) return;
    if (!confirm('Are you sure you want to deny this appointment?')) return;
    setSaving(true);
    try {
      const updated = await appointmentCtrl.deny(local.appointmentId);
      setLocal((prev) => ({
        ...prev!,
        ...updated,
        patientName: updated.patientName || prev?.patientName,
        doctorName: updated.doctorName || prev?.doctorName,
        hospitalName: updated.hospitalName || prev?.hospitalName,
      }));
    } catch (err: any) {
      alert(err?.message || 'Failed to deny');
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async () => {
    if (!local) return;
    setSaving(true);
    try {
      const updated = await appointmentCtrl.start(local.appointmentId);
      setLocal((prev) => ({
        ...prev!,
        ...updated,
        patientName: updated.patientName || prev?.patientName,
        doctorName: updated.doctorName || prev?.doctorName,
        hospitalName: updated.hospitalName || prev?.hospitalName,
      }));
    } catch (err: any) {
      alert(err?.message || 'Failed to start appointment');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!local) return;
    if (!confirm('Confirm cancel appointment?')) return;
    setSaving(true);
    try {
      await appointmentCtrl.cancel(local.appointmentId);
      setLocal((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel');
    } finally {
      setSaving(false);
    }
  };

  // Updated: read date/time from existing inputs and use rescheduleReason state (for patients)
  const handleReschedule = async () => {
    if (!local) return;

    // Read values from local state (these are updated by TextInput fields)
    const newDate = local.date ?? '';
    const newTime = local.time ?? '';

    if (!newDate) {
      alert('Date is required for rescheduling');
      return;
    }
    if (!newTime) {
      alert('Time is required for rescheduling');
      return;
    }

    // If patient, ensure reason is provided (from the new input shown below)
    if (isPatient) {
      if (!rescheduleReason || rescheduleReason.trim().length === 0) {
        alert('Reason is required for rescheduling');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        doctor_id: local.doctorId,
        date: newDate,
        time: newTime.length === 5 ? `${newTime}:00` : newTime,
      };

      if (isPatient) {
        payload.reason = rescheduleReason.trim();
      }

      const updated = isPatient
        ? await appointmentCtrl.rescheduleForPatient(local.appointmentId, payload)
        : await appointmentCtrl.rescheduleForHospital(local.appointmentId, payload);

      setLocal((prev) => ({
        ...prev!,
        ...updated,
        patientName: updated.patientName || prev?.patientName,
        doctorName: updated.doctorName || prev?.doctorName,
        hospitalName: updated.hospitalName || prev?.hospitalName,
      }));

      // Clear reason after success for patient so the input resets
      if (isPatient) setRescheduleReason('');

      // show success message instead of alert
      setSuccessMessage('Appointment rescheduled successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to reschedule');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDoctorNote = async () => {
    if (!local) return;
    setSaving(true);
    try {
      const updated = await appointmentCtrl.completeDoctor(local.appointmentId, { doctor_note: local.notes ?? '' });
      setLocal((prev) => ({
        ...prev!,
        ...updated,
        patientName: updated.patientName || prev?.patientName,
        doctorName: updated.doctorName || prev?.doctorName,
        hospitalName: updated.hospitalName || prev?.hospitalName,
      }));
    } catch (err: any) {
      alert(err?.message || 'Failed to save doctor note');
    } finally {
      setSaving(false);
    }
  };

	// const { setActiveTab } = useNavbarController();
  // TODO: Add a back button or implement stack logic in navcontroller to come back to prevous page

  return (
    <div className="grid grid-cols-12 gap-4">
      {successMessage && (
        <div className="col-span-12">
          <Alert type="success" title="Success" message={successMessage} />
        </div>
      )}
      {/* Left: main card */}
      <div className="col-span-8">
        <div className="bg-white dark:bg-[#2b2b2b] p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
						<div className='flex items-center gap-2'>
							{/* <Button variant='secondary' icon={ArrowBigLeftIcon} onClick={() => setActiveTab("appointments")} /> */}
            	<h2 className="text-xl font-semibold">Appointment #{local.appointmentId}</h2>
						</div>
            <Badge variant={local.status === 'completed' ? 'success' : local.status === 'processing' ? 'warning' : 'info'}>
              {local.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!isPatient && (<TextInput label="Patient" value={local.patientName ?? ''} disabled />)}
            
            {!isFrontDesk && (<TextInput label="Hospital" value={local.hospitalName ?? ''} disabled />)}
            
            {!isDoctor && (
              writeableByFrontdesk ? (
                <Dropdown
                  label="Doctor"
                  options={doctorOptions}
                  value={String(local.doctorId ?? '')}
                  onChange={(v) => {
                    const selected = (controllerDoctors || []).find((d: any) => String(d.id ?? d.doctor_id) === String(v));
                    updateLocalField({ doctorId: v ? Number(v) : undefined, doctorName: selected ? (selected.fullName) : local?.doctorName });
                  }}
                  searchable
                />
              ) : (
                <TextInput
                  label="Doctor"
                  value={String(local.doctorName ?? '')}
                  disabled
                />
              )
            )}
          </div>

          {/* If patient can reschedule, show reason input here instead of prompt */}
          {isPatient && canReschedule && (
            <div className="mt-4">
              <TextInput
                label="Reschedule Reason (required)"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                multiline
                rows={3}
              />
            </div>
          )}

          <div className="mt-6">
            <TextInput
              label="Notes"
              multiline
              rows={6}
              value={local.notes ?? ''}
              onChange={(e) => updateLocalField({ notes: e.target.value })}
              disabled={!doctorCanComplete && !isDoctor}
            />
          </div>
        </div>
      </div>

      {/* Right: side cards */}
      <div className="col-span-4">
        <div className="bg-white dark:bg-[#2b2b2b] p-4 rounded-lg shadow flex flex-col gap-4">
          <div>
            <h3 className="font-semibold">Appointment Info</h3>
            <p className="text-sm text-gray-500">Cost, date & time (editable when permitted)</p>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 gap-3">
            <TextInput
              label="Appointment Cost"
              type="number"
              value={local.appointmentCost ?? ''}
              onChange={(e) => updateLocalField({ appointmentCost: e.target.value === '' ? null : Number(e.target.value) })}
              disabled={!writeableByFrontdesk}
            />

            <TextInput
              label="Date"
              type="date"
              value={local.date ?? ''}
              onChange={(e) => updateLocalField({ date: e.target.value })}
              disabled={!writeableByFrontdesk && !canReschedule}
            />

            <TextInput
              label="Time"
              type="time"
              value={local.time ?? ''}
              onChange={(e) => updateLocalField({ time: e.target.value })}
              disabled={!writeableByFrontdesk && !canReschedule}
            />
          </div>

          {/* (Reset moved to Quick Actions) */}

          {/* If user can reschedule (patient/doctor) and not frontdesk, show hint that they can edit here */}
          {!writeableByFrontdesk && canReschedule && (
            <div className="text-sm text-gray-600">
              You can edit date & time here and then press "Reschedule" in Quick Actions to submit.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#2b2b2b] p-4 mt-4 rounded-lg shadow flex flex-col gap-4">
          <div>
            <h3 className="font-semibold">Quick Actions</h3>
            <p className="text-sm text-gray-500">Actions available for your role & appointment status</p>
          </div>

          {/* Reset (Quick Actions) - visible during reschedule or when user made changes */}
          {((hasChanges && isFrontDesk) || (isPatient && canReschedule) || (isDoctor && canReschedule)) && (
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => {
                if (!appointment) return;
                setLocal({ ...appointment });
                // setSuccessMessage('Changes reset');
                // setTimeout(() => setSuccessMessage(''), 3000);
              }}>
                Reset
              </Button>
            </div>
          )}

          {/* Processing: frontdesk actions */}
          {local.status === 'processing' && isFrontDesk && (
            <div className="flex flex-col gap-2">
              {/* <Button onClick={handleSaveChanges} loading={saving}>
                Save Changes
              </Button> */}
              <Button variant="success" onClick={handleApprove} loading={saving}>
                Approve
              </Button>
              <Button variant="danger" onClick={handleDeny} loading={saving}>
                Deny
              </Button>
            </div>
          )}

          {/* Upcoming actions */}
          {local.status === 'upcoming' && (
            <div className="flex flex-col gap-2">
              {canStart && (
                <Button onClick={handleStart} loading={saving}>
                  Start Appointment
                </Button>
              )}
              {canReschedule && (
                <Button onClick={handleReschedule} loading={saving}>
                  Reschedule
                </Button>
              )}
              {canCancel && (
                <Button variant="danger" onClick={handleCancel} loading={saving}>
                  Cancel Appointment
                </Button>
              )}
            </div>
          )}

          {/* In progress: doctor actions */}
          {local.status === 'in progress' && (
            <div className="flex flex-col gap-2">
              {isDoctor && (
                <>
                  <Button onClick={handleSaveDoctorNote} loading={saving}>
                    Save & Complete
                  </Button>
                  <Button onClick={handleStart} loading={saving}>
                    Refresh State
                  </Button>
                </>
              )}
              {!isDoctor && <div className="text-sm text-gray-600">Appointment is in progress. Only the doctor can add notes and complete it.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsDetailsPage;
