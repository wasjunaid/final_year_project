import { FaEye, FaFileAlt } from "react-icons/fa";
import type { FC } from "react";
import type { Document } from "../../../models/Document";

type DocumentCardProps = {
  document: Document;
  isVerified: boolean;
  onView: (doc: Document) => void;
};

function formatFileSize(size?: number): string {
  if (typeof size !== "number") return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const DocumentCard: FC<DocumentCardProps> = ({ document, onView }) => {
  const isVerified = !!document.is_verified;

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-full shadow ${
              isVerified ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            <FaFileAlt
              className={isVerified ? "text-green-600" : "text-blue-600"}
              size={28}
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 truncate max-w-xs group-hover:text-blue-700 transition-colors">
              {document.original_name}
            </h3>
            <div className="flex gap-2 mt-2">
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  isVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {isVerified ? "Verified" : "Unverified"}
              </span>
              {document.document_type && (
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full capitalize">
                  {document.document_type}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onView(document)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors shadow group-hover:scale-110"
          title="View Details"
        >
          <FaEye size={18} />
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <p className="truncate italic">{document.detail}</p>

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

        <div className="flex justify-between items-center pt-3 border-t border-blue-50 mt-3">
          <span className="text-gray-400 font-mono text-xs">
            {formatFileSize(document.file_size)}
          </span>
          <span className="text-gray-400 font-mono text-xs">
            {document.created_at
              ? new Date(document.created_at).toLocaleDateString()
              : ""}
          </span>
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-10 text-blue-200 text-7xl pointer-events-none select-none">
        <FaFileAlt />
      </div>
    </div>
  );
};

export default DocumentCard;
