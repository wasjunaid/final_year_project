// import { useEffect, useState, useCallback } from "react";
// import Alert from "../../components/Alert";
// import Table, { type TableColumn } from "../../components/Table";
// import { useAuthController } from "../../hooks/auth";
// import { ROLES } from "../../constants/profile";
// import type { AppointmentModel } from "../../models/appointment/model";
// import type { BillModel } from "../../models/bill";
// import { Badge, StackedCell } from "../../components/TableHelpers";
// import { AppointmentStatus } from "../../models/appointment/enums";
// import { useAppointmentController } from "../../hooks/appointment";
// import { ClaimStatus } from "../../models/bill/model";
// import Button from "../../components/Button";
// import PayBillModal from "./components/PayBillModal";
// import { billRepository } from "../../repositories/bill";

// const claimStatusVariantMap: Record<string, "primary" | "success" | "danger" | "warning"> = {
//   [ClaimStatus.PENDING]: "warning",
//   [ClaimStatus.APPROVED]: "success",
//   [ClaimStatus.REJECTED]: "danger",
// };

// interface AppointmentWithBill extends AppointmentModel {
//   bill?: BillModel | null;
// }

// const BillsPage: React.FC = () => {
//   const { role } = useAuthController();
//   const [tableColumns, setTableColumns] = useState<TableColumn<AppointmentWithBill>[]>([]);
//   const [appointmentsWithBills, setAppointmentsWithBills] = useState<AppointmentWithBill[]>([]);
//   const [selectedBill, setSelectedBill] = useState<BillModel | null>(null);
//   const [showPayModal, setShowPayModal] = useState(false);
//   const [isFetchingBills, setIsFetchingBills] = useState(false);

//   const { appointments, loading: appointmentsLoading, fetchForPatient, fetchForDoctor, fetchForHospital } = useAppointmentController();

//   // Fetch appointments based on role
//   useEffect(() => {
//     switch(role) {
//       case ROLES.PATIENT:
//         fetchForPatient?.();
//         break;
//       case ROLES.DOCTOR:
//         fetchForDoctor?.();
//         break;
//       case ROLES.HOSPITAL_ADMIN:
//       case ROLES.HOSPITAL_SUB_ADMIN:
//       case ROLES.HOSPITAL_FRONT_DESK:
//         fetchForHospital?.();
//         break;
//     }
//   }, [role]);

//   // Fetch bills for completed appointments
//   const fetchBills = useCallback(async () => {
//     if (isFetchingBills || appointments.length === 0) return;
    
//     setIsFetchingBills(true);
//     try {
//       const completedAppointments = appointments.filter(
//         apt => apt.status === AppointmentStatus.completed
//       );

//       const appointmentsWithBillsData = await Promise.all(
//         completedAppointments.map(async (apt) => {
//           try {
//             const bill = await billRepository.getBillByAppointmentId(apt.appointmentId);
//             return { ...apt, bill };
//           } catch {
//             return { ...apt, bill: null };
//           }
//         })
//       );

//       setAppointmentsWithBills(appointmentsWithBillsData);
//     } finally {
//       setIsFetchingBills(false);
//     }
//   }, [appointments, isFetchingBills]);

//   useEffect(() => {
//     fetchBills();
//   }, [fetchBills]);

//   // Define columns based on role
//   useEffect(() => {
//     const patientColumns: TableColumn<AppointmentWithBill>[] = [
//       { 
//         header: "Hospital", 
//         key: "hospitalName", 
//         render: (row) => <StackedCell primary={row.hospitalName ?? "N/A"} secondary={`APT-${row.appointmentId}`} /> 
//       },
//       { 
//         header: "Doctor", 
//         key: "doctorName", 
//         render: (row) => <StackedCell primary={row.doctorName ?? "N/A"} secondary={row.date ?? "N/A"} /> 
//       },
//       { 
//         header: "Amount", 
//         key: "amount", 
//         render: (row) => <span className="font-semibold">${row.bill?.amount.toFixed(2) ?? '0.00'}</span>,
//         align: "right" as const
//       },
//       { 
//         header: "Payment Status", 
//         key: "isPaid", 
//         render: (row) => (
//           <Badge variant={row.bill?.isPaid ? "success" : "warning"}>
//             {row.bill?.isPaid ? "Paid" : "Unpaid"}
//           </Badge>
//         ),
//         align: "center" as const
//       },
//       { 
//         header: "Claim Status", 
//         key: "claimStatus", 
//         render: (row) => {
//           if (!row.bill?.isClaim) return <span className="text-gray-500">N/A</span>;
//           return (
//             <Badge variant={claimStatusVariantMap[row.bill.claimStatus || ''] || "primary"}>
//               {row.bill.claimStatus}
//             </Badge>
//           );
//         },
//         align: "center" as const
//       },
//       {
//         header: "Actions",
//         key: "actions",
//         render: (row) => {
//           const needsPayment = row.bill && !row.bill.isPaid && 
//             row.bill.isClaim && 
//             (row.bill.claimStatus === ClaimStatus.REJECTED || row.bill.claimStatus === ClaimStatus.PENDING);
          
