import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaPaperPlane } from "react-icons/fa";
import EHRAccessRequestsPage from "../ehr/EHRAccessRequestsPage";
import { useUserRole } from "../../hooks/useUserRole";
import { ROLES } from "../../constants/roles";
import CreateEHRAccessRequestPage from "../ehr/CreateEHRAccessRequestPage";

const PAGE = {
  requests: "requests",
  createRequests: "createRequests",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function renderPage(page: PAGE) {
  switch (page) {
    case PAGE.requests:
      return <EHRAccessRequestsPage />;
    case PAGE.createRequests:
      return <CreateEHRAccessRequestPage />;
    default:
      return <h1>Not found!</h1>;
  }
}

function PatientEHRTabLayout() {
  const role = useUserRole();
  const [page, setPage] = useState<PAGE>(PAGE.requests);

  const isPatient = role === ROLES.PATIENT;
  const isDoctor = role === ROLES.DOCTOR;

  // Only patients and doctors can access EHR features
  if (!isPatient && !isDoctor) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-500">
          <p className="text-lg mb-2">Access Denied</p>
          <p>Only patients and doctors can access EHR features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        <TabButton
          label="Access Requests"
          icon={<FaPaperPlane />}
          selected={page == PAGE.requests}
          onClick={() => setPage(PAGE.requests)}
        />
        <TabButton
          label="Create Access Requests"
          icon={<FaPaperPlane />}
          selected={page == PAGE.createRequests}
          onClick={() => setPage(PAGE.createRequests)}
        />
      </div>

      <div className="flex flex-1 flex-col mt-2">{renderPage(page)}</div>
    </div>
  );
}

export default PatientEHRTabLayout;
