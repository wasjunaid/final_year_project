import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaFileAlt, FaUpload } from "react-icons/fa";
import DocumentsPage from "../documents/DocumentsPage";
import UploadDocumentPage from "../documents/UploadDocumentPage";

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
      return <UploadDocumentPage />;
    default:
      return <h1>Not found!</h1>;
  }
}

function FrontDeskDocumentsLayout() {
  const [page, setPage] = useState<PAGE>(PAGE.documents);

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        <TabButton
          label="Documents"
          icon={<FaFileAlt />}
          selected={page == PAGE.documents}
          onClick={() => setPage(PAGE.documents)}
        />
        <TabButton
          label="Upload Documents"
          icon={<FaUpload />}
          selected={page == PAGE.uploadDocument}
          onClick={() => setPage(PAGE.uploadDocument)}
        />
      </div>

      <div className="flex flex-1 flex-col mt-2">{renderPage(page)}</div>
    </div>
  );
}

export default FrontDeskDocumentsLayout;
