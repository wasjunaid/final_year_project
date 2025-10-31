import { useMemo, useState } from "react";
import {
  FaPrescriptionBottleAlt,
  FaArrowLeft,
  FaPlus,
  FaEdit,
} from "react-icons/fa";
import Button from "../../components/Button";
import DataTable, {
  type IDataTableColumnProps,
} from "../../components/DataTable";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import useMedicine from "../../hooks/useMedicine";
import type { Prescription } from "../../models/Prescription";
import { usePrescriptions } from "../../hooks/usePrescription";
import CreatePrescriptionModal from "./Components/CreatePrescriptionModal";


interface PrescriptionDetailsProps {
  prescription: Prescription;
  onBack: () => void;
  onEdit?: () => void;
  canEdit: boolean;
  medicines: any[];
}

function PrescriptionDetails({
  prescription,
  onBack,
  onEdit,
  canEdit,
  medicines,
}: PrescriptionDetailsProps) {
  const medicine = medicines.find(
    (m) => m.medicine_id === prescription.medicine_id
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-full">
            <FaPrescriptionBottleAlt className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Prescription Details</h2>
            <p className="text-sm text-gray-500">
              ID: #{prescription.prescription_id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && onEdit && (
            <Button
              label="Edit"
              icon={<FaEdit />}
              variant="secondary"
              size="sm"
              onClick={onEdit}
            />
          )}
          <Button
            label="Back to list"
            icon={<FaArrowLeft />}
            variant="secondary"
            size="sm"
            onClick={onBack}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Medicine</h3>
            <p className="text-gray-900">
              {prescription.medicine_name ||
                medicine?.name ||
                `#${prescription.medicine_id}`}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Dosage</h3>
            <p className="text-gray-900">{prescription.dosage}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Instructions</h3>
            <p className="text-gray-900 whitespace-pre-line">
              {prescription.instruction}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Appointment ID</h3>
            <p className="text-gray-900">#{prescription.appointment_id}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Created</h3>
            <p className="text-gray-900">
              {prescription.created_at
                ? new Date(prescription.created_at).toLocaleString()
                : "—"}
            </p>
          </div>

          {prescription.updated_at && (
            <div>
              <h3 className="font-medium text-gray-700">Last Updated</h3>
              <p className="text-gray-900">
                {new Date(prescription.updated_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrescriptionsPage() {
  const role = useUserRole();
  const { items, loading, error, success, create, clearMessages } =
    usePrescriptions();
  const { items: medicines } = useMedicine();

  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


  const canManage = role === ROLES.DOCTOR;
  const hasAccess = role === ROLES.PATIENT || role === ROLES.DOCTOR;

  const columns = useMemo<IDataTableColumnProps<Prescription>[]>(
    () => [
      {
        key: "prescription_id",
        label: "ID",
        render: (row) => (
          <span className="font-mono text-sm text-gray-600">
            #{row.prescription_id}
          </span>
        ),
      },
      {
        key: "medicine",
        label: "Medicine",
        render: (row) => {
          const medicine = medicines.find(
            (m) => m.medicine_id === row.medicine_id
          );
          return (
            <span className="font-medium text-gray-900">
              {row.medicine_name ||
                medicine?.name ||
                `Medicine #${row.medicine_id}`}
            </span>
          );
        },
      },
      {
        key: "dosage",
        label: "Dosage",
        render: (row) => row.dosage,
      },
      {
        key: "appointment_id",
        label: "Appointment",
        render: (row) => (
          <span className="font-mono text-sm text-gray-600">
            #{row.appointment_id}
          </span>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        render: (row) =>
          row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
      },
    ],
    [medicines]
  );

  if (!hasAccess) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-4">
          Access denied. Only patients and doctors can view prescriptions.
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    switch (role) {
      case ROLES.PATIENT:
        return "My Prescriptions";
      case ROLES.DOCTOR:
        return "Prescribed Medications";
      default:
        return "Prescriptions";
    }
  };

  const getPageDescription = () => {
    switch (role) {
      case ROLES.PATIENT:
        return "View all prescriptions prescribed to you by doctors.";
      case ROLES.DOCTOR:
        return "Manage prescriptions you've created for your patients.";
      default:
        return "Prescription management system.";
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-full">
            <FaPrescriptionBottleAlt className="text-indigo-600 text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-500">{getPageDescription()}</p>
          </div>
        </div>
        {canManage && (
          <Button
            label="Create Prescription"
            icon={<FaPlus />}
            size="sm"
            onClick={() => {
              clearMessages();
              setIsCreateModalOpen(true);
            }}
          />
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-3">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 text-green-600 rounded-lg p-3">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {selectedPrescription ? (
          <PrescriptionDetails
            prescription={selectedPrescription}
            onBack={() => setSelectedPrescription(null)}
            canEdit={false}
            medicines={medicines}
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            // loading={loading}
            searchable
            onRowClick={(row) => setSelectedPrescription(row)}
            // emptyMessage={
            //   role === ROLES.PATIENT
            //     ? "No prescriptions found."
            //     : "No prescriptions created yet."
            // }
          />
        )}
      </div>

      {canManage && (
        <CreatePrescriptionModal
          isOpen={isCreateModalOpen}
          loading={loading}
          medicines={medicines}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={async (payload) => {
            await create(payload);
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default PrescriptionsPage;
