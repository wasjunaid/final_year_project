import { useEffect, useState } from "react";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import DataTable from "../../components/DataTable";

const verifiedColumns = [
  { key: "document_id", label: "ID" },
  { key: "original_name", label: "File Name" },
  { key: "mime_type", label: "Type" },
  { key: "file_size", label: "Size (bytes)" },
  { key: "created_at", label: "Uploaded At" },
  { key: "detail", label: "Detail" },
  { key: "uploaded_by_first_name", label: "Uploaded By" },
  { key: "lab_test_name", label: "Lab Test" },
];

const unverifiedColumns = [
  { key: "document_id", label: "ID" },
  { key: "original_name", label: "File Name" },
  { key: "mime_type", label: "Type" },
  { key: "file_size", label: "Size (bytes)" },
  { key: "created_at", label: "Uploaded At" },
  { key: "document_type", label: "Type" },
  { key: "detail", label: "Detail" },
];

function DocumentsPage() {
  const [verifiedDocs, setVerifiedDocs] = useState<any[]>([]);
  const [unverifiedDocs, setUnverifiedDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(EndPoints.documents.get);
        setVerifiedDocs(res.data.data?.verified_documents || []);
        setUnverifiedDocs(res.data.data?.unverified_documents || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <div className="">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Verified Documents</h3>
            <DataTable columns={verifiedColumns} data={verifiedDocs} searchable={true} />
            {verifiedDocs.length === 0 && (
              <div className="text-gray-500 mt-2">No verified documents found.</div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Unverified Documents</h3>
            <DataTable columns={unverifiedColumns} data={unverifiedDocs} searchable={true} />
            {unverifiedDocs.length === 0 && (
              <div className="text-gray-500 mt-2">No unverified documents found.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DocumentsPage;