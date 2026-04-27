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
import { AppointmentStatus } from '../../models/appointment/enums';
import type { CompleteDoctorPayload, DischargePayload, UpdateNotesDoctorPayload } from '../../models/appointment/payload';
import TabbedCard from '../../components/TabbedComponent';
import { useMedicalHistoryController, useAllergyController, useFamilyHistoryController, useSurgicalHistoryController } from '../../hooks/patient';
import AddPrescriptionModal from '../../components/AddPrescriptionModal';
import { usePrescriptionController } from '../../hooks/prescription';
import BillSection from './components/BillSection';
import accessRequestService from '../../services/accessRequest/accessRequestService';

// Shape for a lab test placeholder that has already been persisted to the backend
interface PersistedLabTest {
  documentId: string;
  labTestId: number;
  name: string;
  description?: string;
  cost?: number | null;
}

const splitPrescriptionInstructionParts = (instruction?: string | null): string[] => {
  if (!instruction) return [];
  return instruction
    .split(/[|;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
};

const AppointmentsDetailsPage: React.FC = () => {
  const appointmentCtrl = useAppointmentController();
  const { role } = useAuthController();
  const { selectedAppointmentId, setSelectedAppointmentId } = useSidebarController();

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
  // Newly added lab tests (not yet sent to backend)
  const [localLabTests, setLocalLabTests] = useState<LabTest[]>([]);
  // Already-persisted lab test placeholders fetched from backend
  const [persistedLabTests, setPersistedLabTests] = useState<PersistedLabTest[]>([]);
  // documentIds of persisted lab tests the doctor wants to remove
  const [removedPersistedDocIds, setRemovedPersistedDocIds] = useState<string[]>([]);
  const [labTestSearch, setLabTestSearch] = useState('');
  const [activeUploadFor, setActiveUploadFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Patient health history controllers
  const medicalHistoryCtrl = useMedicalHistoryController();
  const allergyCtrl = useAllergyController();
  const familyHistoryCtrl = useFamilyHistoryController();
  const surgicalHistoryCtrl = useSurgicalHistoryController();

  // Prescription controller for loading medicines only
  const prescriptionCtrl = usePrescriptionController();

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
  
  // Local prescriptions (not saved until appointment completion)
  const [localPrescriptions, setLocalPrescriptions] = useState<Array<{ local_id: number; medicine_id: number; medicine_name: string; dosage: string; instruction: string }>>([]);
  const [editingPrescriptionLocalId, setEditingPrescriptionLocalId] = useState<number | null>(null);
  const [nextLocalPrescriptionId, setNextLocalPrescriptionId] = useState(1);
  const [prescriptionSearch, setPrescriptionSearch] = useState('');

  // Prescription modal state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpReason, setFollowUpReason] = useState('');
  const [followUpType, setFollowUpType] = useState<'opd' | 'hospitalization'>('opd');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpAdmissionDate, setFollowUpAdmissionDate] = useState('');
  const [followUpDischargeDate, setFollowUpDischargeDate] = useState('');
  const [ehrAccessStatusForPatient, setEhrAccessStatusForPatient] = useState<string | null>(null);
  const [requestingEhrAccess, setRequestingEhrAccess] = useState(false);

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

  // Fetch placeholders for patient view
  useEffect(() => {
    if (!isPatient) return;
    if (!local) return;
    (async () => {
      try {
        await documentCtrl.fetchPlaceholdersForPatient();
      } catch (e) {
        // ignore errors here
      }
    })();
  }, [isPatient, local?.appointmentId]);

  // Fetch placeholders for doctor view so we can show already-saved lab tests
  useEffect(() => {
    if (!isDoctor) return;
    if (!local?.appointmentId) return;
    (async () => {
      try {
        await documentCtrl.fetchPlaceholdersForPatient();
      } catch (e) {
        // ignore
      }
    })();
  }, [isDoctor, local?.appointmentId]);

  // Derive persisted lab tests from placeholders whenever placeholders change (doctor view)
  useEffect(() => {
    if (!isDoctor) return;
    if (!local?.appointmentId) return;
    const all = documentCtrl.placeholdersForPatient || [];
    const forThisAppointment = all.filter(
      (p: any) =>
        Number(p.appointmentId) === Number(local.appointmentId) &&
        String(p.document_type ?? p.documentType ?? '').toLowerCase() === 'lab test'
    );
    const mapped: PersistedLabTest[] = forThisAppointment.map((p: any) => ({
      documentId: String(p.documentId),
      labTestId: Number(p.labTestId ?? 0),
      name: String(p.labTestName ?? p.originalName ?? ''),
      description: p.detail ?? undefined,
      cost: p.cost ?? null,
    }));
    setPersistedLabTests(mapped);
    // Also clear any pending removals that no longer exist in persisted list
    setRemovedPersistedDocIds((prev) =>
      prev.filter((id) => mapped.some((lt) => lt.documentId === id))
    );
  }, [documentCtrl.placeholdersForPatient, local?.appointmentId, isDoctor]);

  // Reset local lab test state when switching appointments
  useEffect(() => {
    setLocalLabTests([]);
    setRemovedPersistedDocIds([]);
    setLabTestSearch('');
  }, [local?.appointmentId]);

  // Load already-saved prescriptions for this appointment
  useEffect(() => {
    if (!local?.appointmentId) return;
    (async () => {
      try {
        await prescriptionCtrl.fetchPrescriptionsForAppointment(local.appointmentId);
      } catch (e) {
        // prescription controller manages error state
      }
    })();
  }, [local?.appointmentId]);

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

  useEffect(() => {
    if (!isDoctor || !local?.patientId) {
      setEhrAccessStatusForPatient(null);
      return;
    }

    let active = true;
    const loadEhrStatus = async () => {
      try {
        const response = await accessRequestService.getRequestsForDoctor();
        const allRequests = response?.data || [];
        const request = allRequests.find((item: any) =>
          Number(item.patient_id) === Number(local.patientId) &&
          Number(item.requester_id) === Number(local.doctorId)
        );
        if (!active) return;
        setEhrAccessStatusForPatient(String(request?.status || '').toLowerCase() || null);
      } catch {
        if (!active) return;
        setEhrAccessStatusForPatient(null);
      }
    };

    loadEhrStatus();

    return () => {
      active = false;
    };
  }, [isDoctor, local?.patientId, local?.appointmentId]);

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
  const isInProgress = local.status === AppointmentStatus.in_progress || local.status === 'in progress';
  const isCompleted = local.status === AppointmentStatus.completed || local.status === 'completed';
  const isHospitalization = String(local.appointmentType ?? '').toLowerCase() === 'hospitalization';
  const canStart = local.status === AppointmentStatus.upcoming && isDoctor;
  const canCancel = local.status === AppointmentStatus.upcoming && (isPatient);
  const canReschedule = local.status === AppointmentStatus.upcoming && (isPatient || isFrontDesk);
  const doctorCanComplete = isInProgress && isDoctor;
  const canCreateFollowUp = (isDoctor && (doctorCanComplete || isCompleted)) || (isPatient && isCompleted);

  const normalizedLabTestSearch = labTestSearch.trim().toLowerCase();

  // Filter persisted lab tests (excluding ones marked for removal) by search
  const visiblePersistedLabTests = persistedLabTests
    .filter((lt) => !removedPersistedDocIds.includes(lt.documentId))
    .filter((lt) => {
      if (!normalizedLabTestSearch) return true;
      return [lt.name, lt.description ?? '', String(lt.cost ?? '')].some((v) =>
        v.toLowerCase().includes(normalizedLabTestSearch)
      );
    });

  // Filter newly added lab tests by search
  const filteredLocalLabTests = (localLabTests || []).filter((lt) => {
    if (!normalizedLabTestSearch) return true;
    return [lt.name, lt.description ?? '', String(lt.cost ?? '')].some((value) =>
      String(value || '').toLowerCase().includes(normalizedLabTestSearch)
    );
  });

  const normalizedPrescriptionSearch = prescriptionSearch.trim().toLowerCase();
  const filteredQueuedPrescriptions = (localPrescriptions || []).filter((p) => {
    if (!normalizedPrescriptionSearch) return true;
    return [p.medicine_name, p.dosage, p.instruction].some((value) =>
      String(value || '').toLowerCase().includes(normalizedPrescriptionSearch)
    );
  });
  const filteredPersistedPrescriptions = (prescriptionCtrl.prescriptions || []).filter((p) => {
    if (!normalizedPrescriptionSearch) return true;
    return [p.medicineName, p.dosage, p.instruction].some((value) =>
      String(value || '').toLowerCase().includes(normalizedPrescriptionSearch)
    );
  });

  const linkedParent = local?.parentAppointmentId
    ? (appointmentCtrl.appointments.find((a) => a.appointmentId === local.parentAppointmentId) ?? null)
    : null;

  const linkedChildren = local?.appointmentId
    ? ((appointmentCtrl.appointments || []).filter((a) => a.parentAppointmentId === local.appointmentId))
    : [];

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

  // Shared helper: upload pending patient history, prescriptions and lab test placeholders.
  // Returns true if all uploads succeeded, false if any failed (error message is set internally).
  const uploadPendingData = async (opts: { requirePrescriptions: boolean }): Promise<boolean> => {
    // Upload pending patient history
    if ((pendingMedicalHistory || []).length > 0 || (pendingAllergies || []).length > 0 || (pendingFamilyHistory || []).length > 0 || (pendingSurgicalHistory || []).length > 0) {
      const uploadErrors: string[] = [];
      const patientId = local!.patientId ?? undefined;

      for (const mh of pendingMedicalHistory) {
        try {
          await medicalHistoryCtrl.createMedicalHistoryForDoctor(patientId!, { condition_name: mh.condition_name, diagnosis_date: mh.diagnosis_date || undefined });
        } catch (err: any) {
          uploadErrors.push(`Medical history '${mh.condition_name}': ${err?.message || String(err)}`);
        }
      }

      for (const al of pendingAllergies) {
        try {
          await allergyCtrl.createAllergyForDoctor(patientId!, { allergy_name: al.allergy_name });
        } catch (err: any) {
          uploadErrors.push(`Allergy '${al.allergy_name}': ${err?.message || String(err)}`);
        }
      }

      for (const fh of pendingFamilyHistory) {
        try {
          await familyHistoryCtrl.createFamilyHistoryForDoctor(patientId!, { condition_name: fh.condition_name });
        } catch (err: any) {
          uploadErrors.push(`Family history '${fh.condition_name}': ${err?.message || String(err)}`);
        }
      }

      for (const sh of pendingSurgicalHistory) {
        try {
          if (sh.surgery_date) {
            const sd = new Date(sh.surgery_date);
            const today = new Date();
            sd.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            if (sd.getTime() > today.getTime()) {
              uploadErrors.push(`Surgery '${sh.surgery_name}': surgery_date cannot be in the future`);
              continue;
            }
          }
          await surgicalHistoryCtrl.createSurgicalHistoryForDoctor(patientId!, { surgery_name: sh.surgery_name, surgery_date: sh.surgery_date || undefined });
        } catch (err: any) {
          uploadErrors.push(`Surgery '${sh.surgery_name}': ${err?.message || String(err)}`);
        }
      }

      if (uploadErrors.length > 0) {
        setErrorMessage(`Failed to upload patient history: ${uploadErrors.join(' ; ')}`);
        return false;
      }

      setPendingMedicalHistory([]);
      setPendingAllergies([]);
      setPendingFamilyHistory([]);
      setPendingSurgicalHistory([]);
    }

    // Upload pending prescriptions
    if ((localPrescriptions || []).length > 0) {
      const prescriptionErrors: string[] = [];
      for (const prescription of localPrescriptions) {
        try {
          await prescriptionCtrl.createPrescription({
            appointment_id: local!.appointmentId,
            medicine_id: prescription.medicine_id,
            dosage: prescription.dosage,
            instruction: prescription.instruction,
          });
        } catch (err: any) {
          prescriptionErrors.push(`Prescription '${prescription.medicine_name}': ${err?.message || String(err)}`);
        }
      }

      if (prescriptionErrors.length > 0) {
        setErrorMessage(`Failed to upload prescriptions: ${prescriptionErrors.join(' ; ')}`);
        return false;
      }

      setLocalPrescriptions([]);
      setEditingPrescriptionLocalId(null);
    } else if (opts.requirePrescriptions && (prescriptionCtrl.prescriptions || []).length === 0) {
      const continueWithout = confirm('No prescriptions are queued for this appointment. Continue without adding prescriptions?');
      if (!continueWithout) return false;
    }

    // Remove persisted lab tests that the doctor marked for removal
    if (removedPersistedDocIds.length > 0) {
      const removalErrors: string[] = [];
      for (const docId of removedPersistedDocIds) {
        try {
          // NOTE: implement documentCtrl.removeLabTestPlaceholder(docId) on your backend.
          // Expected signature: removeLabTestPlaceholder(documentId: string): Promise<void>
          await (documentCtrl as any).removeLabTestPlaceholder(docId);
        } catch (err: any) {
          const name = persistedLabTests.find((lt) => lt.documentId === docId)?.name ?? docId;
          removalErrors.push(`Remove '${name}': ${err?.message || String(err)}`);
        }
      }

      if (removalErrors.length > 0) {
        setErrorMessage(`Failed to remove lab tests: ${removalErrors.join(' ; ')}`);
        return false;
      }

      setRemovedPersistedDocIds([]);
    }

    // Upload ONLY newly added lab tests (localLabTests) — never re-send persisted ones
    if ((localLabTests || []).length > 0) {
      const placeholderErrors: string[] = [];
      for (const lt of localLabTests) {
        try {
          const payloadPlaceholder = {
            patient_id: local!.patientId ?? undefined,
            appointment_id: local!.appointmentId,
            lab_test_id: lt.labTestId,
            detail: `Placeholder for lab test: ${lt.name}`,
            document_type: 'lab test',
          };
          await documentCtrl.insertPlaceholderForLabTestDocument(payloadPlaceholder as any);
        } catch (err: any) {
          placeholderErrors.push(`${lt.name}: ${err?.message || String(err)}`);
        }
      }

      if (placeholderErrors.length > 0) {
        setErrorMessage(`Failed to create placeholders: ${placeholderErrors.join(' ; ')}`);
        return false;
      }

      setLocalLabTests([]);
    }

    return true;
  };

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

  // Save & Complete — used for regular (non-hospitalization) appointments
  const handleSaveDoctorNote = async () => {
    if (!local) return;
    setSaving(true);
    try {
      const ok = await uploadPendingData({ requirePrescriptions: true });
      if (!ok) { setSaving(false); return; }

      const diagnosisString = (local.diagnosisList && local.diagnosisList.length > 0) ? local.diagnosisList.join(', ') : (local.diagnosis ?? null);
      const payload: CompleteDoctorPayload = {
        doctor_note: local.notes ?? null,
        history_of_present_illness: local.historyOfPresentIllness ?? null,
        review_of_systems: local.reviewOfSystems ?? null,
        physical_exam: local.physicalExam ?? null,
        diagnosis: diagnosisString ?? null,
        plan: local.plan ?? null,
        lab_tests_ordered: (localLabTests || []).length > 0 || persistedLabTests.length > 0 ? true : false,
      };

      const updated = await appointmentCtrl.completeDoctor(local.appointmentId, payload);
      setLocal((prev) => ({
        ...prev!,
        ...updated,
        patientName: updated.patientName || prev?.patientName,
        doctorName: updated.doctorName || prev?.doctorName,
        hospitalName: updated.hospitalName || prev?.hospitalName,
      }));
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

  // Update Details — saves clinical notes for hospitalization appointments WITHOUT completing
  const handleUpdateDetails = async () => {
    if (!local) return;
    setSaving(true);
    try {
      const ok = await uploadPendingData({ requirePrescriptions: false });
      if (!ok) { setSaving(false); return; }

      const diagnosisString = (local.diagnosisList && local.diagnosisList.length > 0)
        ? local.diagnosisList.join(', ')
        : (local.diagnosis ?? null);

      const payload: UpdateNotesDoctorPayload = {
        history_of_present_illness: local.historyOfPresentIllness ?? null,
        review_of_systems: local.reviewOfSystems ?? null,
        physical_exam: local.physicalExam ?? null,
        diagnosis: diagnosisString ?? null,
        plan: local.plan ?? null,
      };

      const updated = await appointmentCtrl.updateDoctorDetails(local.appointmentId, payload);
      setLocal((prev) => ({
        ...prev!,
        ...updated,
        patientName: updated.patientName || prev?.patientName,
        doctorName: updated.doctorName || prev?.doctorName,
        hospitalName: updated.hospitalName || prev?.hospitalName,
      }));

      // Refresh placeholders so persistedLabTests reflects the newly uploaded ones
      try {
        await documentCtrl.fetchPlaceholdersForPatient();
      } catch (e) {
        // ignore
      }

      setSuccessMessage('Details updated successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update details');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Discharge — completes a hospitalization appointment
  const handleDischarge = async () => {
    if (!local) return;
    if (!confirm('Confirm discharge patient and complete this appointment?')) return;
    setSaving(true);
    try {
      const ok = await uploadPendingData({ requirePrescriptions: false });
      if (!ok) { setSaving(false); return; }

      const diagnosisString = (local.diagnosisList && local.diagnosisList.length > 0)
        ? local.diagnosisList.join(', ')
        : (local.diagnosis ?? null);

      const payload: DischargePayload = {
        history_of_present_illness: local.historyOfPresentIllness ?? null,
        review_of_systems: local.reviewOfSystems ?? null,
        physical_exam: local.physicalExam ?? null,
        diagnosis: diagnosisString ?? null,
        plan: local.plan ?? null,
      };

      const updated = await appointmentCtrl.discharge(local.appointmentId, payload);
      setLocal((prev) => ({
        ...prev!,
        ...updated,
        patientName: updated.patientName || prev?.patientName,
        doctorName: updated.doctorName || prev?.doctorName,
        hospitalName: updated.hospitalName || prev?.hospitalName,
      }));
      setSuccessMessage('Patient discharged successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to discharge patient');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Hospitalize — changes a regular in-progress appointment to hospitalization type
  const handleHospitalize = async () => {
    if (!local) return;
    if (!confirm('Convert this appointment to a hospitalization? The patient will be admitted.')) return;
    setSaving(true);
    try {
      const updated = await appointmentCtrl.hospitalize(local.appointmentId);
      setLocal((prev) => ({
        ...prev!,
        ...updated,
        patientName: updated.patientName || prev?.patientName,
        doctorName: updated.doctorName || prev?.doctorName,
        hospitalName: updated.hospitalName || prev?.hospitalName,
      }));
      setSuccessMessage('Appointment converted to hospitalization');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to hospitalize');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFollowUp = async () => {
    if (!local) return;

    if (!followUpDate) {
      setErrorMessage('Follow-up date is required');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    if (!followUpTime) {
      setErrorMessage('Follow-up time is required');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    if (!followUpReason.trim()) {
      setErrorMessage('Follow-up reason is required');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }
    
    setFollowUpType('opd'); // for now, we are only allowing OPD follow-ups

    setSaving(true);
    try {
      const created = isPatient
        ? await appointmentCtrl.createPatientFollowUp(local.appointmentId, {
            date: followUpDate,
            time: followUpTime,
            reason: followUpReason.trim(),
            appointment_type: followUpType,
            follow_up_notes: followUpNotes.trim() || null,
            admission_date: followUpType === 'hospitalization' ? (followUpAdmissionDate || null) : null,
            discharge_date: followUpType === 'hospitalization' ? (followUpDischargeDate || null) : null,
          })
        : await appointmentCtrl.createDoctorFollowUp(local.appointmentId, {
            date: followUpDate,
            time: followUpTime,
            reason: followUpReason.trim(),
            appointment_type: followUpType,
            follow_up_notes: followUpNotes.trim() || null,
            admission_date: followUpType === 'hospitalization' ? (followUpAdmissionDate || null) : null,
            discharge_date: followUpType === 'hospitalization' ? (followUpDischargeDate || null) : null,
          });

      setSuccessMessage(`Follow-up appointment #${created.appointmentId} created`);
      setTimeout(() => setSuccessMessage(''), 4000);

      setShowFollowUpForm(false);
      setFollowUpDate('');
      setFollowUpTime('');
      setFollowUpReason('');
      setFollowUpType('opd');
      setFollowUpNotes('');
      setFollowUpAdmissionDate('');
      setFollowUpDischargeDate('');

      if (isPatient) {
        await appointmentCtrl.fetchForPatient?.();
      } else if (isDoctor) {
        await appointmentCtrl.fetchForDoctor?.();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create follow-up appointment');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestEhrAccess = async () => {
    if (!isDoctor || !local?.patientId) return;

    setRequestingEhrAccess(true);
    try {
      await accessRequestService.createRequest({
        requester_id: Number(local.doctorId || 0),
        patient_id: Number(local.patientId),
      });
      setEhrAccessStatusForPatient('requested');
      setSuccessMessage('EHR access request sent successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to request EHR access');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setRequestingEhrAccess(false);
    }
  };

  // Build tabs for clinical details
  const clinicalTabs = [
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
  ];

  if (!isDoctor) {
    clinicalTabs.push({
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
                        <div key={String(idx)} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
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
                        <div key={String(idx)} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
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
    });
  }

  // Add patient health history + lab test tabs only if doctor and appointment is in progress
  if (isDoctor && (local.status === AppointmentStatus.in_progress || local.status === 'in progress')) {
    clinicalTabs.push(
      {
        id: 'lab-tests',
        label: 'Lab Tests',
        content: (
          <div className="space-y-4">
            {/* Add new lab test */}
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
                    // Don't add if already persisted
                    const alreadyPersisted = persistedLabTests.some((p) => p.labTestId === lt.labTestId);
                    if (alreadyPersisted) {
                      setErrorMessage('This lab test is already saved for this appointment.');
                      setTimeout(() => setErrorMessage(''), 3000);
                      return;
                    }
                    // Don't add duplicates in local list
                    setLocalLabTests((prev) => (prev.find((p) => p.labTestId === lt.labTestId) ? prev : [...prev, lt]));
                    setSelectedLabTestId('');
                  }}
                  disabled={!doctorCanComplete || !selectedLabTestId}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
              <div className="flex-1">
                <TextInput
                  label="Search lab tests"
                  value={labTestSearch}
                  onChange={(e) => setLabTestSearch(e.target.value)}
                  placeholder="Search name, description, or cost"
                />
              </div>
              {labTestSearch.trim().length > 0 && (
                <div className="md:pt-7">
                  <Button variant="outline" onClick={() => setLabTestSearch('')}>
                    Reset Search
                  </Button>
                </div>
              )}
            </div>

            {/* Already saved lab tests */}
            {persistedLabTests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Already Saved</h4>
                {visiblePersistedLabTests.length === 0 && normalizedLabTestSearch ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No saved lab tests match your search.</p>
                ) : visiblePersistedLabTests.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">All saved lab tests have been marked for removal.</p>
                ) : (
                  <div className="space-y-2">
                    {visiblePersistedLabTests.map((lt) => (
                      <div
                        key={lt.documentId}
                        className="flex items-start justify-between gap-3 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 p-3 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{lt.name}</div>
                          {(lt.description || lt.cost != null) && (
                            <div className="text-sm text-gray-500">
                              {lt.description ?? ''}{lt.cost != null ? ` • Cost: ${lt.cost}` : ''}
                            </div>
                          )}
                        </div>
                        {doctorCanComplete && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (!confirm(`Remove "${lt.name}" from this appointment? This will be sent to the backend on next save.`)) return;
                              setRemovedPersistedDocIds((prev) => [...prev, lt.documentId]);
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Show pending removal notice */}
                {removedPersistedDocIds.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>{removedPersistedDocIds.length}</strong> lab test{removedPersistedDocIds.length > 1 ? 's' : ''} marked for removal.
                      {' '}These will be deleted from the backend when you save.
                    </p>
                    <button
                      className="text-xs text-amber-700 dark:text-amber-300 underline mt-1"
                      onClick={() => setRemovedPersistedDocIds([])}
                    >
                      Undo all removals
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Newly added (not yet saved) lab tests */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Queued — Will Be Saved on Next Update
              </h4>
              {localLabTests.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No new lab tests queued.</p>
              ) : filteredLocalLabTests.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No queued lab tests match your search.</p>
              ) : (
                <div className="space-y-2">
                  {filteredLocalLabTests.map((lt) => (
                    <div
                      key={lt.labTestId}
                      className="flex items-start justify-between gap-3 bg-white dark:bg-[#2a2a2a] border border-blue-200 dark:border-blue-700 p-3 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{lt.name}</span>
                          {/* NEW badge */}
                          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                            New
                          </span>
                        </div>
                        {(lt.description || lt.cost != null) && (
                          <div className="text-sm text-gray-500">
                            {lt.description ?? ''}{lt.cost != null ? ` • Cost: ${lt.cost}` : ''}
                          </div>
                        )}
                      </div>
                      {doctorCanComplete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setLocalLabTests((prev) => prev.filter((p) => p.labTestId !== lt.labTestId))}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      },
      {
        id: 'prescriptions',
        label: 'Prescriptions',
        content: (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
              <div className="flex-1">
                <TextInput
                  label="Search prescriptions"
                  value={prescriptionSearch}
                  onChange={(e) => setPrescriptionSearch(e.target.value)}
                  placeholder="Search medicine, dosage, or instruction"
                />
              </div>
              {prescriptionSearch.trim().length > 0 && (
                <div className="md:pt-7">
                  <Button
                    variant="outline"
                    onClick={() => setPrescriptionSearch('')}
                  >
                    Reset Search
                  </Button>
                </div>
              )}
            </div>

            {doctorCanComplete && (
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditingPrescriptionLocalId(null);
                    setShowPrescriptionModal(true);
                  }}
                >
                  Add Prescription
                </Button>
              </div>
            )}

            {(prescriptionCtrl.prescriptions || []).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Already Saved</h4>
                {filteredPersistedPrescriptions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No saved prescriptions match your search.</p>
                ) : (
                  filteredPersistedPrescriptions.map((prescription) => (
                    <div
                      key={prescription.prescriptionId}
                      className="bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {prescription.medicineName || 'Unknown Medicine'}
                            </h4>
                            <span className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded">
                              Saved
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p><strong>Dosage:</strong> {prescription.dosage || '-'}</p>
                            <div className="space-y-1">
                              <p><strong>Instructions:</strong></p>
                              {splitPrescriptionInstructionParts(prescription.instruction).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {splitPrescriptionInstructionParts(prescription.instruction).map((part, idx) => (
                                    <span
                                      key={`${prescription.prescriptionId}-${idx}`}
                                      className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                    >
                                      {part}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p>-</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Queued For Completion</h4>
            {localPrescriptions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                No prescriptions added for this appointment yet.
              </p>
            ) : filteredQueuedPrescriptions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                No queued prescriptions match your search.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredQueuedPrescriptions.map((prescription) => {
                  return (
                  <div 
                    key={prescription.local_id}
                    className="bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {prescription.medicine_name}
                          </h4>
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
                            Pending
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p><strong>Dosage:</strong> {prescription.dosage}</p>
                          <div className="space-y-1">
                            <p><strong>Instructions:</strong></p>
                            {splitPrescriptionInstructionParts(prescription.instruction).length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {splitPrescriptionInstructionParts(prescription.instruction).map((part, idx) => (
                                  <span
                                    key={`${prescription.medicine_id}-${idx}`}
                                    className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                  >
                                    {part}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p>-</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {doctorCanComplete && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingPrescriptionLocalId(prescription.local_id);
                              setShowPrescriptionModal(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setLocalPrescriptions((prev) => prev.filter((entry) => entry.local_id !== prescription.local_id));
                              if (editingPrescriptionLocalId === prescription.local_id) {
                                setEditingPrescriptionLocalId(null);
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );})}
              </div>
            )}
            </div>
          </div>
        )
      },
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
                      if (newSurgicalHistory.surgery_date) {
                        try {
                          const sd = new Date(newSurgicalHistory.surgery_date);
                          const today = new Date();
                          sd.setHours(0,0,0,0);
                          today.setHours(0,0,0,0);
                          if (sd.getTime() > today.getTime()) {
                            setErrorMessage('Surgery date cannot be in the future');
                            setTimeout(() => setErrorMessage(''), 4000);
                            return;
                          }
                        } catch (e) {
                          setErrorMessage('Invalid surgery date');
                          setTimeout(() => setErrorMessage(''), 3000);
                          return;
                        }
                      }
                      setPendingSurgicalHistory((prev) => [...prev, { surgery_name: newSurgicalHistory.surgery_name, surgery_date: newSurgicalHistory.surgery_date || undefined }]);
                      setNewSurgicalHistory({ surgery_name: '', surgery_date: '' });
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

  // "Requested Lab Tests" tab — visible to patients on completed appointments
  if (isPatient && isCompleted) {
    const allPlaceholders = documentCtrl.placeholdersForPatient || [];
    const appointmentPlaceholders = allPlaceholders.filter(
      (p: any) => Number(p.appointmentId) === Number(local.appointmentId)
    );

    clinicalTabs.push({
      id: 'requested-lab-tests',
      label: 'Requested Lab Tests',
      content: (
        <div className="space-y-4">
          {/* Hidden file input for uploading results */}
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
                await documentCtrl.fetchPlaceholdersForPatient();
              } catch (err) {
                // controller will set error
              } finally {
                setActiveUploadFor(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
          />

          {appointmentPlaceholders.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No lab tests were requested for this appointment.
            </p>
          ) : (
            <div className="space-y-3">
              {appointmentPlaceholders.map((ph: any) => (
                <div
                  key={ph.documentId}
                  className="flex items-center justify-between gap-3 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-700 p-4 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {ph.labTestName ?? ph.originalName}
                    </div>
                    {ph.detail && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{ph.detail}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ph.isVerified ? 'success' : 'warning'}>
                      {ph.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    });
  }

  // Add bill tab for completed appointments
  if (local.status === AppointmentStatus.completed || local.status === 'completed') {
    clinicalTabs.push({
      id: 'bill',
      label: 'Bill & Payment',
      content: (
        <BillSection 
          appointmentId={local.appointmentId} 
          appointmentStatus={local.status}
          hospitalId={local.hospitalId ?? undefined}
        />
      )
    });
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
                multiline
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Clinical Details Tabbed Card */}
        {showClinicalDetails && (
          <TabbedCard tabs={clinicalTabs} defaultTab="doctor-notes" />
        )}

        {/* Linked follow-up appointments */}
        {(linkedParent || linkedChildren.length > 0) && (
          <div className="bg-white dark:bg-[#2b2b2b] p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Follow-up Timeline</h3>
            <div className="space-y-2">
              {linkedParent && (
                <button
                  className="w-full text-left p-3 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                  onClick={() => setSelectedAppointmentId(linkedParent.appointmentId)}
                >
                  <div className="text-sm text-gray-500">Parent Appointment</div>
                  <div className="font-medium">#{linkedParent.appointmentId} • {linkedParent.date} {linkedParent.time}</div>
                </button>
              )}

              {linkedChildren.map((child) => (
                <button
                  key={child.appointmentId}
                  className="w-full text-left p-3 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                  onClick={() => setSelectedAppointmentId(child.appointmentId)}
                >
                  <div className="text-sm text-gray-500">Follow-up Appointment</div>
                  <div className="font-medium">#{child.appointmentId} • {child.date} {child.time}</div>
                </button>
              ))}
            </div>
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

          {isDoctor && local.patientId && (
            (ehrAccessStatusForPatient === 'granted' || ehrAccessStatusForPatient === 'requested') ? (
              <Alert
                type="info"
                title={ehrAccessStatusForPatient === 'granted' ? 'EHR Access Granted' : 'EHR Access Requested'}
                message={ehrAccessStatusForPatient === 'granted' ? 'You already have EHR access for this patient.' : 'An EHR access request is already pending for this patient.'}
                onClose={() => {}}
              />
            ) : (
              <Button
                variant="outline"
                onClick={handleRequestEhrAccess}
                loading={requestingEhrAccess}
              >
                {(ehrAccessStatusForPatient === 'denied' || ehrAccessStatusForPatient === 'revoked') ? 'Request EHR Access Again' : 'Request Patient EHR Access'}
              </Button>
            )
          )}

          {((hasChanges && isFrontDesk) || (isPatient && canReschedule) || (isDoctor && canReschedule)) && (
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => {
                if (!appointment) return;
                setLocal({ ...appointment });
              }}>
                Reset
              </Button>
            </div>
          )}

          {/* Processing: frontdesk actions */}
          {local.status === 'processing' && isFrontDesk && (
            <div className="flex flex-col gap-2">
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
          {isInProgress && isDoctor && (
            <div className="flex flex-col gap-2">
              {isHospitalization ? (
                <>
                  <Button variant='primary' onClick={handleUpdateDetails} loading={saving}>
                    Update Details
                  </Button>
                  <Button variant='success' onClick={handleDischarge} loading={saving}>
                    Discharge
                  </Button>
                  <div className="text-xs text-amber-700 dark:text-amber-300">
                    Tip: Use "Update Details" to save progress. "Discharge" will complete the appointment.
                  </div>
                </>
              ) : (
                <>
                  <Button variant='success' onClick={handleSaveDoctorNote} loading={saving}>
                    Save & Complete
                  </Button>
                  <Button variant='danger' onClick={handleHospitalize} loading={saving}>
                    Hospitalize Patient
                  </Button>
                  <div className="text-xs text-amber-700 dark:text-amber-300">
                    Tip: Create follow-up first if needed. Your current notes stay here and you can still create follow-up after completion.
                  </div>
                </>
              )}
            </div>
          )}

          {isInProgress && !isDoctor && (
            <div className="text-sm text-gray-600">Appointment is in progress. Only the doctor can add notes and complete it.</div>
          )}

          {/* Follow-up creation */}
          {canCreateFollowUp && (
            <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Follow-up Appointment</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const nextShow = !showFollowUpForm;
                    setShowFollowUpForm(nextShow);

                    if (!nextShow) {
                      return;
                    }

                    const plusDays = (baseDate: string | null | undefined, days: number) => {
                      if (!baseDate) return '';
                      const dt = new Date(baseDate);
                      if (Number.isNaN(dt.getTime())) return '';
                      dt.setDate(dt.getDate() + days);
                      return dt.toISOString().split('T')[0];
                    };

                    setFollowUpDate((prev) => prev || plusDays(local.date, 7));
                    setFollowUpTime((prev) => prev || (local.time ? String(local.time).slice(0, 5) : ''));
                    setFollowUpReason((prev) => prev || local.notes || local.historyOfPresentIllness || 'Follow-up consultation');
                    setFollowUpType((prev) => {
                      const appointmentType = String(local.appointmentType || '').toLowerCase();
                      if (appointmentType === 'hospitalization' && (prev === 'opd' || !prev)) {
                        return 'hospitalization';
                      }
                      return prev || 'opd';
                    });
                    setFollowUpNotes((prev) => prev || local.plan || '');
                    setFollowUpAdmissionDate((prev) => prev || plusDays(local.admissionDate || local.date, 7));
                    setFollowUpDischargeDate((prev) => prev || plusDays(local.dischargeDate || local.date, 8));
                  }}
                >
                  {showFollowUpForm ? 'Hide Follow-up Form' : 'Create Follow-up'}
                </Button>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                Use this to schedule follow-up directly from appointment details.
              </p>

              {showFollowUpForm && (
                <div className="space-y-3">
                  <TextInput
                    label="Follow-up Date"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                  <TextInput
                    label="Follow-up Time"
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                  />
                  <TextInput
                    label="Follow-up Reason"
                    value={followUpReason}
                    onChange={(e) => setFollowUpReason(e.target.value)}
                    multiline
                    rows={3}
                  />
                  <TextInput
                    label="Follow-up Notes (optional)"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    multiline
                    rows={2}
                  />
                  <Button
                    variant="success"
                    onClick={handleCreateFollowUp}
                    loading={saving}
                  >
                    Save Follow-up
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Add Prescription Modal */}
      {local && (
        <AddPrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={() => {
            setShowPrescriptionModal(false);
            setEditingPrescriptionLocalId(null);
          }}
          appointmentId={local.appointmentId}
          initialPrescription={editingPrescriptionLocalId !== null ? localPrescriptions.find((p) => p.local_id === editingPrescriptionLocalId) ?? null : null}
          onSuccess={(prescription) => {
            if (editingPrescriptionLocalId !== null) {
              setLocalPrescriptions((prev) => prev.map((item) => (item.local_id === editingPrescriptionLocalId ? { ...item, ...prescription } : item)));
              setSuccessMessage('Prescription updated successfully');
            } else {
              setLocalPrescriptions(prev => [...prev, { local_id: nextLocalPrescriptionId, ...prescription }]);
              setNextLocalPrescriptionId((prev) => prev + 1);
              setSuccessMessage('Prescription added successfully');
            }
            setEditingPrescriptionLocalId(null);
            setTimeout(() => setSuccessMessage(''), 4000);
          }}
        />
      )}
    </div>
  );
};

export default AppointmentsDetailsPage;