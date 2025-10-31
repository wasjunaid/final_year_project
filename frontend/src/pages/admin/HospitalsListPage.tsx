import { useEffect, useState } from "react";
import { useHospital } from "../../hooks/useHospital";
import DataTable from "../../components/DataTable";

const columns = [
  { key: "hospital_id", label: "ID" },
  { key: "name", label: "Hospital Name" },
  { 
    key: "created_at", 
    label: "Created", 
    render: (row: any) => new Date(row.created_at).toLocaleDateString() 
  },
];

function HospitalsListPage() {
  const [displayHospitals, setDisplayHospitals] = useState<any[]>([]);
  
  const { 
    hospitals, 
    loading, 
    error, 
    getHospitals 
  } = useHospital();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        await getHospitals();
      } catch (err) {
        // Error handled by hook
      }
    };
    fetchHospitals();
  }, [getHospitals]);

  // Update display data when hospitals change
  useEffect(() => {
    if (hospitals.length > 0) {
      // Use only the fields you want to display
      const data = hospitals.map((h: any) => ({
        hospital_id: h.hospital_id,
        name: h.name,
        created_at: h.created_at,
      }));
      setDisplayHospitals(data);
    }
  }, [hospitals]);

  return (
    <div className="">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <DataTable columns={columns} data={displayHospitals} searchable={true} />
      )}
    </div>
  );
}

export default HospitalsListPage;
