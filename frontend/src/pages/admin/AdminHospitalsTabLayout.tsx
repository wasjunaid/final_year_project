import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaCalendarAlt } from "react-icons/fa";
import { CreateHospitalPage } from "./CreateHospitalPage";
import HospitalsListPage from "./HospitalsListPage";

const PAGE = {
  hospitals: "hospitals",
  appointmentRequests: "appointmentRequests",
  createHospitals: "createHospitals",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function renderPage(page: PAGE) {
  switch (page) {
    case PAGE.hospitals:
      return <HospitalsListPage/>
    case PAGE.createHospitals:
      return <CreateHospitalPage />;
    default:
      return <h1>Not found!</h1>;
  }
}

function AdminHospitalsTabLayout() {
  const [page, setPage] = useState<PAGE>(PAGE.hospitals);

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        <TabButton
          label="Hospitals"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.hospitals}
          onClick={() => setPage(PAGE.hospitals)}
        />
        <TabButton
          label="Create Hospital"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.createHospitals}
          onClick={() => setPage(PAGE.createHospitals)}
        />
      </div>

      <div className="flex flex-1 flex-col mt-2">{renderPage(page)}</div>
    </div>
  );
}

export default AdminHospitalsTabLayout;
