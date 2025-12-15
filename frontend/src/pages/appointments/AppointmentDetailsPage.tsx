import React, { useEffect, useMemo, useState, useRef } from 'react';
import TextInput from '../../components/TextInput';
import Alert from '../../components/Alert';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import { Badge } from '../../components/TableHelpers';
import { useAppointmentController } from '../../hooks/appointment';
import { useDoctorController } from '../../hooks/doctor';
import { useLabTestController } from '../../hooks/labTest';
import { useDocumentController } from '../../hooks/document';
import type { LabTest } from '../../models/labTest/model';
import { useAuthController } from '../../hooks/auth';
import { useSidebarController } from '../../hooks/ui/sidebar';
import { ROLES } from '../../constants/profile';
import type { AppointmentModel } from '../../models/appointment/model';
import useAppointmentCodingController from '../../hooks/medicalCoding/useAppointmentCodingController';
// import { DocumentModel } from '../../models/document';
// import { AllDocumentsList } from '../documents/components/AllDocumentsList';
// import { DocumentDetailsView } from '../documents/components/DocumentDetailsView';
import { AppointmentStatus } from '../../models/appointment/enums';
import type { CompleteDoctorPayload } from '../../models/appointment/payload';
import TabbedCard from './components/TabbedComponent';
import { useMedicalHistoryController, useAllergyController, useFamilyHistoryController, useSurgicalHistoryController } from '../../hooks/patient';

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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { doctors: controllerDoctors, fetchForAppointmentBooking } = useDoctorController();
  const [rescheduleReason, setRescheduleReason] = useState('');
  const { labTests } = useLabTestController();
  const documentCtrl = useDocumentController();
  const codingCtrl = useAppointmentCodingController();
  const [selectedLabTestId, setSelectedLabTestId] = useState<string>('');
  const [localLabTests, setLocalLabTests] = useState<LabTest[]>([]);
  // const [selectedDocument, setSelectedDocument] = useState<DocumentModel | null>(null);
  // const [showPlaceholdersPanel, setShowPlaceholdersPanel] = useState(false);
  const [activeUploadFor, setActiveUploadFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Patient health history controllers
  const medicalHistoryCtrl = useMedicalHistoryController();
  const allergyCtrl = useAllergyController();
  const familyHistoryCtrl = useFamilyHistoryController();
  const surgicalHistoryCtrl = useSurgicalHistoryController();

  // Local state for adding new entries
  const [newMedicalHistory, setNewMedicalHistory] = useState({ condition_name: '', diagnosis_date: '' });
  const [newAllergy, setNewAllergy] = useState({ allergy_name: '' });
  const [newFamilyHistory, setNewFamilyHistory] = useState({ condition_name: '' });
  const [newSurgicalHistory, setNewSurgicalHistory] = useState({ surgery_name: '', surgery_date: '' });
  // Pending entries to be uploaded when appointment is completed
  const [pendingMedicalHistory, setPendingMedicalHistory] = useState<Array<{ condition_name: string; diagnosis_date?: string }>>([]);
  const [pendingAllergies, setPendingAllergies] = useState<Array<{ allergy_name: string }>>([]);
  const [pendingFamilyHistory, setPendingFamilyHistory] = useState<Array<{ condition_name: string }>>([]);
  const [pendingSurgicalHistory, setPendingSurgicalHistory] = useState<Array<{ surgery_name: string; surgery_date?: string }>>([]);

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

        if (!prev) return {
          ...appointment,
          patientName: buildPatientName(),
          doctorName: buildDoctorName(),
          hospitalName: buildHospitalName(),
          doctorId: buildDoctorId(),
          hospitalId: buildHospitalId()
        } as AppointmentModel;

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
    return () => {
      mounted = false;
    };
  }, [fetchForAppointmentBooking, selectedAppointmentId]);

  const doctorOptions = (controllerDoctors || []).filter((d: any) => {
    if (!local) return true;
    const hid = String(d.hospitalId ?? d.hospital_id ?? '');
    const lh = String(local.hospitalId ?? '');
    if (lh && hid !== lh) return false;
    return true;
  }).map((d: any) => ({
    value: String(d.id ?? d.doctor_id ?? ''),
    label: d.fullName || `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim()
  }));

  useEffect(() => {
    if (!local) return;
    if (local.doctorName && String(local.doctorName).trim() !== '') return;
    const did = String(local.doctorId ?? '');
    if (!did) return;
    const found = (controllerDoctors || []).find((d: any) => String(d.id ?? d.doctor_id ?? '') === did);
    if (found) {
      updateLocalField({
        doctorName: found.fullName || `${found.firstName ?? ''} ${found.lastName ?? ''}`.trim()
      });
    }
  }, [controllerDoctors, local]);

  useEffect(() => {
    if (!local) return;
    if (local.diagnosisList && Array.isArray(local.diagnosisList)) return;
    const dstr = local.diagnosis ?? '';
    const list = String(dstr)
      .split(',')
      .map((s) => String(s || '').trim())
      .filter((s) => s.length > 0);
    updateLocalField({ diagnosisList: list });
  }, [local]);

  const isPatient = role === ROLES.PATIENT;
  const isDoctor = role === ROLES.DOCTOR;
  const isFrontDesk = role === ROLES.HOSPITAL_FRONT_DESK || role === ROLES.HOSPITAL_SUB_ADMIN || role === ROLES.HOSPITAL_ADMIN;

  useEffect(() => {
    let mounted = true;
    const tryFetch = async () => {
      if (!selectedAppointmentId) return;
      if (appointment) return;
      try {
        if (isPatient) await appointmentCtrl.fetchForPatient?.();
        else if (isDoctor) await appointmentCtrl.fetchForDoctor?.();
        else await appointmentCtrl.fetchForHospital?.();
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

  // If this is the patient view, automatically fetch placeholders for this patient when the appointment is loaded
  useEffect(() => {
    if (!isPatient) return;
    if (!local) return;
    // fetch placeholders so patient can see them in the appointment view
    (async () => {
      try {
        await documentCtrl.fetchPlaceholdersForPatient();
      } catch (e) {
        // ignore errors here
      }
    })();
  }, [isPatient, local?.appointmentId]);

  // When appointment is completed, fetch ICD and CPT codes for display
  useEffect(() => {
    if (!local) return;
    const isCompleted = local.status === AppointmentStatus.completed || String(local.status).toLowerCase() === 'completed';
    if (!isCompleted) return;
    const id = Number(local.appointmentId);
    if (!id) return;
    (async () => {
      try {
        await codingCtrl.fetchCodesForAppointment(id);
      } catch (e) {
        // controller holds error state; ignore here
      }
    })();
  }, [local?.status, local?.appointmentId]);

  // Fetch patient health history when appointment is in progress and doctor is viewing
  useEffect(() => {
    if (!local) return;
    if (!isDoctor) return;
    const isInProgress = local.status === AppointmentStatus.in_progress || String(local.status).toLowerCase() === 'in progress';
    if (!isInProgress) return;
    const patientId = local.patientId;
    if (!patientId) return;
    
    (async () => {
      try {
        await Promise.all([
          medicalHistoryCtrl.fetchMedicalHistoryForDoctor(patientId),
          allergyCtrl.fetchAllergiesForDoctor(patientId),
          familyHistoryCtrl.fetchFamilyHistoryForDoctor(patientId),
          surgicalHistoryCtrl.fetchSurgicalHistoryForDoctor(patientId),
        ]);
      } catch (e) {
        // controllers hold error state; ignore here
      }
    })();
  }, [local?.status, local?.patientId, isDoctor]);

  if (!selectedAppointmentId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No appointment selected</h3>
          <p className="text-gray-600 dark:text-gray-400">Select an appointment from the list to see details.</p>
        </div>
      </div>
    );
  }

  if (!local) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const writeableByFrontdesk = local.status === AppointmentStatus.processing && isFrontDesk;
  const canStart = local.status === AppointmentStatus.upcoming && isDoctor;
  const canCancel = local.status === AppointmentStatus.upcoming && (isPatient);
  const canReschedule = local.status === AppointmentStatus.upcoming && (isPatient || isFrontDesk || isDoctor);
  const doctorCanComplete = local.status === AppointmentStatus.in_progress && isDoctor;

  const updateLocalField = (patch: Partial<AppointmentModel>) => {
    setLocal((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const appointmentDoctorId = (appointment as any)?.doctorId ?? (appointment as any)?.doctor_id ?? (appointment as any)?.doctor ?? undefined;

  const hasChanges = (() => {
    if (!appointment || !local) return false;
    const simpleChange = (
      String(local.doctorId ?? '') !== String(appointmentDoctorId ?? '') ||
      String(local.date ?? '') !== String(appointment.date ?? '') ||
      String(local.time ?? '') !== String(appointment.time ?? '') ||
      (local.appointmentCost ?? '') !== (appointment.appointmentCost ?? '')
    );

    const getAppointmentDiagnosis = () => {
      const a: any = appointment as any;
      if (a.diagnosis) return String(a.diagnosis ?? '').trim();
      if (Array.isArray(a.diagnosisList)) return (a.diagnosisList || []).join(', ').trim();
      return '';
    };

    const getLocalDiagnosis = () => {
      if (local.diagnosis) return String(local.diagnosis ?? '').trim();
      if (Array.isArray(local.diagnosisList)) return (local.diagnosisList || []).join(', ').trim();
      return '';
    };

    const clinicalChange = (
      String(local.notes ?? '').trim() !== String((appointment as any).notes ?? '').trim() ||
      String(local.historyOfPresentIllness ?? '').trim() !== String((appointment as any).historyOfPresentIllness ?? (appointment as any).history_of_present_illness ?? '').trim() ||
      String(local.reviewOfSystems ?? '').trim() !== String((appointment as any).reviewOfSystems ?? (appointment as any).review_of_systems ?? '').trim() ||
      String(local.physicalExam ?? '').trim() !== String((appointment as any).physicalExam ?? (appointment as any).physical_exam ?? '').trim() ||
      String(local.plan ?? '').trim() !== String((appointment as any).plan ?? '').trim() ||
      getLocalDiagnosis() !== getAppointmentDiagnosis()
    );

    return simpleChange || clinicalChange;
  })();

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
      setErrorMessage(err?.message || 'Failed to approve');
      setTimeout(() => setErrorMessage(''), 4000);
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
      setErrorMessage(err?.message || 'Failed to deny');
      setTimeout(() => setErrorMessage(''), 4000);
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
      setErrorMessage(err?.message || 'Failed to start appointment');
      setTimeout(() => setErrorMessage(''), 4000);
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
      setErrorMessage(err?.message || 'Failed to cancel');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleReschedule = async () => {
    if (!local) return;
    const newDate = local.date ?? '';
    const newTime = local.time ?? '';
    if (!newDate) {
      setErrorMessage('Date is required for rescheduling');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }
    if (!newTime) {
      setErrorMessage('Time is required for rescheduling');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }
    if (isPatient) {
      if (!rescheduleReason || rescheduleReason.trim().length === 0) {
        setErrorMessage('Reason is required for rescheduling');
        setTimeout(() => setErrorMessage(''), 4000);
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
      if (isPatient) setRescheduleReason('');
      setSuccessMessage('Appointment rescheduled successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reschedule');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDoctorNote = async () => {
    if (!local) return;
    setSaving(true);
    try {
      const diagnosisString = (local.diagnosisList && local.diagnosisList.length > 0) ? local.diagnosisList.join(', ') : (local.diagnosis ?? null);

      const payload: CompleteDoctorPayload = {
        doctor_note: local.notes ?? null,
        history_of_present_illness: local.historyOfPresentIllness ?? null,
        review_of_systems: local.reviewOfSystems ?? null,
        physical_exam: local.physicalExam ?? null,
        diagnosis: diagnosisString ?? null,
        plan: local.plan ?? null,
        lab_tests_ordered: (localLabTests || []).length > 0 ? true : false,
      };
      
      // If there are any pending patient history entries added during this appointment,
      // upload them first. If any upload fails, abort and do not complete the appointment.
      if ((pendingMedicalHistory || []).length > 0 || (pendingAllergies || []).length > 0 || (pendingFamilyHistory || []).length > 0 || (pendingSurgicalHistory || []).length > 0) {
        const uploadErrors: string[] = [];
        const patientId = local.patientId ?? undefined;

        // medical history
        for (const mh of pendingMedicalHistory) {
          try {
            await medicalHistoryCtrl.createMedicalHistoryForDoctor(patientId!, { condition_name: mh.condition_name, diagnosis_date: mh.diagnosis_date || undefined });
          } catch (err: any) {
            const msg = err?.message || String(err);
            uploadErrors.push(`Medical history '${mh.condition_name}': ${msg}`);
            console.error('Failed to upload medical history', mh, err);
          }
        }

        // allergies
        for (const al of pendingAllergies) {
          try {
            await allergyCtrl.createAllergyForDoctor(patientId!, { allergy_name: al.allergy_name });
          } catch (err: any) {
            const msg = err?.message || String(err);
            uploadErrors.push(`Allergy '${al.allergy_name}': ${msg}`);
            console.error('Failed to upload allergy', al, err);
          }
        }

        // family history
        for (const fh of pendingFamilyHistory) {
          try {
            await familyHistoryCtrl.createFamilyHistoryForDoctor(patientId!, { condition_name: fh.condition_name });
          } catch (err: any) {
            const msg = err?.message || String(err);
            uploadErrors.push(`Family history '${fh.condition_name}': ${msg}`);
            console.error('Failed to upload family history', fh, err);
          }
        }

        // surgical history (validate date not in future again)
        for (const sh of pendingSurgicalHistory) {
          try {
            if (sh.surgery_date) {
              const sd = new Date(sh.surgery_date);
              const today = new Date();
              sd.setHours(0,0,0,0);
              today.setHours(0,0,0,0);
              if (sd.getTime() > today.getTime()) {
                uploadErrors.push(`Surgery '${sh.surgery_name}': surgery_date cannot be in the future`);
                continue;
              }
            }
            await surgicalHistoryCtrl.createSurgicalHistoryForDoctor(patientId!, { surgery_name: sh.surgery_name, surgery_date: sh.surgery_date || undefined });
          } catch (err: any) {
            const msg = err?.message || String(err);
            uploadErrors.push(`Surgery '${sh.surgery_name}': ${msg}`);
            console.error('Failed to upload surgical history', sh, err);
          }
        }

        if (uploadErrors.length > 0) {
          setErrorMessage(`Failed to upload patient history: ${uploadErrors.join(' ; ')}`);
          setSaving(false);
          return; // abort completion
        }

        // clear pending arrays on success
        setPendingMedicalHistory([]);
        setPendingAllergies([]);
        setPendingFamilyHistory([]);
        setPendingSurgicalHistory([]);
      }

      // If there are selected lab tests, create placeholders first. If any placeholder creation fails,
      // abort and do not complete the appointment.
      if ((localLabTests || []).length > 0) {
        const placeholderErrors: string[] = [];
        const createdPlaceholders: any[] = [];
        const patientId = local.patientId ?? undefined;
        const appointmentId = local.appointmentId;

        for (const lt of localLabTests) {
          try {
            const payloadPlaceholder = {
              patient_id: patientId,
              appointment_id: appointmentId,
              lab_test_id: lt.labTestId,
              detail: `Placeholder for lab test: ${lt.name}`,
              document_type: 'lab test',
            };
            const ph = await documentCtrl.insertPlaceholderForLabTestDocument(payloadPlaceholder as any);
            createdPlaceholders.push(ph);
          } catch (err: any) {
            const msg = err?.message || String(err);
            placeholderErrors.push(`${lt.name}: ${msg}`);
            console.error('Failed to create placeholder for lab test', lt, err);
          }
        }

        if (placeholderErrors.length > 0) {
          const combined = `Failed to create placeholders: ${placeholderErrors.join(' ; ')}`;
          setErrorMessage(combined);
          setSaving(false);
          return; // abort completion
        }
      }

      // All placeholders created (or no lab tests). Now complete the appointment.
      const updated = await appointmentCtrl.completeDoctor(local.appointmentId, payload);
      setLocal((prev) => ({
        ...prev!,
        ...updated,
        patientName: updated.patientName || prev?.patientName,
        doctorName: updated.doctorName || prev?.doctorName,
        hospitalName: updated.hospitalName || prev?.hospitalName,
      }));
      // After completion, load patient placeholders so the UI shows any lab-test placeholders
      try {
        await documentCtrl.fetchPlaceholdersForPatient();
      } catch (e) {
        // ignore fetch errors here but surface via controller state if needed
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save doctor note');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Build tabs for clinical details
  const clinicalTabs = [
    // {
    //   id: 'history',
    //   label: 'History',
    //   content: (
    //     <div className="space-y-4">
    //       <TextInput
    //         label="History of Present Illness"
    //         value={local.historyOfPresentIllness ?? ''}
    //         onChange={(e) => updateLocalField({ historyOfPresentIllness: e.target.value })}
    //         multiline
    //         rows={4}
    //         disabled={!doctorCanComplete}
    //       />
    //     </div>
    //   )
    // },
    {
      id: 'doctor-notes',
      label: 'Doctor Notes',
      content: (
        <div className="space-y-4">
          <TextInput
            label="History of Present Illness"
            value={local.historyOfPresentIllness ?? ''}
            onChange={(e) => updateLocalField({ historyOfPresentIllness: e.target.value })}
            multiline
            rows={4}
            disabled={!doctorCanComplete}
          />
          <TextInput
            label="Review of Systems"
            value={local.reviewOfSystems ?? ''}
            onChange={(e) => updateLocalField({ reviewOfSystems: e.target.value })}
            multiline
            rows={4}
            disabled={!doctorCanComplete}
          />
          <TextInput
            label="Physical Exam"
            value={local.physicalExam ?? ''}
            onChange={(e) => updateLocalField({ physicalExam: e.target.value })}
            multiline
            rows={4}
            disabled={!doctorCanComplete}
          />
          <TextInput
            label="Plan"
            value={local.plan ?? ''}
            onChange={(e) => updateLocalField({ plan: e.target.value })}
            multiline
            rows={4}
            disabled={!doctorCanComplete}
          />
        </div>
      )
    },
    {
      id: 'diagnoses',
      label: 'Diagnoses',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {(local.diagnosisList ?? []).map((d, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="flex-1">
                  <TextInput
                    label={`Diagnosis ${idx + 1}`}
                    value={d}
                    onChange={(e) => {
                      const list = [...(local.diagnosisList ?? [])];
                      list[idx] = e.target.value;
                      updateLocalField({ diagnosisList: list, diagnosis: list.join(', ') });
                    }}
                    placeholder="e.g. Hypertension"
                    disabled={!doctorCanComplete}
                  />
                </div>
                {doctorCanComplete && (
                  <div className="pt-7">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const list = (local.diagnosisList ?? []).filter((_, i) => i !== idx);
                        updateLocalField({ diagnosisList: list, diagnosis: list.join(', ') });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {((local.diagnosisList ?? []).length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No diagnoses added yet.</p>
            )}
          </div>
          {doctorCanComplete && (
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  const next = [...(local.diagnosisList ?? []), ''];
                  updateLocalField({ diagnosisList: next, diagnosis: next.join(', ') });
                }}
              >
                Add Diagnosis
              </Button>
            </div>
          )}
          {(local.status === AppointmentStatus.completed || local.doctorCompleted) && (
            <TextInput
              label="Completed At"
              value={(() => {
                const ts = local.doctorCompletedAt ?? local.updatedAt ?? '';
                try {
                  if (!ts) return '';
                  const dt = new Date(ts);
                  if (isNaN(dt.getTime())) return ts;
                  return dt.toLocaleString();
                } catch (e) {
                  return ts;
                }
              })()}
              disabled
            />
          )}
        </div>
      )
    },
    {
      id: 'lab-tests',
      label: 'Lab Tests',
      content: (
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Dropdown
                label="Add Lab Test"
                options={(labTests || []).map((lt) => ({ value: String(lt.labTestId), label: `${lt.name} ${lt.cost != null ? `— ${lt.cost}` : ''}` }))}
                value={selectedLabTestId}
                onChange={(v) => setSelectedLabTestId(v)}
                searchable
                searchPlaceholder="Search lab tests..."
                placeholder="Select a lab test"
              />
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  if (!selectedLabTestId) return;
                  const lt = (labTests || []).find((x) => String(x.labTestId) === String(selectedLabTestId));
                  if (!lt) return;
                  setLocalLabTests((prev) => (prev.find((p) => p.labTestId === lt.labTestId) ? prev : [...prev, lt]));
                  setSelectedLabTestId('');
                }}
                disabled={!doctorCanComplete || !selectedLabTestId}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {(localLabTests || []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No lab tests added yet.</p>
            ) : (
              (localLabTests || []).map((lt) => (
                <div key={lt.labTestId} className="flex items-start justify-between gap-3 bg-white/5 p-3 rounded">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{lt.name}</div>
                    <div className="text-sm text-gray-500">{lt.description ?? ''} {lt.cost != null ? `• Cost: ${lt.cost}` : ''}</div>
                  </div>
                  {doctorCanComplete && (
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => setLocalLabTests((prev) => prev.filter((p) => p.labTestId !== lt.labTestId))}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )
    }
    ,
    {
      id: 'codes',
      label: 'Codes',
      content: (
        <div className="space-y-4">
          {(() => {
            const isCompleted = local.status === AppointmentStatus.completed || String(local.status).toLowerCase() === 'completed';
            if (!isCompleted) return <p className="text-sm text-gray-500">Codes are available after the appointment is completed.</p>;

            if (codingCtrl.loading) return <div className="text-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div><p className="text-sm text-gray-500 mt-2">Loading codes...</p></div>;
            if (codingCtrl.error) return (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-red-600 dark:text-red-400 shrink-0">!</div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">Codes Unavailable</h3>
                    <p className="text-red-700 dark:text-red-400">{codingCtrl.error}</p>
                  </div>
                </div>
              </div>
            );

            const icds = codingCtrl.icdCodes || [];
            const cpts = codingCtrl.cptCodes || [];

            return (
              <div className="space-y-6">
                {/* ICD Codes */}
                <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">ICD-10 Diagnosis Codes</span>
                    <span className="ml-auto text-sm font-normal text-gray-600 dark:text-gray-400">{icds.length} found</span>
                  </h3>
                  {icds.length > 0 ? (
                    <div className="space-y-4">
                      {icds.map((code, idx) => (
                        <div key={String(idx)} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-mono font-semibold text-green-600 dark:text-green-400">{code.code}</span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium mb-2">{code.description || 'No description available'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Added: {(() => { try { const dt = new Date(code.createdAt ?? ''); return isNaN(dt.getTime()) ? (code.createdAt || '') : dt.toLocaleString(); } catch (e) { return code.createdAt || ''; } })()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">No ICD-10 codes found for this appointment.</p>
                  )}
                </div>

                {/* CPT Codes */}
                <div className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-600 dark:text-purple-400">CPT Procedure Codes</span>
                    <span className="ml-auto text-sm font-normal text-gray-600 dark:text-gray-400">{cpts.length} found</span>
                  </h3>
                  {cpts.length > 0 ? (
                    <div className="space-y-4">
                      {cpts.map((code, idx) => (
                        <div key={String(idx)} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">{code.code}</span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium mb-2">{code.description || 'No description available'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Added: {(() => { try { const dt = new Date(code.createdAt ?? ''); return isNaN(dt.getTime()) ? (code.createdAt || '') : dt.toLocaleString(); } catch (e) { return code.createdAt || ''; } })()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">No CPT codes found for this appointment.</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )
    }
  ];

  // Add patient health history tabs only if doctor and appointment is in progress
  if (isDoctor && (local.status === AppointmentStatus.in_progress || local.status === 'in progress')) {
    clinicalTabs.push(
      {
        id: 'medical-history',
        label: 'Medical History',
        content: (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Current appointment history is automatically added. Only add previous medical conditions here.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <TextInput
                    label="Condition Name"
                    value={newMedicalHistory.condition_name}
                    onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, condition_name: e.target.value })}
                    placeholder="e.g. Diabetes"
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    label="Diagnosis Date"
                    type="date"
                    value={newMedicalHistory.diagnosis_date}
                    onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, diagnosis_date: e.target.value })}
                  />
                </div>
                <div className="pt-7">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!newMedicalHistory.condition_name.trim()) {
                        setErrorMessage('Condition name is required');
                        setTimeout(() => setErrorMessage(''), 3000);
                        return;
                      }
                      if (!newMedicalHistory.diagnosis_date) {
                        setErrorMessage('Diagnosis date is required');
                        setTimeout(() => setErrorMessage(''), 3000);
                        return;
                      }
                      // validate date is not in the future
                      const sd = new Date(newMedicalHistory.diagnosis_date);
                      const today = new Date();
                      sd.setHours(0,0,0,0);
                      today.setHours(0,0,0,0);
                      if (isNaN(sd.getTime()) || sd.getTime() > today.getTime()) {
                        setErrorMessage('Diagnosis date must be a valid date and cannot be in the future');
                        setTimeout(() => setErrorMessage(''), 3000);
                        return;
                      }

                      setPendingMedicalHistory((prev) => [...prev, { condition_name: newMedicalHistory.condition_name, diagnosis_date: newMedicalHistory.diagnosis_date }]);
                      setNewMedicalHistory({ condition_name: '', diagnosis_date: '' });
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {pendingMedicalHistory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No medical history added for this appointment.</p>
              ) : (
                pendingMedicalHistory.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 bg-white/5 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{item.condition_name}</div>
                      <div className="text-sm text-gray-500">
                        {item.diagnosis_date ? `Diagnosed: ${new Date(item.diagnosis_date).toLocaleDateString()}` : 'Date unknown'}
                      </div>
                    </div>
                    <div>
                      <Button size="sm" variant="outline" onClick={() => setPendingMedicalHistory((p) => p.filter((_, i) => i !== idx))}>Remove</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      },
      {
        id: 'allergies',
        label: 'Allergies',
        content: (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <TextInput
                    label="Allergy Name"
                    value={newAllergy.allergy_name}
                    onChange={(e) => setNewAllergy({ allergy_name: e.target.value })}
                    placeholder="e.g. Penicillin"
                  />
                </div>
                <div className="pt-7">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!newAllergy.allergy_name.trim()) {
                        setErrorMessage('Allergy name is required');
                        setTimeout(() => setErrorMessage(''), 3000);
                        return;
                      }
                      setPendingAllergies((prev) => [...prev, { allergy_name: newAllergy.allergy_name }]);
                      setNewAllergy({ allergy_name: '' });
                      // setSuccessMessage('Allergy queued to upload on completion');
                      // setTimeout(() => setSuccessMessage(''), 3000);
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {pendingAllergies.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No allergies added for this appointment.</p>
              ) : (
                pendingAllergies.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 bg-white/5 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{item.allergy_name}</div>
                    </div>
                    <div>
                      <Button size="sm" variant="outline" onClick={() => setPendingAllergies((p) => p.filter((_, i) => i !== idx))}>Remove</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      },
      {
        id: 'family-history',
        label: 'Family History',
        content: (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <TextInput
                    label="Family Medical Condition"
                    value={newFamilyHistory.condition_name}
                    onChange={(e) => setNewFamilyHistory({ condition_name: e.target.value })}
                    placeholder="e.g. Hereditary heart disease"
                    multiline
                    rows={2}
                  />
                </div>
                <div className="pt-7">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!newFamilyHistory.condition_name.trim()) {
                        setErrorMessage('Condition description is required');
                        setTimeout(() => setErrorMessage(''), 3000);
                        return;
                      }
                      setPendingFamilyHistory((prev) => [...prev, { condition_name: newFamilyHistory.condition_name }]);
                      setNewFamilyHistory({ condition_name: '' });
                      // setSuccessMessage('Family history queued to upload on completion');
                      // setTimeout(() => setSuccessMessage(''), 3000);
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {pendingFamilyHistory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No family history added for this appointment.</p>
              ) : (
                pendingFamilyHistory.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 bg-white/5 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{item.condition_name}</div>
                    </div>
                    <div>
                      <Button size="sm" variant="outline" onClick={() => setPendingFamilyHistory((p) => p.filter((_, i) => i !== idx))}>Remove</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      },
      {
        id: 'surgical-history',
        label: 'Surgical History',
        content: (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <TextInput
                    label="Surgery Name"
                    value={newSurgicalHistory.surgery_name}
                    onChange={(e) => setNewSurgicalHistory({ ...newSurgicalHistory, surgery_name: e.target.value })}
                    placeholder="e.g. Appendectomy"
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    label="Surgery Date (Optional)"
                    type="date"
                    value={newSurgicalHistory.surgery_date}
                    onChange={(e) => setNewSurgicalHistory({ ...newSurgicalHistory, surgery_date: e.target.value })}
                  />
                </div>
                <div className="pt-7">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!newSurgicalHistory.surgery_name.trim()) {
                        setErrorMessage('Surgery name is required');
                        setTimeout(() => setErrorMessage(''), 3000);
                        return;
                      }
                      // validate surgery date not in future
                      if (newSurgicalHistory.surgery_date) {
                        try {
                          const sd = new Date(newSurgicalHistory.surgery_date);
                          const today = new Date();
                          // normalize to date-only comparison
                          sd.setHours(0,0,0,0);
                          today.setHours(0,0,0,0);
                          if (sd.getTime() > today.getTime()) {
                            setErrorMessage('Surgery date cannot be in the future');
                            setTimeout(() => setErrorMessage(''), 4000);
                            return;
                          }
                        } catch (e) {
                          // if invalid date, block
                          setErrorMessage('Invalid surgery date');
                          setTimeout(() => setErrorMessage(''), 3000);
                          return;
                        }
                      }
                      setPendingSurgicalHistory((prev) => [...prev, { surgery_name: newSurgicalHistory.surgery_name, surgery_date: newSurgicalHistory.surgery_date || undefined }]);
                      setNewSurgicalHistory({ surgery_name: '', surgery_date: '' });
                      // setSuccessMessage('Surgical history queued to upload on completion');
                      // setTimeout(() => setSuccessMessage(''), 3000);
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {pendingSurgicalHistory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No surgical history added for this appointment.</p>
              ) : (
                pendingSurgicalHistory.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 bg-white/5 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{item.surgery_name}</div>
                      <div className="text-sm text-gray-500">
                        {item.surgery_date ? `Performed: ${new Date(item.surgery_date).toLocaleDateString()}` : 'Date unknown'}
                      </div>
                    </div>
                    <div>
                      <Button size="sm" variant="outline" onClick={() => setPendingSurgicalHistory((p) => p.filter((_, i) => i !== idx))}>Remove</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      }
    );
  }

  const showClinicalDetails = (
    local.status === AppointmentStatus.in_progress ||
    local.status === 'in progress' ||
    local.status === AppointmentStatus.completed ||
    local.status === 'completed'
  );

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {errorMessage && (
        <div className="lg:col-span-3">
          <Alert type="error" message={errorMessage} />
        </div>
      )}
      {successMessage && (
        <div className="lg:col-span-3">
          <Alert type="success" message={successMessage} />
        </div>
      )}

      {/* Left: main cards */}
      <div className="lg:col-span-2 space-y-6">
        {/* Details card */}
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

            <div className="mt-4">
              <TextInput
                label="Reason"
                value={local.notes ?? ''}
                onChange={(e) => updateLocalField({ notes: e.target.value })}
                disabled={true}
                // disabled={!doctorCanComplete}
                multiline
                rows={4}
              />
            </div>

            {/* Clinical fields moved to a dedicated card below for better UI */}
          </div>
        </div>

        {/* Clinical Details Tabbed Card */}
        {showClinicalDetails && (
          <TabbedCard tabs={clinicalTabs} defaultTab="history" />
        )}

        {/* Patient placeholders (lab-test placeholders) - shown after appointment complete or when patient requests */}
        {((documentCtrl.placeholdersForPatient || []).length > 0)  && local.status === 'completed' && (
          <div className="bg-white dark:bg-[#2b2b2b] p-4 mt-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Lab Test Placeholders</h3>

            {/* Hidden file input used to upload patient results against a placeholder */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={async (e) => {
                const files = e.target.files;
                const docId = activeUploadFor;
                if (!docId || !files || files.length === 0) return;
                const file = files[0];
                try {
                  await documentCtrl.uploadUnverifiedDocumentAgainstPlaceholder(docId, file, `Patient upload for ${docId}`);
                  // refresh placeholders for this patient
                  await documentCtrl.fetchPlaceholdersForPatient();
                } catch (err) {
                  // controller will set error
                } finally {
                  setActiveUploadFor(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }
              }}
            />

            {/* show only placeholders for this appointment */}
            {(() => {
              const all = documentCtrl.placeholdersForPatient || [];
              const filtered = all.filter((p) => Number(p.appointmentId) === Number(local.appointmentId));
              if (filtered.length === 0) {
                return <p className="text-sm text-gray-500 dark:text-gray-400">No lab test placeholders for this appointment.</p>;
              }

              return (
                <div className="space-y-3">
                  {filtered.map((ph) => (
                    <div key={ph.documentId} className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{ph.labTestName ?? ph.originalName}</div>
                        <div className="text-sm text-gray-500">{ph.detail ?? ''}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ph.isVerified ? 'success' : 'warning'}>{ph.isVerified ? 'Verified' : 'Pending'}</Badge>
                        {/* <Button size='sm' variant="outline" onClick={() => setSelectedDocument(ph)}>View</Button> */}
                        {/* <Button size='sm' variant="secondary" onClick={() => documentCtrl.downloadDocument(ph.documentId, ph.originalName)}>Download</Button> */}
                        {/* {!ph.isVerified && (
                          <Button
                            size='sm'
                            variant="primary"
                            onClick={() => {
                              setActiveUploadFor(ph.documentId);
                              if (fileInputRef.current) fileInputRef.current.click();
                            }}
                            loading={documentCtrl.isUploading && activeUploadFor === ph.documentId}
                          >
                            Upload Result
                          </Button>
                        )} */}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Right: side cards */}
      <div className="space-y-6">
        {/* Appointment Info */}
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
                <Button variant='success' onClick={handleStart} loading={saving}>
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
                  <Button variant='success' onClick={handleSaveDoctorNote} loading={saving}>
                    Save & Complete
                  </Button>
                  {/* <Button onClick={handleStart} loading={saving}>
                    Refresh State
                  </Button> */}
                </>
              )}
              {!isDoctor && <div className="text-sm text-gray-600">Appointment is in progress. Only the doctor can add notes and complete it.</div>}
            </div>
          )}

          {/* Show a direct action to mark lab tests complete for patients when not completed yet */}
          {isPatient && (local.labTestsCompleted !== true) && local.status === 'completed' && (
            <Button variant="success" onClick={async () => {
                setSaving(true);
                try {
                  const updated = await appointmentCtrl.completeLabTests(local.appointmentId);
                  setLocal((prev) => ({ ...prev!, ...updated }));
                  setSuccessMessage('Lab tests marked complete');
                  setTimeout(() => setSuccessMessage(''), 4000);
                } catch (err: any) {
                  setErrorMessage(err?.message || 'Failed to mark lab tests complete');
                  setTimeout(() => setErrorMessage(''), 4000);
                } finally {
                  setSaving(false);
                }
              }}
              loading={saving}
            >
              Mark Lab Tests Complete
            </Button>
          )}

          {/* Patient quick action: show/complete lab tests for this appointment */}
          {/* {isPatient && (
            <div className="mt-2">
              <Button
                
                onClick={async () => {
                  try {
                    await documentCtrl.fetchPlaceholdersForPatient();
                  } catch (e) {
                    // ignore
                  }
                  setShowPlaceholdersPanel((s) => !s);
                }}
              >
                {showPlaceholdersPanel ? 'Hide Lab Test Placeholders' : 'Complete Lab Tests'}
              </Button>
            </div>
          )} */}
        </div>
      </div>
      </div>
    </div>
  );
};

export default AppointmentsDetailsPage;