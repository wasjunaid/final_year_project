import React, { useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, {
  type IDataTableColumnProps,
} from "../../components/DataTable";
import { useUserRole } from "../../hooks/useUserRole";
import { useAppointment } from "../../hooks/useAppointment";
import { ROLES } from "../../constants/roles";
import { type Appointment } from "../../models/Appointment";
import ROUTES from "../../constants/routes";

// Status color helper function (memoized)
const getStatusColor = (status: Appointment['status']): string => {
  switch (status) {
    case 'APPROVED':
      return "text-blue-500";
    case 'COMPLETED':
      return "text-green-500";
    case 'CANCELLED':
    case 'DENIED':
      return "text-red-500";
    case 'IN_PROGRESS':
      return "text-yellow-500";
    case 'PROCESSING':
      return "text-orange-500";
    case 'RESCHEDULED':
      return "text-purple-500";
    default:
      return "text-gray-500";
  }
};

// Base columns used in all views
const baseColumns = [
  { key: "appointment_id", label: "ID" },
  {
    key: "date",
    label: "Date",
    render: (row: Appointment) => new Date(row.date).toLocaleDateString(),
  },
  {
    key: "time",
    label: "Time",
    render: (row: Appointment) => row.time.substring(0, 5), // Show only HH:MM
  },
  { key: "reason", label: "Reason" },
  {
    key: "status",
    label: "Status",
    maxWidth: "10rem",
    render: (row: Appointment) => (
      <span className={getStatusColor(row.status)}>{row.status}</span>
    ),
  },
  { 
    key: "total_cost", 
    label: "Total Cost", 
    render: (row: Appointment) => `$${row.total_cost}` 
  },
];

// Patient columns (show doctor and hospital info)
const patientColumns: IDataTableColumnProps<Appointment>[] = [
  ...baseColumns,
  {
    key: "hospital",
    label: "Hospital",
    render: (row: Appointment) => row.hospital_name || `Hospital #${row.hospital_id}`,
  },
  {
    key: "doctor",
    label: "Doctor",
    render: (row: Appointment) => row.doctor_name || `Doctor #${row.doctor_id}`,
  },
];

// Doctor columns (show patient and hospital info)
const doctorColumns: IDataTableColumnProps<Appointment>[] = [
  ...baseColumns,
  {
    key: "patient",
    label: "Patient",
    render: (row: Appointment) => row.patient_name || `Patient #${row.patient_id}`,
  },
  {
    key: "hospital",
    label: "Hospital",
    render: (row: Appointment) => row.hospital_name || `Hospital #${row.hospital_id}`,
  },
];

// Hospital staff columns (show patient and doctor info)
const hospitalColumns: IDataTableColumnProps<Appointment>[] = [
  ...baseColumns,
  {
    key: "patient",
    label: "Patient",
    render: (row: Appointment) => row.patient_name || `Patient #${row.patient_id}`,
  },
  {
    key: "doctor",
    label: "Doctor", 
    render: (row: Appointment) => row.doctor_name || `Doctor #${row.doctor_id}`,
  },
];

// Filter buttons
const buttons = [
  { label: "All", value: "All" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Approved", value: "APPROVED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Denied", value: "DENIED" },
  { label: "Rescheduled", value: "RESCHEDULED" },
];

const AppointmentsPage = React.memo(() => {
  const role = useUserRole();
  const navigate = useNavigate();
  
  const { 
    appointments, 
    loading, 
    error, 
    getAllPatient, 
    getAllDoctor, 
    getAllHospital 
  } = useAppointment();

  // Memoized column selection based on user role
  const columns = useMemo((): IDataTableColumnProps<Appointment>[] => {
    switch (role) {
      case ROLES.PATIENT:
        return patientColumns;
      case ROLES.DOCTOR:
        return doctorColumns;
      case ROLES.HOSPITAL_ADMIN:
      case ROLES.HOSPITAL_SUB_ADMIN:
      case ROLES.HOSPITAL_FRONT_DESK:
        return hospitalColumns;
      default:
        return patientColumns;
    }
  }, [role]);

  // Memoized row click handler
  const handleRowClick = useCallback((row: Appointment) => {
    navigate(ROUTES.APPOINTMENT_DETAIL, { state: row });
  }, [navigate]);

  // Fetch appointments based on user role
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        switch (role) {
          case ROLES.PATIENT:
            await getAllPatient();
            break;
          case ROLES.DOCTOR:
            await getAllDoctor();
            break;
          case ROLES.HOSPITAL_ADMIN:
          case ROLES.HOSPITAL_SUB_ADMIN:
          case ROLES.HOSPITAL_FRONT_DESK:
            await getAllHospital();
            break;
          default:
            console.warn("Role not supported for appointments");
            break;
        }
      } catch (err) {
        // Error handled by hook
      }
    };

    if (role) {
      fetchAppointments();
    }
  }, [role, getAllPatient, getAllDoctor, getAllHospital]);

  // Memoized loading state
  const loadingComponent = useMemo(() => (
    <div className="flex justify-center items-center">Loading...</div>
  ), []);

  // Memoized error state
  const errorComponent = useMemo(() => (
    error ? <div className="text-red-500 mb-4">{error}</div> : null
  ), [error]);

  // Memoized data table
  const dataTableComponent = useMemo(() => (
    !loading && !error ? (
      <DataTable
        columns={columns}
        data={appointments}
        buttons={buttons}
        defaultFilter="All"
        filterKey="status"
        searchable={true}
        onRowClick={handleRowClick}
      />
    ) : null
  ), [loading, error, columns, appointments, handleRowClick]);

  return (
    <div className="flex justify-center">
      {loading && loadingComponent}
      {errorComponent}
      {dataTableComponent}
    </div>
  );
});

AppointmentsPage.displayName = 'AppointmentsPage';

export default AppointmentsPage;
