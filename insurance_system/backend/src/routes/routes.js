const { verifyAccessJWT } = require("../middlewares/verifyAccessJWTMiddleware");

const AuthRouter = require("./auth/authRoutes");
const JWTRouter = require("./auth/JWTRoutes");

const UserRouter = require("./user/userRoutes");
const HospitalRouter = require("./hospital/hospitalRoutes");
const InsuranceCompanyRouter = require("./insurance/insuranceCompanyRoutes");
const InsuranceStaffRouter = require("./insurance/InsuranceStaffRoutes");
const InsurancePanelListRouter = require("./insurance/InsurancePanelListRoutes");
const InsurancePlanRouter = require("./insurance/insurancePlanRoutes");
const PersonRouter = require("./person/personRoutes");
const InsuranceRouter = require("./insurance/insuranceRoutes");
const PersonInsuranceRouter = require("./person/PersonInsuranceRoutes");
const VerifyInsuranceRouter = require("./VerifyInsuranceRoutes");
const ClaimRouter = require("./claim/claimRoutes");
const PaymentRouter = require("./payment/paymentRoutes");

const routes = (app) => {
    app.use("/auth", AuthRouter);
    app.use("/auth", JWTRouter);

    app.use("/verify-insurance", VerifyInsuranceRouter);

    app.use("/claim", ClaimRouter);

    app.use(
        "/user",
        verifyAccessJWT,
        UserRouter
    );

    app.use(
        "/hospital",
        HospitalRouter
    );

    app.use(
        "/insurance-company",
        verifyAccessJWT,
        InsuranceCompanyRouter
    );
    
    app.use(
        "/insurance-staff",
        verifyAccessJWT,
        InsuranceStaffRouter
    );

    app.use(
        "/insurance-panel-list",
        verifyAccessJWT,
        InsurancePanelListRouter
    );

    app.use(
        "/insurance-plan",
        verifyAccessJWT,
        InsurancePlanRouter
    );
    
    app.use(
        "/person",
        verifyAccessJWT,
        PersonRouter
    );

    app.use(
        "/insurance",
        verifyAccessJWT,
        InsuranceRouter
    );

    app.use(
        "/person-insurance",
        verifyAccessJWT,
        PersonInsuranceRouter
    );

    app.use(
        "/payment",
        // verifyAccessJWT,
        PaymentRouter
    );

    return app;
};

module.exports = { routes };