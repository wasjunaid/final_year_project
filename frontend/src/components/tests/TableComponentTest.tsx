import DataTable from "../DataTable";

const columns = [
  { key: "claimId", label: "Claim ID" },
  { key: "lastUpdated", label: "Last Updated" },
  { key: "claim", label: "Claim" },
  { key: "paid", label: "Paid" },
  { key: "outstanding", label: "Outstanding" },
  {
    key: "status",
    label: "Status",
    render: (row: any) => {
      const colorMap: Record<string, string> = {
        Pending: "text-yellow-500",
        Paid: "text-green-500",
        Partial: "text-blue-500",
        Rejected: "text-red-500",
      };
      return <span className={colorMap[row.status]}>{row.status}</span>;
    },
  },
];

//filter button will only work if there is a field named "status"
const data = [
  {
    claimId: "Document #123",
    lastUpdated: "22 Sep, 2025 10:24 PM",
    claim: "$1000",
    paid: "$0",
    outstanding: "$1000",
    status: "Pending",
  },
  {
    claimId: "Document #123",
    lastUpdated: "22 Sep, 2025 10:24 PM",
    claim: "$1000",
    paid: "$1000",
    outstanding: "$0",
    status: "Paid",
  },
  {
    claimId: "Document #123",
    lastUpdated: "22 Sep, 2025 10:24 PM",
    claim: "$1000",
    paid: "$800",
    outstanding: "$200",
    status: "Partial",
  },
  {
    claimId: "Document #123",
    lastUpdated: "22 Sep, 2025 10:24 PM",
    claim: "$1000",
    paid: "$0",
    outstanding: "$200",
    status: "Rejected",
  },
  {
    claimId: "Document #123",
    lastUpdated: "22 Sep, 2025 10:24 PM",
    claim: "$1000",
    paid: "$800",
    outstanding: "$200",
    status: "Partial",
  },
];

const buttons = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "Paid", value: "Paid" },
  { label: "Partial", value: "Partial" },
  { label: "Rejected", value: "Rejected" },
];

function TableComponentTest() {
  return (
    <div className="flex h-screen justify-center items-center">
      <DataTable
        columns={columns}
        data={data}
        buttons={buttons}
        searchable={true}
        onRowClick={(row) =>
          alert(`You clicked ${row.claimId} (${row.status})`)
        }
      />
    </div>
  );
}

export default TableComponentTest;
