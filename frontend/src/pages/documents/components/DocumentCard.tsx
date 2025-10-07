import { FaEye, FaFileAlt } from "react-icons/fa";
import type { Document } from "../../../models/Document";

interface DocumentCardProps {
  document: Document;
  isVerified: boolean;
  onView: (doc: Document) => void;
}

export function DocumentCard({
  document,
  isVerified,
  onView,
}: DocumentCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              isVerified ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            <FaFileAlt
              className={isVerified ? "text-green-600" : "text-blue-600"}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 truncate max-w-xs">
              {document.original_name}
            </h3>
            <div className="flex gap-2 mt-1">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  isVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {isVerified ? "Verified" : "Unverified"}
              </span>
              {document.document_type && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full capitalize">
                  {document.document_type}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onView(document)}
          className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          title="View Details"
        >
          <FaEye />
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p className="truncate">{document.detail}</p>

        {isVerified && document.uploaded_by_first_name && (
          <p>
            <span className="font-medium">Uploaded by:</span>{" "}
            {document.uploaded_by_first_name} {document.uploaded_by_last_name}
          </p>
        )}

        {isVerified && document.lab_test_name && (
          <p>
            <span className="font-medium">Lab Test:</span>{" "}
            {document.lab_test_name}
          </p>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-gray-500">
            {formatFileSize(document.file_size)}
          </span>
          <span className="text-gray-500">
            {new Date(document.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
