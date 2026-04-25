const { verifyAccessJWT } = require("../middlewares/verifyAccessJWTMiddleware");

const AuthRouter = require("./auth/authRoutes");
const JWTRouter = require("./auth/JWTRoutes");
const GoogleAuthRouter = require("./auth/googleAuthRoutes");

const TokenRouter = require("./token/tokenRoutes");

const PersonRouter = require("./person/personRoutes");
const SystemAdminRouter = require("./system/systemAdminRoutes");
const DashboardStatsRouter = require("./system/dashboardStatsRoutes");
const PatientRouter = require("./patient/patientRoutes");
const DoctorRouter = require("./doctor/doctorRoutes");
const HospitalRouter = require("./hospital/hospitalRoutes");
const HospitalStaffRouter = require("./hospital/hospitalStaffRoutes");
const HospitalPanelListRouter = require("./hospital/hospitalPanelListRoutes");
const HospitalAssociationRequestRouter = require("./hospital/hospitalAssociationRequestRoutes");
const HospitalAssociationRequestFrontendRouter = require("./hospital/hospitalAssociationRequestFrontendRoutes");
const AppointmentRouter = require("./appointment/appointmentRoutes");
const InsuranceCompanyRouter = require("./insurance/insuranceCompanyRoutes");
const LabTestRouter = require("./labTest/labTestRoutes");
const EHRAccessRouter = require("./EHR/EHRAccessRoutes");
const EHRAccessFrontendRouter = require("./EHR/EHRAccessFrontendRoutes");
const DocumentRouter = require("./document/documentRoutes");

const NotificationRouter = require("./notification/notificationRoutes");
const LogRouter = require("./log/logRoutes");

const MedicineRouter = require("./medicine/medicineRoutes");
const PrescriptionRouter = require("./prescription/prescriptionRoutes");
const PatientInsuranceRouter = require("./patient/patientInsuranceRoutes");
const EHRRouter = require("./EHR/EHRRoutes");
const MedicalCoderRouter = require("./medicalCoder/medicalCoderRoutes");

const PatientAllergyRouter = require("./patient/patientAllergyRoutes");
const PatientFamilyHistoryRouter = require("./patient/patientFamilyHistoryRoutes");
const PatientSurgicalHistoryRouter = require("./patient/patientSurgicalHistoryRoutes");
const PatientMedicalHistoryRouter = require("./patient/patientMedicalHistoryRoutes");

const ICDRouter = require("./medicalCoding/icdRoutes");
const CPTRouter = require("./medicalCoding/cptRoutes");
const AppointmentICDRouter = require("./medicalCoding/appointmentICDRoutes");
const AppointmentCPTRouter = require("./medicalCoding/appointmentCPTRoutes");

const BillRouter = require("./bill/billRoutes");

const patientIPFSRoutes = require("./patient/ipfsRoutes");
const ethereumRoutes = require("./patient/ethereumRoutes");

const paymentRouter = require("./payment/paymentRoutes");

const routes = (app) => {
    app.use("/auth", AuthRouter);
    app.use("/auth", JWTRouter);
    app.use("/auth", GoogleAuthRouter);

    app.use("/token", TokenRouter);

    app.use(
        "/person",
        verifyAccessJWT,
        PersonRouter
    );
    app.use(
        "/system-admin",
        verifyAccessJWT,
        SystemAdminRouter
    );
    app.use(
        "/dashboard-stats",
        verifyAccessJWT,
        DashboardStatsRouter
    );
    app.use(
        "/patient",
        verifyAccessJWT,
        PatientRouter
    );
    app.use(
        "/doctor",
        verifyAccessJWT,
        DoctorRouter
    );

    app.use(
        "/hospital",
        verifyAccessJWT,
        HospitalRouter
    );
    app.use(
        "/hospital-staff",
        verifyAccessJWT,
        HospitalStaffRouter
    );
    app.use(
        "/hospital-panel-list",
        verifyAccessJWT,
        HospitalPanelListRouter
    );
    app.use(
        "/hospital-association-request",
        verifyAccessJWT,
        HospitalAssociationRequestRouter
    );
    app.use(
        "/hospital-association-request/frontend",
        verifyAccessJWT,
        HospitalAssociationRequestFrontendRouter
    );

    app.use(
        "/appointment",
        verifyAccessJWT,
        AppointmentRouter
    );

    app.use(
        "/insurance-company",
        InsuranceCompanyRouter
    );

    app.use(
        "/lab-test",
        verifyAccessJWT,
        LabTestRouter
    );

    app.use(
        "/ehr-access",
        verifyAccessJWT,
        EHRAccessRouter
    );

    app.use(
        "/ehr-access/frontend",
        verifyAccessJWT,
        EHRAccessFrontendRouter
    );

    app.use(
        "/patient-insurance",
        verifyAccessJWT,
        PatientInsuranceRouter
    );

    app.use(
        "/medicine",
        verifyAccessJWT,
        MedicineRouter
    );

    app.use(
        "/prescription",
        verifyAccessJWT,
        PrescriptionRouter
    );

    app.use(
        "/document",
        verifyAccessJWT,
        DocumentRouter
    );

    app.use(
        "/notification",
        verifyAccessJWT,
        NotificationRouter
    );

    app.use(
        "/log",
        verifyAccessJWT,
        LogRouter
    );

    
    app.use(
        "/ehr",
        verifyAccessJWT,
        EHRRouter
    );

    app.use(
        "/medical-coder",
        verifyAccessJWT,
        MedicalCoderRouter
    );

    app.use(
        "/patient-allergy",
        verifyAccessJWT,
        PatientAllergyRouter
    );

    app.use(
        "/patient-family-history",
        verifyAccessJWT,
        PatientFamilyHistoryRouter
    );

    app.use(
        "/patient-surgical-history",
        verifyAccessJWT,
        PatientSurgicalHistoryRouter
    );

    app.use(
        "/patient-medical-history",
        verifyAccessJWT,
        PatientMedicalHistoryRouter
    );

    app.use(
        "/icd",
        verifyAccessJWT,
        ICDRouter
    );

    app.use(
        "/cpt",
        verifyAccessJWT,
        CPTRouter
    );

    app.use(
        "/appointment-icd",
        verifyAccessJWT,
        AppointmentICDRouter
    );

    app.use(
        "/appointment-cpt",
        verifyAccessJWT,
        AppointmentCPTRouter
    );
     app.use("/patient/ipfs", 
        verifyAccessJWT,
        patientIPFSRoutes
    );
    
    app.use("/patient/eth", 
        verifyAccessJWT,
        ethereumRoutes
    ); // <-- comment this line

    app.use(
        "/bill",
        BillRouter
    );

    app.use(
        "/payment",
        paymentRouter
    );

    return app;
};

module.exports = { routes };