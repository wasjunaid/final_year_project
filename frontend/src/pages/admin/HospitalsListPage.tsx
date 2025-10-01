import { useEffect, useState } from "react";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import DataTable from "../../components/DataTable";

const columns = [
  { key: "hospital_id", label: "ID" },
  { key: "name", label: "Hospital Name" },
  { key: "address", label: "Address" },
];

function HospitalsListPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(EndPoints.hospital.get);

        console.log(`Response: ${res.data.data}`);
        // Use only the fields you want to display
        const data = (res.data.data || []).map((h: any) => ({
          hospital_id: h.hospital_id,
          name: h.name,
          address: h.address,
        }));
        setHospitals(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load hospitals");
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  return (
    <div className="">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <DataTable columns={columns} data={hospitals} searchable={true} />
      )}
    </div>
  );
}

export default HospitalsListPage;
