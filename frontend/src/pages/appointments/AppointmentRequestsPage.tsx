import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import { useUserRole } from "../../hooks/useUserRole";
import { useAppointment } from "../../hooks/useAppointment";
import { ROLES } from "../../constants/roles";
import ROUTES from "../../constants/routes";
import { type Appointment } from "../../models/Appointment";

// Status color helper function
const getStatusColor = (status: Appointment['status']): string => {
  switch (status) {
    case 'APPROVED':
      return "text-green-500";
    case 'PROCESSING':
      return "text-yellow-500";
    case 'CANCELLED':
    case 'DENIED':
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

// Columns for patient view (includes hospital name)
const patientColumns = [
  { key: "appointment_id", label: "Appointment ID" },
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
    key: "total_cost",
    label: "Total Cost",
    render: (row: Appointment) => row.total_cost ? `$${row.total_cost}` : 'N/A',
  },
  {
    key: "status",
    label: "Status",
    maxWidth: "10rem",
    render: (row: Appointment) => (
      <span className={`${getStatusColor(row.status)}`}>
        {row.status}
      </span>
    ),
  },
];

// Columns for hospital staff view (includes patient info)
const hospitalColumns = [
  { key: "appointment_id", label: "Appointment ID" },
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
  {
    key: "date",
    label: "Date",
    render: (row: Appointment) => new Date(row.date).toLocaleDateString(),
  },
  {
    key: "time",
    label: "Time",
    render: (row: Appointment) => row.time.substring(0, 5),
  },
  { key: "reason", label: "Reason" },
  {
    key: "total_cost",
    label: "Total Cost",
    render: (row: Appointment) => row.total_cost ? `$${row.total_cost}` : 'N/A',
  },
  {
    key: "status",
    label: "Status",
    render: (row: Appointment) => (
      <span className={`${getStatusColor(row.status)}`}>
        {row.status}
      </span>
    ),
  },
];

// Filter buttons
const buttons = [
  { label: "All", value: "All" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Denied", value: "DENIED" },
];

const AppointmentRequestsPage = React.memo(() => {
  const navigate = useNavigate();
  const role = useUserRole();
  
  const { 
    appointments, 
    loading, 
    error, 
    getAllPatient,
    getAllDoctor,
    getAllHospital,
  } = useAppointment();

  const [currentFilter, setCurrentFilter] = useState("All");

  // Memoized column selection based on user role
  const columns = useMemo(() => {
    return role === ROLES.PATIENT ? patientColumns : hospitalColumns;
  }, [role]);

  // Memoized row click handler
  const handleRowClick = useCallback((row: Appointment) => {
    navigate(ROUTES.APPOINTMENT_REQUEST_DETAILS, { state: row });
  }, [navigate]);

  // Filter appointments by status
  const filteredAppointments = useMemo(() => {
    if (currentFilter === "All") return appointments;
    return appointments.filter(appointment => appointment.status === currentFilter);
  }, [appointments, currentFilter]);

  // Filter handler
  const handleStatusFilter = useCallback(
    (status: string) => {
      setCurrentFilter(status);
    },
    []
  );

  // Fetch appointments based on user role
  useEffect(() => {
    const fetchRequests = async () => {
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
            console.warn("Role not supported for appointment requests");
            break;
        }
      } catch (err) {
        // Error handled by hook
      }
    };

    if (role) {
      fetchRequests();
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
        buttons={buttons}
        defaultFilter="All"
        // currentFilter={currentFilter}
        filterKey="status"
        columns={columns}
        data={filteredAppointments}
        searchable={true}
        onRowClick={handleRowClick}
        // onFilterChange={handleStatusFilter}
      />
    ) : null
  ), [loading, error, columns, filteredAppointments, handleRowClick, currentFilter, handleStatusFilter]);

  return (
    <div className="">
      {loading && loadingComponent}
      {errorComponent}
      {dataTableComponent}
    </div>
  );
});

AppointmentRequestsPage.displayName = 'AppointmentRequestsPage';

export default AppointmentRequestsPage;
