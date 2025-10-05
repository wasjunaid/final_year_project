import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaRegClipboard } from "react-icons/fa";
import AssociationRequestsPage from "../association_request/AssociationRequestsPage";
import CreateAssociationRequestPage from "../association_request/CreateAssocationRequest";
import { FaWirsindhandwerk } from "react-icons/fa6";

const PAGE = {
  associationRequests: "associationRequests",
  createAssociationRequest: "createAssociationRequest",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function renderPage(page: PAGE) {
  switch (page) {
    case PAGE.associationRequests:
      return <AssociationRequestsPage />;
    case PAGE.createAssociationRequest:
      return <CreateAssociationRequestPage />;
    default:
      return <h1>Not found!</h1>;
  }
}

function HospitalAssciationTabLayout() {
  const [page, setPage] = useState<PAGE>(PAGE.associationRequests);

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        <TabButton
          label="Requests"
          icon={<FaRegClipboard />}
          selected={page == PAGE.associationRequests}
          onClick={() => setPage(PAGE.associationRequests)}
        />
        <TabButton
          label="Create Association Request"
          icon={<FaWirsindhandwerk />}
          selected={page == PAGE.createAssociationRequest}
          onClick={() => setPage(PAGE.createAssociationRequest)}
        />
      </div>

      <div className="flex flex-1 flex-col mt-2">{renderPage(page)}</div>
    </div>
  );
}

export default HospitalAssciationTabLayout;
