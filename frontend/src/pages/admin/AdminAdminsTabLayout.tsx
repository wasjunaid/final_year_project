import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaCalendarAlt } from "react-icons/fa";
import AdminsPage from "./AdminsPage";
import CreateAdminsPage from "./CreateAdminsPage";

const PAGE = {
  admins: "admins",
  createAdmin: "createAdmins",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function renderPage(page: PAGE) {
  switch (page) {
    case PAGE.admins:
      return <AdminsPage/>
    case PAGE.createAdmin:
      return <CreateAdminsPage />;
    default:
      return <h1>Not found!</h1>;
  }
}

function AdminAdminsTabLayout() {
  const [page, setPage] = useState<PAGE>(PAGE.admins);

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        <TabButton
          label="Admins"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.admins}
          onClick={() => setPage(PAGE.admins)}
        />
        <TabButton
          label="Create Admins"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.createAdmin}
          onClick={() => setPage(PAGE.createAdmin)}
        />
      </div>

      <div className="flex flex-1 flex-col mt-2">{renderPage(page)}</div>
    </div>
  );
}

export default AdminAdminsTabLayout;
