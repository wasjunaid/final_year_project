const { verifyAccessJWT } = require("../middlewares/verifyAccessJWTMiddleware");

const AuthRouter = require("./auth/authRoutes");
const JWTRouter = require("./auth/JWTRoutes");
const GoogleAuthRouter = require("./auth/googleAuthRoutes");
const EmailVerificationTokenRouter = require("./token/emailVerificationTokenRoutes");
const PasswordResetTokenRouter = require("./token/passwordResetTokenRoutes");
const PersonRouter = require("./person/personRoutes");
const PatientRouter = require("./patient/patientRoutes");
const DoctorRouter = require("./doctor/doctorRoutes");
const PersonContactRouter = require("./person/personContactRoutes");
const PersonAddressRouter = require("./person/personAddressRoutes");
const PersonProfileRouter = require("./person/personProfileRoutes");
const HospitalRouter = require("./hospital/hospitalRoutes");
const HospitalStaffRouter = require("./hospital/hospitalStaffRoutes");
const AppointmentRequestRouter = require("./appointment/appointmentRequestRoutes");
const AppointmentRouter = require("./appointment/appointmentRoutes");
const DocumentRouter = require("./document/documentRoutes");
const NotificationRouter = require("./notification/notificationRoutes");
const LogRouter = require("./log/logRoutes");
const InsuranceCompanyRouter = require("./insurance/insuranceCompanyRoutes");
const EHRAccessRequestRouter = require("./EHR/EHRAccessRequestRoutes");
const EHRAccessRouter = require("./EHR/EHRAccessRoutes");
const SystemAdminRouter = require("./system/systemAdminRoutes");
const LabTestRouter = require("./labTest/labTestRoutes");
const MedicineRouter = require("./medicine/medicineRoutes");
const PrescriptionRouter = require("./prescription/prescriptionRoutes");
const DoctorNoteRouter = require("./doctor/doctorNoteRoutes");
const HospitalAssociationRequestRouter = require("./hospital/hospitalAssociationRequestRoutes");
const PatientInsuranceRouter = require("./patient/patientInsuranceRoutes");
const HospitalPanelListRouter = require("./hospital/hospitalPanelListRoutes");
const EHRRoutes = require("./EHR/EHRRoutes");

const routes = (app) => {
    app.use("/auth", AuthRouter);
    app.use("/auth", JWTRouter);
    app.use("/auth", GoogleAuthRouter);
    app.use("/token/email-verification", EmailVerificationTokenRouter);
    app.use("/token/password-reset", PasswordResetTokenRouter);

    app.use(
        "/person",
        verifyAccessJWT,
        PersonRouter
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
        "/person/contact",
        verifyAccessJWT,
        PersonContactRouter
    );
    app.use(
        "/person/address",
        verifyAccessJWT,
        PersonAddressRouter
    );
    app.use(
        "/person/profile",
        verifyAccessJWT,
        PersonProfileRouter
    );
    app.use(
        "/hospital",
        verifyAccessJWT,
        HospitalRouter
    );
    app.use(
        "/hospital/staff",
        verifyAccessJWT,
        HospitalStaffRouter
    );
    app.use(
        "/hospital/association-request",
        verifyAccessJWT,
        HospitalAssociationRequestRouter
    );
    app.use(
        "/appointment/request",
        verifyAccessJWT,
        AppointmentRequestRouter
    );
    app.use(
        "/appointment",
        verifyAccessJWT,
        AppointmentRouter
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
        "/insurance/company",
        verifyAccessJWT,
        InsuranceCompanyRouter
    );
    app.use(
        "/ehr/access-request",
        verifyAccessJWT,
        EHRAccessRequestRouter
    );
    app.use(
        "/ehr/access",
        verifyAccessJWT,
        EHRAccessRouter
    );
    app.use(
        "/system/admin",
        verifyAccessJWT,
        SystemAdminRouter
    );
    app.use(
        "/lab-test",
        verifyAccessJWT,
        LabTestRouter
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
        "/doctor/note",
        verifyAccessJWT,
        DoctorNoteRouter
    );
    app.use(
        "/patient/insurance",
        verifyAccessJWT,
        PatientInsuranceRouter
    );
    app.use(
        "/hospital/panel-list",
        verifyAccessJWT,
        HospitalPanelListRouter
    );
    app.use(
        "/ehr",
        verifyAccessJWT,
        EHRRoutes
    );

    return app;
};

module.exports = { routes };