//           return needsPayment ? (
//             <Button
//               size="sm"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 if (row.bill) {
//                   setSelectedBill(row.bill);
//                   setShowPayModal(true);
//                 }
//               }}
//             >
//               Pay Now
//             </Button>
//           ) : null;
//         },
//         align: "center" as const
//       }
//     ];

//     const hospitalColumns: TableColumn<AppointmentWithBill>[] = [
//       { 
//         header: "Patient", 
//         key: "patientName", 
//         render: (row) => <StackedCell primary={row.patientName ?? "N/A"} secondary={`ID: ${row.patientId}`} /> 
//       },
//       { 
//         header: "Doctor", 
//         key: "doctorName", 
//         render: (row) => <StackedCell primary={row.doctorName ?? "N/A"} secondary={row.date ?? "N/A"} /> 
//       },
//       { 
//         header: "Amount", 
//         key: "amount", 
//         render: (row) => <span className="font-semibold">${row.bill?.amount.toFixed(2) ?? '0.00'}</span>,
//         align: "right" as const
//       },
//       { 
//         header: "Payment Status", 
//         key: "isPaid", 
//         render: (row) => (
//           <Badge variant={row.bill?.isPaid ? "success" : "warning"}>
//             {row.bill?.isPaid ? "Paid" : "Unpaid"}
//           </Badge>
//         ),
//         align: "center" as const
//       },
//       { 
//         header: "Claim Status", 
//         key: "claimStatus", 
//         render: (row) => {
//           if (!row.bill?.isClaim) return <span className="text-gray-500">Direct Payment</span>;
//           return (
//             <Badge variant={claimStatusVariantMap[row.bill.claimStatus || ''] || "primary"}>
//               {row.bill.claimStatus}
//             </Badge>
//           );
//         },
//         align: "center" as const
//       },
//       {
//         header: "Transaction",
//         key: "transaction",
//         render: (row) => {
//           if (!row.bill?.transactionHash) return <span className="text-gray-500">-</span>;
//           return (
//             <span className="text-xs text-blue-600 truncate max-w-[120px] block">
//               {row.bill.transactionHash.substring(0, 10)}...
//             </span>
//           );
//         },
//         align: "center" as const
//       }
//     ];

//     switch(role) {
//       case ROLES.PATIENT:
//         setTableColumns(patientColumns);
//         break;
//       case ROLES.HOSPITAL_ADMIN:
//       case ROLES.HOSPITAL_SUB_ADMIN:
//       case ROLES.HOSPITAL_FRONT_DESK:
//         setTableColumns(hospitalColumns);
//         break;
//       default:
//         setTableColumns(hospitalColumns);
//     }
//   }, [role]);

//   return (
//     <>
//       <div className="mb-4">
//         <h2 className="text-xl font-semibold text-gray-800">Bills & Payments</h2>
//         <p className="text-sm text-gray-600">View and manage bills for completed appointments</p>
//       </div>

//       {appointmentsWithBills.length === 0 && !appointmentsLoading && (
//         <Alert 
//           type="info" 
//           title="No Bills" 
//           message="No bills available for completed appointments" 
//           onClose={() => {}} 
//           className="mb-4" 
//         />
//       )}
      
//       <Table
//         columns={tableColumns}
//         data={appointmentsWithBills}
//         loading={appointmentsLoading}
//         itemsPerPage={10}
//       />

//       {showPayModal && selectedBill && (
//         <PayBillModal
//           bill={selectedBill}
//           onClose={() => {
//             setShowPayModal(false);
//             setSelectedBill(null);
//           }}
//           onPaymentSuccess={() => {
//             // Refresh appointments and bills
//             switch(role) {
//               case ROLES.PATIENT:
//                 fetchForPatient?.();
//                 break;
//               case ROLES.HOSPITAL_ADMIN:
//               case ROLES.HOSPITAL_SUB_ADMIN:
//               case ROLES.HOSPITAL_FRONT_DESK:
//                 fetchForHospital?.();
//                 break;
//             }
//             // Refetch bills to show updated payment status
//             fetchBills();
//           }}
//         />
//       )}
//     </>
//   );
// };

// export default BillsPage;
