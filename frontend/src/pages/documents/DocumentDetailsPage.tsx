import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaDownload,
  FaFileAlt,
  FaUser,
  FaFlask,
} from "react-icons/fa";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import ROUTES from "../../constants/routes";
import { type Document } from "../../models/Document";

function DocumentDetailsPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [document, setDocument] = useState<Document | null>(
    location.state?.document || null
  );
  const [loading, setLoading] = useState(!document);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!document && documentId) {
      fetchDocumentDetails();
    }
  }, [documentId, document]);

  const fetchDocumentDetails = async () => {
    if (!documentId) return;

    setLoading(true);
    setError("");

    try {
      // Since backend doesn't have individual document endpoint,
      // we fetch all documents and find the specific one
      const res = await api.get(EndPoints.documents.get);
      const { verified_documents, unverified_documents } = res.data.data;

      const allDocs = [...verified_documents, ...unverified_documents];
      const foundDoc = allDocs.find((doc) => doc.document_id === documentId);

      if (foundDoc) {
        setDocument(foundDoc);
      } else {
        setError("Document not found");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load document details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      // Note: Backend would need a download endpoint
      // For now, this is a placeholder
      console.log("Download functionality needs backend endpoint");
      // const response = await api.get(`/document/download/${document.document_id}`, {
      //   responseType: 'blob'
      // });
      //
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', document.original_name);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isVerified = document?.uploaded_by_first_name ? true : false;

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading document details...</div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-red-500">
            <p className="text-lg mb-2">Error</p>
            <p>{error || "Document not found"}</p>
            <Button
              label="Go Back"
              onClick={() => navigate(ROUTES.DOCUMENTS)}
              className="mt-4"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(ROUTES.DOCUMENTS)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {document.original_name}
            </h1>
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
          <Button
            label="Download"
            icon={<FaDownload />}
            onClick={handleDownload}
            variant="secondary"
          />
        </div>

        {/* Document Preview Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-full ${
                  isVerified ? "bg-green-100" : "bg-blue-100"
                }`}
              >
                <FaFileAlt
                  className={`text-2xl ${
                    isVerified ? "text-green-600" : "text-blue-600"
                  }`}
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Document Information
                </h2>
                <p className="text-gray-600">File details and metadata</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* File Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">File Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Name:</span>
                    <span className="font-medium">
                      {document.original_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size:</span>
                    <span className="font-medium">
                      {formatFileSize(document.file_size)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Type:</span>
                    <span className="font-medium">{document.mime_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Upload Date:</span>
                    <span className="font-medium">
                      {new Date(document.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              {isVerified && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">
                    Medical Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    {document.uploaded_by_first_name && (
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="text-gray-600">Uploaded by:</span>
                        <span className="font-medium">
                          {document.uploaded_by_first_name}{" "}
                          {document.uploaded_by_last_name}
                        </span>
                      </div>
                    )}

                    {document.lab_test_name && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FaFlask className="text-gray-400" />
                          <span className="font-medium">
                            Lab Test: {document.lab_test_name}
                          </span>
                        </div>
                        {document.lab_test_description && (
                          <p className="text-gray-600 ml-6">
                            {document.lab_test_description}
                          </p>
                        )}
                        {document.lab_test_cost && (
                          <p className="text-gray-600 ml-6">
                            Cost: ${document.lab_test_cost}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Description */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <h3 className="font-medium text-gray-900 mb-3">
              Document Description
            </h3>
            <p className="text-gray-700 leading-relaxed">{document.detail}</p>
          </div>
        </div>

        {/* PDF Viewer Placeholder */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-6">
          <div className="p-6">
            <h3 className="font-medium text-gray-900 mb-3">Document Preview</h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">PDF Preview</p>
              <p className="text-sm text-gray-500">
                PDF viewer integration would be implemented here
              </p>
              <Button
                label="Download to View"
                onClick={handleDownload}
                className="mt-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentDetailsPage;
