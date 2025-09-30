import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaCalendarAlt } from "react-icons/fa";
import UploadDocument from "../ehr/UploadDocument";
import DocumentsPage from "../ehr/DocumentsPage";

const PAGE = {
  documents: "documents",
  uploadDocument: "uploadDocument",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function renderPage(page: PAGE) {
  switch (page) {
    case PAGE.documents:
      return <DocumentsPage />;
    case PAGE.uploadDocument:
      return <UploadDocument />;
    default:
      return <h1>Not found!</h1>;
  }
}

function PatientDocumentsTabLayout() {
  const [page, setPage] = useState<PAGE>(PAGE.documents);

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        <TabButton
          label="Documents"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.documents}
          onClick={() => setPage(PAGE.documents)}
        />
        <TabButton
          label="Upload Documents"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.uploadDocument}
          onClick={() => setPage(PAGE.uploadDocument)}
        />
      </div>

      <div className="flex flex-1 flex-col mt-2">{renderPage(page)}</div>
    </div>
  );
}

export default PatientDocumentsTabLayout;
