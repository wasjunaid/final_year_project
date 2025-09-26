import DataTable from "../../components/DataTable";

const columns = [
  { key: "doctor", label: "Doctor" },
  { key: "hospital", label: "Hospital" },
  { key: "dateIn", label: "Date In" },
  { key: "symptoms", label: "Symptoms" },
  {
    key: "status",
    label: "Status",
    render: (row: any) => {
      const colorMap: Record<string, string> = {
        Pending: "text-yellow-500",
        Confirmed: "text-green-500",
        Cancelled: "text-red-500",
      };
      return <span className={colorMap[row.status]}>{row.status}</span>;
    },
  },
  { key: "ehrAccess", label: "EHR Access" },
];

// Dummy data
const data = [
  {
    doctor: "Dr. Smith",
    hospital: "City Hospital",
    dateIn: "22 Sep, 2025 10:24 AM",
    symptoms: "Fever, Cough",
    status: "Pending",
    ehrAccess: "Granted",
  },
  {
    doctor: "Dr. Adams",
    hospital: "Green Valley Clinic",
    dateIn: "21 Sep, 2025 02:00 PM",
    symptoms: "Headache, Nausea",
    status: "Confirmed",
    ehrAccess: "Granted",
  },
  {
    doctor: "Dr. Lee",
    hospital: "Downtown Medical Center",
    dateIn: "20 Sep, 2025 09:15 AM",
    symptoms: "Chest Pain",
    status: "Cancelled",
    ehrAccess: "Revoked",
  },
  {
    doctor: "Dr. Patel",
    hospital: "Community Health",
    dateIn: "19 Sep, 2025 11:30 AM",
    symptoms: "Back Pain",
    status: "Pending",
    ehrAccess: "Granted",
  },
  {
    doctor: "Dr. Khan",
    hospital: "General Hospital",
    dateIn: "18 Sep, 2025 04:45 PM",
    symptoms: "Fatigue, Dizziness",
    status: "Confirmed",
    ehrAccess: "Granted",
  },
];

const buttons = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Cancelled", value: "Cancelled" },
];

function AppointmentsPage() {
  return (
    <div className="flex h-screen justify-center  ">
      <DataTable
        columns={columns}
        data={data}
        buttons={buttons}
        searchable={true}
        onRowClick={(row) =>
          alert(`You clicked appointment with ${row.doctor} (${row.status})`)
        }
      />
    </div>
  );
}

export default AppointmentsPage;
