import { useState } from "react";
import TabButton from "../../components/TabButton";
import { FaCalendarAlt } from "react-icons/fa";
import HospitalsListPage from "./HospitalsListPage";
import LogsPage from "../logs/LogsPage";

const PAGE = {
  logs: "logs",
} as const;
type PAGE = (typeof PAGE)[keyof typeof PAGE];

function renderPage(page: PAGE) {
  switch (page) {
    case PAGE.logs:
      return <LogsPage/>
    default:
      return <h1>Not found!</h1>;
  }
}

function AdminDataSharingTabLayout() {
  const [page, setPage] = useState<PAGE>(PAGE.logs);

  return (
    <div className="px-5 py-2">
      <div className="flex gap-2">
        <TabButton
          label="Logs"
          icon={<FaCalendarAlt />}
          selected={page == PAGE.logs}
          onClick={() => setPage(PAGE.logs)}
        />
      </div>

      <div className="flex flex-1 flex-col mt-2">{renderPage(page)}</div>
    </div>
  );
}

export default AdminDataSharingTabLayout;
