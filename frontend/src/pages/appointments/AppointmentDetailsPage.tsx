import React, { useEffect, useMemo, useState } from 'react';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Badge } from '../../components/TableHelpers';
import { useAppointmentController } from '../../hooks/appointment';
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

  // new state for patient reschedule reason (visible when patient rescheduling)
  const [rescheduleReason, setRescheduleReason] = useState<string>('');

  useEffect(() => {
    if (appointment) {
      setLocal((prev) => {
        if (!prev) return { ...appointment };
        return {
          ...prev,
          ...appointment,
          patientName: appointment.patientName || prev.patientName,
          doctorName: appointment.doctorName || prev.doctorName,
          hospitalName: appointment.hospitalName || prev.hospitalName,
        };
      });
    } else {
      setLocal(null);
    }
  }, [appointment]);

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

      alert('Appointment rescheduled successfully');
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
            <TextInput label="Patient" value={local.patientName ?? ''} disabled />
            <TextInput label="Hospital" value={local.hospitalName ?? ''} disabled />
            <TextInput
              label="Doctor"
              value={String(local.doctorName ?? '')}
              onChange={(e) => updateLocalField({ doctorName: e.target.value })}
              disabled={!writeableByFrontdesk}
            />
            <TextInput
              label="Appointment Cost"
              type="number"
              value={local.appointmentCost ?? ''}
              onChange={(e) => updateLocalField({ appointmentCost: e.target.value === '' ? null : Number(e.target.value) })}
              disabled={!writeableByFrontdesk}
            />
            <TextInput
              label="Date"
              value={local.date ?? ''}
              onChange={(e) => updateLocalField({ date: e.target.value })}
              disabled={!writeableByFrontdesk && !canReschedule}
            />
            <TextInput
              label="Time"
              value={local.time ?? ''}
              onChange={(e) => updateLocalField({ time: e.target.value })}
              disabled={!writeableByFrontdesk && !canReschedule}
            />
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
              label="Doctor Note"
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

          {/* Save changes for frontdesk (non-approval save) */}
          {writeableByFrontdesk && (
            <div className="flex items-center gap-2">
              <Button
                onClick={async () => {
                  if (!local) return;
                  if (!local.doctorId) {
                    alert('Doctor ID is required');
                    return;
                  }
                  if (!local.date) {
                    alert('Date is required');
                    return;
                  }
                  if (!local.time) {
                    alert('Time is required');
                    return;
                  }

                  setSaving(true);
                  try {
                    const payload: any = {
                      doctor_id: local.doctorId,
                      date: local.date,
                      time: local.time.length === 5 ? `${local.time}:00` : local.time,
                    };
                    if (local.appointmentCost != null) payload.appointment_cost = local.appointmentCost;

                    const updated = await appointmentCtrl.rescheduleForHospital(local.appointmentId, payload);
                    setLocal((prev) => ({
                      ...prev!,
                      ...updated,
                      patientName: updated.patientName || prev?.patientName,
                      doctorName: updated.doctorName || prev?.doctorName,
                      hospitalName: updated.hospitalName || prev?.hospitalName,
                    }));
                    alert('Changes saved successfully');
                  } catch (err: any) {
                    alert(err?.message || 'Failed to save changes');
                  } finally {
                    setSaving(false);
                  }
                }}
                loading={saving}
              >
                Save Changes
              </Button>

              <Button variant="ghost" onClick={() => {
                // revert local edits by reloading appointment from appointment list (if available)
                if (!appointment) return;
                setLocal({ ...appointment });
              }}>
                Revert
              </Button>
            </div>
          )}

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
