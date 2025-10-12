import { useMemo, useState } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import Button from "../../components/Button";
import DataTable, {
  type IDataTableColumnProps,
} from "../../components/DataTable";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import useMedicine from "../../hooks/useMedicine";
import UpdateMedicineModal from "./components/UpdateMedicineModal";
import type { Medicine } from "../../models/Medicine";
import CreateMedicineModal from "./components/CreateMedicineModal";

function MedicinesListPage() {
  const role = useUserRole();
  const { items, loading, error, success, create, update, clearMessages } =
    useMedicine();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const canManage = role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;

  const columns = useMemo<IDataTableColumnProps<Medicine>[]>(
    () => [
      {
        key: "medicine_id",
        label: "ID",
        render: (row) => (
          <span className="font-mono text-sm text-gray-600">
            #{row.medicine_id}
          </span>
        ),
      },
      {
        key: "name",
        label: "Name",
        render: (row) => (
          <span className="font-semibold text-gray-900">{row.name}</span>
        ),
      },
      {
        key: "created_at",
        label: "Created",
        render: (row) =>
          row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
      },
      {
        key: "updated_at",
        label: "Updated",
        render: (row) =>
          row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—",
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) =>
          canManage ? (
            <Button
              label="Edit"
              icon={<FaEdit />}
              size="xs"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                setEditingMedicine(row);
              }}
            />
          ) : (
            "—"
          ),
      },
    ],
    [canManage]
  );

  if (!canManage) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-4">
          Access denied. Only super admins and admins can manage medicines.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Medicines</h1>
            <p className="text-sm text-gray-500">
              Manage system-wide medicines available for prescriptions.
            </p>
          </div>
        </div>
        <Button
          label="Add Medicine"
          icon={<FaPlus />}
          size="sm"
          onClick={() => {
            clearMessages();
            setIsCreateModalOpen(true);
          }}
        />
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
        <DataTable
          columns={columns}
          data={items}
          //   loading={loading}
          searchable
          //   emptyMessage="No medicines found. Add some medicines to get started."
        />
      </div>

      <CreateMedicineModal
        isOpen={isCreateModalOpen}
        loading={loading}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (payload) => {
          await create(payload);
          setIsCreateModalOpen(false);
        }}
      />

      {editingMedicine && (
        <UpdateMedicineModal
          isOpen={!!editingMedicine}
          medicine={editingMedicine}
          loading={loading}
          onClose={() => setEditingMedicine(null)}
          onSubmit={async (payload) => {
            await update(payload);
            setEditingMedicine(null);
          }}
        />
      )}
    </div>
  );
}

export default MedicinesListPage;
