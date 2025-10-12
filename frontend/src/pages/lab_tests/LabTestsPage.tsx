import { useMemo, useState } from "react";
import { FaArrowLeft, FaFlask, FaPlus } from "react-icons/fa";
import Button from "../../components/Button";
import DataTable, {
  type IDataTableColumnProps,
} from "../../components/DataTable";
import { useLabTest } from "../../hooks/useLabTest";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import CreateLabTestModal from "./components/CreateLabTestModal";
import type { LabTest } from "../../models/LabTest";

function LabTestDetails({
  test,
  onBack,
}: {
  test: LabTest;
  onBack: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <FaFlask className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{test.name}</h2>
            {test.category && (
              <p className="text-sm text-gray-500">Category: {test.category}</p>
            )}
          </div>
        </div>
        <Button
          label="Back to list"
          icon={<FaArrowLeft />}
          variant="secondary"
          size="sm"
          onClick={onBack}
        />
      </div>

      {typeof test.cost !== "undefined" && (
        <div>
          <h3 className="font-medium text-gray-700">Cost</h3>
          <p className="text-gray-900">{`$${Number(test.cost).toFixed(2)}`}</p>
        </div>
      )}

      {test.description && (
        <div>
          <h3 className="font-medium text-gray-700">Description</h3>
          <p className="text-gray-600 whitespace-pre-line">
            {test.description}
          </p>
        </div>
      )}

      {test.preparation && (
        <div>
          <h3 className="font-medium text-gray-700">Preparation</h3>
          <p className="text-gray-600 whitespace-pre-line">
            {test.preparation}
          </p>
        </div>
      )}
    </div>
  );
}

function LabTestsPage() {
  const role = useUserRole();
  const { items, loading, error, success, create, clearMessages } =
    useLabTest();

  const [selected, setSelected] = useState<LabTest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage =
    role === ROLES.HOSPITAL_ADMIN ||
    role === ROLES.HOSPITAL_SUB_ADMIN ||
    role === ROLES.HOSPITAL_LAB_TECHNICIAN;

  const columns = useMemo<IDataTableColumnProps<LabTest>[]>(
    () => [
      {
        key: "name",
        label: "Name",
        render: (row) => (
          <span className="font-medium text-gray-900">{row.name}</span>
        ),
      },
      {
        key: "category",
        label: "Category",
        render: (row) => row.category ?? "—",
      },
      {
        key: "cost",
        label: "Cost",
        render: (row) =>
          typeof row.cost !== "undefined"
            ? `$${Number(row.cost).toFixed(2)}`
            : "—",
      },
      {
        key: "created_at",
        label: "Created",
        render: (row) =>
          row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
      },
    ],
    []
  );

  if (!canManage) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-4">
          You do not have permission to manage lab tests.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Lab Tests</h1>
          <p className="text-sm text-gray-500">
            Manage the lab tests available at your hospital.
          </p>
        </div>
        <Button
          label="Create Lab Test"
          icon={<FaPlus />}
          size="sm"
          onClick={() => {
            clearMessages();
            setIsModalOpen(true);
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
        {selected ? (
          <LabTestDetails test={selected} onBack={() => setSelected(null)} />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            // loading={loading}
            searchable
            onRowClick={(row) => setSelected(row)}
            // emptyMessage="No lab tests available."
          />
        )}
      </div>

      <CreateLabTestModal
        isOpen={isModalOpen}
        loading={loading}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (payload) => {
          await create(payload);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

export default LabTestsPage;
