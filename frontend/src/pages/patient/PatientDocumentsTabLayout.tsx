import { useState, useCallback, useMemo } from "react";
import TabButton from "../../components/TabButton";
import { FaFileAlt, FaUpload } from "react-icons/fa";
import DocumentsPage from "../documents/DocumentsPage";
import UploadDocumentPage from "../documents/UploadDocumentPage";

const PAGE = {
  documents: "documents",
  uploadDocument: "uploadDocument",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function PatientDocumentsTabLayout() {
  const [page, setPage] = useState<PAGE>(PAGE.documents);

  // Memoize page rendering to prevent unnecessary re-renders
  const renderPage = useCallback((currentPage: PAGE) => {
    switch (currentPage) {
      case PAGE.documents:
        return <DocumentsPage />;
      case PAGE.uploadDocument:
        return <UploadDocumentPage />;
      default:
        return <h1>Not found!</h1>;
    }
  }, []);

  // Memoize tab buttons to prevent unnecessary re-creation
  const tabButtons = useMemo(() => [
    {
      label: "Documents",
      icon: <FaFileAlt />,
      page: PAGE.documents,
    },
    {
      label: "Upload Documents",
      icon: <FaUpload />,
      page: PAGE.uploadDocument,
    },
  ], []);

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        {tabButtons.map((button) => (
          <TabButton
            key={button.page}
            label={button.label}
            icon={button.icon}
            selected={page === button.page}
            onClick={() => setPage(button.page)}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col mt-2">{renderPage(page)}</div>
    </div>
  );
}

export default PatientDocumentsTabLayout;
