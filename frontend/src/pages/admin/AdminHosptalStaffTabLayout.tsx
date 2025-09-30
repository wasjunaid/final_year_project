import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaCalendarAlt } from "react-icons/fa";
import HospitalStaffPage from "./HospitalStaffPage";
import CreateHospitalStaffPage from "./CreateHospitalStaffPage";

const PAGE = {
  staff: "Staff",
  createHospitalStaff: "createHospitalStaff",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function renderPage(page: PAGE) {
  switch (page) {
    case PAGE.staff:
      return <HospitalStaffPage />;
    case PAGE.createHospitalStaff:
      return <CreateHospitalStaffPage />;
    default:
      return <h1>Not found!</h1>;
  }
}

function AdminHospitalStaffTabLayout() {
  const [page, setPage] = useState<PAGE>(PAGE.staff);

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        <TabButton
          label="Staff"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.staff}
          onClick={() => setPage(PAGE.staff)}
        />
        <TabButton
          label="Create Hospital Staff"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.createHospitalStaff}
          onClick={() => setPage(PAGE.createHospitalStaff)}
        />
      </div>

      <div className="flex flex-1 flex-col mt-2">{renderPage(page)}</div>
    </div>
  );
}

export default AdminHospitalStaffTabLayout;
