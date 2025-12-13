import { useEffect,  useState } from "react";
import Alert from "../../components/Alert";
import Table, { type TableColumn } from "../../components/table";
import { useAuthController } from "../../hooks/auth";
import { ROLES } from "../../constants/profile";
import type { AppointmentModel } from "../../models/appointment/model";
import { Badge, StackedCell } from "../../components/TableHelpers";
import { AppointmentStatus } from "../../models/appointment/enums";
import { useAppointmentController } from "../../hooks/appointment";
import { useNavbarController } from "../../hooks/ui/navbar";
import { useSidebarController } from '../../hooks/ui/sidebar';

const statusVariantMap: Record<string, "primary" | "success" | "danger" | "warning" | "info" | "purple"> = {
  [AppointmentStatus.processing]: "info",
  [AppointmentStatus.denied]: "danger",
  [AppointmentStatus.upcoming]: "warning",
  [AppointmentStatus.in_progress]: "purple",
  [AppointmentStatus.completed]: "success",
  [AppointmentStatus.cancelled]: "danger",
};

const AppointmentsPage: React.FC = () => {
  const { role } = useAuthController();
  const [tableColumns, setTableColumns] = useState<TableColumn<AppointmentModel>[]>([]);

  const patientColumns: TableColumn<AppointmentModel>[] = [
    { header: "Hospital", key: "hospitalName", render: (row : AppointmentModel) => <StackedCell primary={row.hospitalName ?? "N/A"} secondary={`APT-${row.appointmentId}`} /> },
    { header: "Doctor", key: "doctorName", render: (row : AppointmentModel) => <StackedCell primary={row.doctorName ?? "N/A"} secondary={`ID: ${row.doctorId}`} /> },
    { header: "Time", key: "time", render: (row : AppointmentModel) => <StackedCell primary={row.date ?? "TBD"} secondary={row.time ?? "TBD"} /> },
    { header: "Status", key: "status", render: (row : AppointmentModel) => <Badge variant={statusVariantMap[row.status] || "info"}>{row.status}</Badge>, align: "center" },
  ];

  const doctorColumns: TableColumn<AppointmentModel>[] = [
    { header: "Patient", key: "patientName", render: (row : AppointmentModel) => <StackedCell primary={row.patientName ?? "N/A"} secondary={`ID: ${row.patientId}`} /> },
    { header: "Time", key: "time", render: (row : AppointmentModel) => <StackedCell primary={row.date ?? "TBD"} secondary={row.time ?? "TBD"} /> },
    { header: "Status", key: "status", render: (row : AppointmentModel) => <Badge variant={statusVariantMap[row.status] || "info"}>{row.status}</Badge>, align: "center" },
  ];

  const hospitalColumns: TableColumn<AppointmentModel>[] = [
    { header: "Doctor", key: "doctorName", render: (row : AppointmentModel) => <StackedCell primary={row.doctorName ?? "N/A"} secondary={`ID: ${row.doctorId}`} /> },
    { header: "Patient", key: "patientName", render: (row : AppointmentModel) => <StackedCell primary={row.patientName ?? "N/A"} secondary={`ID: ${row.patientId}`} /> },
    { header: "Time", key: "time", render: (row : AppointmentModel) => <StackedCell primary={row.date ?? "TBD"} secondary={row.time ?? "TBD"} /> },
    { header: "Status", key: "status", render: (row : AppointmentModel) => <Badge variant={statusVariantMap[row.status] || "info"}>{row.status}</Badge>, align: "center" },
  ];

  const { appointments, loading, error, success, fetchForPatient, fetchForDoctor, fetchForHospital } = useAppointmentController();

  const { setActiveTab } = useNavbarController();
  const { setSelectedAppointmentId } = useSidebarController();

  useEffect(() => {
    switch(role) {
      case ROLES.PATIENT: 
        setTableColumns(patientColumns);
        fetchForPatient?.()
        break;
      case ROLES.DOCTOR: 
        setTableColumns(doctorColumns);
        fetchForDoctor?.()
        break;
      case ROLES.HOSPITAL_ADMIN:
      case ROLES.HOSPITAL_SUB_ADMIN:
      case ROLES.HOSPITAL_FRONT_DESK:
        setTableColumns(hospitalColumns);
        fetchForHospital?.()
        break;
      default: 
        setTableColumns(hospitalColumns);
    }
  }, [role]);

  return (
    <>
      {error && <Alert type="error" title="Error" message="Unable to create appointment" onClose={() => {}} className="mb-4" />}
      {success && <Alert type="success" title="Success" message="Appointment created" onClose={() => {}} className="mb-4" />}
      
      <Table
        columns={tableColumns}
        data={appointments}
        loading={loading}
        itemsPerPage={10}
        onRowClick={(row: AppointmentModel) => {
          setSelectedAppointmentId(Number(row.appointmentId));
          try { setActiveTab('details'); } catch {}
        }}
      />
    </>
  );
};

export default AppointmentsPage;
