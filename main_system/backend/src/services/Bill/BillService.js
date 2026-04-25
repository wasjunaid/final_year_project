const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { AppointmentDetailService } = require("../Appointment/AppointmentDetailService");
const { AppointmentDocumentsService } = require("../Document/AppointmentDocumentsService");
const { PatientInsuranceService } = require("../Patient/PatientInsuranceService");
const axios = require("axios");
const { INSURANCE_BACKEND_BASE_URL, INSURANCE_BACKEND_SEND_CLAIM_ENDPOINT } = require("../../config/insuranceBackendConfig");
const { PersonService } = require("../Person/PersonService");
const { AppointmentCPTService } = require("../MedicalCoding/AppointmentCPTService");
const { AppointmentICDService } = require("../MedicalCoding/AppointmentICDService");
const { VALID_CLAIM_STATUSES_OBJECT, VALID_TABLES_OBJECT } = require("../../utils/validConstantsUtil");
const { VALID_ROLES_OBJECT } = require("../../validations/auth/authValidations");
const { NotificationService } = require("../Notification/NotificationService");
const { LogService } = require("../Log/LogService");
const { HospitalService } = require("../Hospital/HospitalService");

class BillService {
    static getHospitalizationDays(admissionDate, dischargeDate) {
        const admission = new Date(admissionDate);
        const discharge = new Date(dischargeDate);

        if (Number.isNaN(admission.getTime()) || Number.isNaN(discharge.getTime())) {
            return 1;
        }

        const normalizedAdmission = new Date(admission);
        const normalizedDischarge = new Date(discharge);
        normalizedAdmission.setHours(0, 0, 0, 0);
        normalizedDischarge.setHours(0, 0, 0, 0);

        const diffMs = normalizedDischarge.getTime() - normalizedAdmission.getTime();
        if (diffMs < 0) {
            return 1;
        }

        return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    }

    static isInsuranceActiveOnDate(personInsurance, appointmentDate) {
        if (!personInsurance || !appointmentDate) {
            return false;
        }

        if (personInsurance.is_active === false) {
            return false;
        }

        const target = new Date(appointmentDate);
        if (Number.isNaN(target.getTime())) {
            return false;
        }

        const effectiveDate = personInsurance.effective_date ? new Date(personInsurance.effective_date) : null;
        const expirationDate = personInsurance.expiration_date ? new Date(personInsurance.expiration_date) : null;

        if (effectiveDate && target < effectiveDate) {
            return false;
        }

        if (expirationDate && target > expirationDate) {
            return false;
        }

        return true;
    }

    static async isInsuranceCompanyOnHospitalPanel(hospital_id, insurance_company_id) {
        const query = {
            text: `SELECT 1 FROM hospital_panel_list
            WHERE hospital_id = $1 AND insurance_company_id = $2
            LIMIT 1`,
            values: [hospital_id, insurance_company_id],
        };

        const result = await DatabaseService.query(query.text, query.values);
        return result.rowCount > 0;
    }

    static async getBillAgainstAppointmentIfExists(appointment_id) {
        try {
            if (!appointment_id) {
                throw new AppError("Appointment ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM bill WHERE appointment_id = $1`,
                values: [appointment_id]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }
            
            return result.rows[0];
        } catch (error) {
            console.error(`Error in BillService.getBillAgainstAppointment: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getBillIfExists(bill_id) {
        try {
            if (!bill_id) {
                throw new AppError("bill_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM bill WHERE bill_id = $1`,
                values: [bill_id],
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in BillService.getBillIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async generateBillAgainstAppointment(appointment_id) {
        try {
            if (!appointment_id) {
                throw new AppError("Appointment ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const appointmentDetails = await AppointmentDetailService.getAppointmentDetailsIfExists(appointment_id);
            if (!appointmentDetails) {
                throw new AppError("Appointment not found", STATUS_CODES.NOT_FOUND);
            }
            if (appointmentDetails.lab_tests_ordered && !appointmentDetails.lab_tests_completed) {
                throw new AppError("Cannot generate bill before lab tests are completed", STATUS_CODES.BAD_REQUEST);
            }

            let amount = appointmentDetails.appointment_cost;

            let appliedHospitalizationDailyCharge = 0;
            let hospitalizationDays = 0;
            let hospitalizationAmount = 0;

            if (String(appointmentDetails.appointment_type || "").toLowerCase() === "hospitalization") {
                const hospital = await HospitalService.getHospitalIfExists(appointmentDetails.hospital_id);
                const defaultDailyCharge = Number(hospital?.hospitalization_daily_charge || 0);
                appliedHospitalizationDailyCharge = Number(appointmentDetails.applied_hospitalization_daily_charge ?? defaultDailyCharge ?? 0);

                const admissionDate = appointmentDetails.admission_date || appointmentDetails.date;
                const dischargeDate = appointmentDetails.discharge_date || appointmentDetails.completed_at || appointmentDetails.date;

                hospitalizationDays = this.getHospitalizationDays(admissionDate, dischargeDate);
                hospitalizationAmount = Number((appliedHospitalizationDailyCharge * hospitalizationDays).toFixed(2));
                amount += hospitalizationAmount;

                const updateAppointmentChargeQuery = {
                    text: `UPDATE appointment
                    SET applied_hospitalization_daily_charge = COALESCE(applied_hospitalization_daily_charge, $2)
                    WHERE appointment_id = $1`,
                    values: [appointment_id, appliedHospitalizationDailyCharge],
                };
                await DatabaseService.query(updateAppointmentChargeQuery.text, updateAppointmentChargeQuery.values);
            }

            if (appointmentDetails.lab_tests_ordered && appointmentDetails.lab_tests_completed) {
                const labTestDocuments = await AppointmentDocumentsService.getVerifiedDocumentsAgainstAppointmentIfExists(appointment_id);

                if (labTestDocuments) {
                    for (const doc of labTestDocuments) {
                        if (doc.lab_test_cost) {
                            amount += parseFloat(doc.lab_test_cost);
                        }
                    }
                }
            }

            let is_claim = false;
            let claim_status = null;
            let claimSkipReason = null;
            let claimSkipReasonForPatient = null;

            const personInsurance = await PatientInsuranceService.ensurePrimaryInsuranceActiveForDate(
                appointmentDetails.patient_id,
                appointmentDetails.date
            );
            if (personInsurance && personInsurance.is_verified) {
                const isInsuranceActive = this.isInsuranceActiveOnDate(personInsurance, appointmentDetails.date);
                const isHospitalPartnered = await this.isInsuranceCompanyOnHospitalPanel(
                    appointmentDetails.hospital_id,
                    personInsurance.insurance_company_id
                );

                if (isInsuranceActive && isHospitalPartnered) {
                    is_claim = true;
                    claim_status = VALID_CLAIM_STATUSES_OBJECT.PENDING;
                } else if (!isInsuranceActive) {
                    claimSkipReason = "Claim not sent: insurance is inactive or not valid for appointment date";
                    claimSkipReasonForPatient = "Your insurance is inactive for this appointment date.";
                } else if (!isHospitalPartnered) {
                    claimSkipReason = "Claim not sent: insurance company is not on hospital panel list";
                    claimSkipReasonForPatient = "Your insurance company is not on this hospital's panel list.";
                }
            } else if (personInsurance && !personInsurance.is_verified) {
                claimSkipReason = "Claim not sent: primary insurance is not verified";
                claimSkipReasonForPatient = "Your primary insurance is not verified yet.";
            } else {
                claimSkipReason = "Claim not sent: no verified primary insurance found";
                claimSkipReasonForPatient = "No verified primary insurance was found for your profile.";
            }

            const query = {
                text: `INSERT INTO bill
                (appointment_id, amount, is_claim, claim_status, applied_hospitalization_daily_charge, hospitalization_days, hospitalization_amount)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                values: [
                    appointment_id,
                    amount,
                    is_claim,
                    claim_status,
                    appliedHospitalizationDailyCharge,
                    hospitalizationDays,
                    hospitalizationAmount,
                ]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to generate bill", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            if (is_claim) {
                const patient = await PersonService.getPersonIfExists(appointmentDetails.patient_id);

                const doctor = await PersonService.getPersonIfExists(appointmentDetails.doctor_id);

                const icdCodesData = await AppointmentICDService.getAppointmentICDCodesIfExists(appointment_id);
                const icd_codes = icdCodesData.map(icd => icd.icd_code);
                const icd_codes_string = icd_codes.join(', ');
                // const icd_codes_string = "ye ha icd code";

                const cptCodesData = await AppointmentCPTService.getAppointmentCPTCodesIfExists(appointment_id);
                const cpt_codes = cptCodesData.map(cpt => cpt.cpt_code);
                const cpt_codes_string = cpt_codes.join(', ');
                // const cpt_codes_string = "ye ha cpt code";

                const response = await axios.post(`${INSURANCE_BACKEND_BASE_URL}${INSURANCE_BACKEND_SEND_CLAIM_ENDPOINT}`, {
                    claim_id_in_hospital_system: result.rows[0].bill_id,
                    insurance_number: personInsurance.insurance_number,
                    cnic: patient.cnic,
                    claim_amount: amount,
                    icd_codes: icd_codes_string,
                    cpt_codes: cpt_codes_string,
                    appointment_date: appointmentDetails.date,
                    hospital_name: appointmentDetails.hospital_name,
                    doctor_name: `${doctor.first_name} ${doctor.last_name}`
                });
                if (!response.data.success) {
                    throw new AppError("Sending Claim to Insurance Failed", STATUS_CODES.INTERNAL_SERVER_ERROR);
                }

                try {
                    await LogService.insertLog(
                        appointmentDetails.doctor_id,
                        `Claim sent to insurance backend for bill ${result.rows[0].bill_id} and appointment ${appointment_id}`
                    );
                } catch (logError) {
                    console.error(`Claim success logging failed: ${logError.message}`);
                }

                try {
                    await NotificationService.insertNotification({
                        person_id: appointmentDetails.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Insurance Claim Submitted",
                        message: "Your insurance claim has been submitted and is pending insurer decision.",
                        type: "system",
                        related_id: appointment_id,
                        related_table: VALID_TABLES_OBJECT.APPOINTMENT,
                        sendEmail: false,
                    });
                } catch (notificationError) {
                    console.error(`Claim success notification failed: ${notificationError.message}`);
                }
            } else if (claimSkipReason) {
                try {
                    await LogService.insertLog(appointmentDetails.doctor_id, `${claimSkipReason} for appointment ${appointment_id}`);
                } catch (logError) {
                    console.error(`Claim pre-check logging failed: ${logError.message}`);
                }

                try {
                    await NotificationService.insertNotification({
                        person_id: appointmentDetails.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Insurance Claim Not Sent",
                        message: `${claimSkipReasonForPatient || "Insurance claim could not be submitted."} Please contact hospital support for assistance.`,
                        type: "alert",
                        related_id: appointment_id,
                        related_table: VALID_TABLES_OBJECT.APPOINTMENT,
                        sendEmail: false,
                    });
                } catch (notificationError) {
                    console.error(`Claim pre-check notification failed: ${notificationError.message}`);
                }
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in BillService.generateBillAgainstAppointment: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updateClaimStatus(bill_id, status) {
        try {
            if (!bill_id) {
                throw new AppError("bill id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!status) {
                throw new AppError("Status is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `UPDATE bill SET
                claim_status = $1
                WHERE
                bill_id = $2 AND is_claim = $3
                AND claim_status = '${VALID_CLAIM_STATUSES_OBJECT.PENDING}' RETURNING *`,
                values: [status, bill_id, true]
            }
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to update claim status", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            try {
                const bill = result.rows[0];
                const appointmentDetails = await AppointmentDetailService.getAppointmentDetailsIfExists(bill.appointment_id);
                if (appointmentDetails) {
                    const normalizedStatus = status.toLowerCase();
                    const statusLabel = normalizedStatus === VALID_CLAIM_STATUSES_OBJECT.APPROVED
                        ? "approved"
                        : normalizedStatus;

                    await NotificationService.insertNotification({
                        person_id: appointmentDetails.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Insurance Claim Updated",
                        message: `Your claim for appointment #${bill.appointment_id} is now ${statusLabel}.`,
                        type: "system",
                        related_id: bill.bill_id,
                        related_table: VALID_TABLES_OBJECT.BILL,
                        sendEmail: false,
                    });

                    await NotificationService.insertNotification({
                        person_id: appointmentDetails.doctor_id,
                        role: VALID_ROLES_OBJECT.DOCTOR,
                        title: "Claim Status Updated",
                        message: `Claim for appointment #${bill.appointment_id} is now ${statusLabel}.`,
                        type: "system",
                        related_id: bill.bill_id,
                        related_table: VALID_TABLES_OBJECT.BILL,
                        sendEmail: false,
                    });

                    await LogService.insertLog(
                        appointmentDetails.doctor_id,
                        `Claim status updated to ${statusLabel} for bill ${bill.bill_id} and appointment ${bill.appointment_id}`
                    );
                }
            } catch (notificationError) {
                console.error(`Claim update notification/log failed: ${notificationError.message}`);
            }
            
            return result.rows[0];
        } catch (error) {
            console.error(`Error in BillService.updateClaimStatus: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async resendClaimForPatient(patient_id, bill_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!bill_id) {
                throw new AppError("bill_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const bill = await this.getBillIfExists(bill_id);
            if (!bill) {
                throw new AppError("Bill not found", STATUS_CODES.NOT_FOUND);
            }

            if (bill.is_paid) {
                throw new AppError("Claim cannot be resent for a paid bill", STATUS_CODES.BAD_REQUEST);
            }

            const appointmentDetails = await AppointmentDetailService.getAppointmentDetailsIfExists(bill.appointment_id);
            if (!appointmentDetails) {
                throw new AppError("Appointment not found for bill", STATUS_CODES.NOT_FOUND);
            }

            if (Number(appointmentDetails.patient_id) !== Number(patient_id)) {
                throw new AppError("You can only resend claims for your own bills", STATUS_CODES.FORBIDDEN);
            }

            if (bill.is_claim && bill.claim_status === VALID_CLAIM_STATUSES_OBJECT.PENDING) {
                throw new AppError("Claim is already pending with insurance", STATUS_CODES.BAD_REQUEST);
            }

            const personInsurance = await PatientInsuranceService.ensurePrimaryInsuranceActiveForDate(
                appointmentDetails.patient_id,
                appointmentDetails.date
            );

            if (!personInsurance || !personInsurance.is_verified) {
                throw new AppError("No verified primary insurance found. Cannot resend claim.", STATUS_CODES.BAD_REQUEST);
            }

            const isInsuranceActive = this.isInsuranceActiveOnDate(personInsurance, appointmentDetails.date);
            if (!isInsuranceActive) {
                throw new AppError("Primary insurance is inactive for this appointment date.", STATUS_CODES.BAD_REQUEST);
            }

            const isHospitalPartnered = await this.isInsuranceCompanyOnHospitalPanel(
                appointmentDetails.hospital_id,
                personInsurance.insurance_company_id
            );
            if (!isHospitalPartnered) {
                throw new AppError("Insurance company is not on this hospital's panel list.", STATUS_CODES.BAD_REQUEST);
            }

            const patient = await PersonService.getPersonIfExists(appointmentDetails.patient_id);
            const doctor = await PersonService.getPersonIfExists(appointmentDetails.doctor_id);

            const icdCodesData = await AppointmentICDService.getAppointmentICDCodesIfExists(bill.appointment_id);
            const icd_codes = (icdCodesData || []).map(icd => icd.icd_code).join(', ');

            const cptCodesData = await AppointmentCPTService.getAppointmentCPTCodesIfExists(bill.appointment_id);
            const cpt_codes = (cptCodesData || []).map(cpt => cpt.cpt_code).join(', ');

            const response = await axios.post(`${INSURANCE_BACKEND_BASE_URL}${INSURANCE_BACKEND_SEND_CLAIM_ENDPOINT}`, {
                claim_id_in_hospital_system: bill.bill_id,
                insurance_number: personInsurance.insurance_number,
                cnic: patient.cnic,
                claim_amount: bill.amount,
                icd_codes,
                cpt_codes,
                appointment_date: appointmentDetails.date,
                hospital_name: appointmentDetails.hospital_name,
                doctor_name: `${doctor.first_name} ${doctor.last_name}`
            });

            if (!response.data.success) {
                throw new AppError("Sending claim to insurance failed", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            const updateQuery = {
                text: `UPDATE bill
                SET is_claim = TRUE,
                    claim_status = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE bill_id = $2
                RETURNING *`,
                values: [VALID_CLAIM_STATUSES_OBJECT.PENDING, bill.bill_id],
            };
            const updatedResult = await DatabaseService.query(updateQuery.text, updateQuery.values);

            await NotificationService.insertNotification({
                person_id: patient_id,
                role: VALID_ROLES_OBJECT.PATIENT,
                title: "Insurance Claim Resubmitted",
                message: `Your claim for appointment #${bill.appointment_id} has been resent and is now pending review.`,
                type: "system",
                related_id: bill.bill_id,
                related_table: VALID_TABLES_OBJECT.BILL,
                sendEmail: false,
            });

            await LogService.insertLog(
                patient_id,
                `Claim resent for bill ${bill.bill_id} against appointment ${bill.appointment_id}`
            );

            return updatedResult.rows[0];
        } catch (error) {
            console.error(`Error in BillService.resendClaimForPatient: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updateTransactionDetails({
        bill_id,
        transaction_hash,
        block_number,
        from_wallet,
        to_wallet,
        amount_paid
    }) {
        try {
            if (!bill_id) {
                throw new AppError("bill id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!transaction_hash) {
                throw new AppError("transaction hash is required", STATUS_CODES.BAD_REQUEST)
            }

            if (!block_number) {
                throw new AppError("block number is required", STATUS_CODES.BAD_REQUEST)
            }
            if (!from_wallet) {
                throw new AppError("from_wallet is required", STATUS_CODES.BAD_REQUEST)
            }

            if (!to_wallet) {
                throw new AppError("to_wallet is required", STATUS_CODES.BAD_REQUEST)
            }

            if (!amount_paid) {
                throw new AppError("amount paid is required", STATUS_CODES.BAD_REQUEST)
            }

            const query = {
                text: `UPDATE bill SET
                transaction_hash = $1,
                block_number = $2,
                from_wallet = $3,
                to_wallet = $4,
                amount_paid = $5,
                is_paid = $6
                WHERE
                bill_id = $7 AND is_paid = $8
                RETURNING *`,
                values: [transaction_hash, block_number, from_wallet, to_wallet, amount_paid, true, bill_id, false]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error updating transaction details", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            try {
                const bill = result.rows[0];
                const appointmentDetails = await AppointmentDetailService.getAppointmentDetailsIfExists(bill.appointment_id);
                if (appointmentDetails) {
                    await NotificationService.insertNotification({
                        person_id: appointmentDetails.patient_id,
                        role: VALID_ROLES_OBJECT.PATIENT,
                        title: "Payment Confirmed",
                        message: `Payment of ${amount_paid} has been recorded for appointment #${bill.appointment_id}.`,
                        type: "system",
                        related_id: bill.bill_id,
                        related_table: VALID_TABLES_OBJECT.BILL,
                        sendEmail: false,
                    });

                    await LogService.insertLog(
                        appointmentDetails.patient_id,
                        `Payment recorded for bill ${bill.bill_id}, appointment ${bill.appointment_id}, amount ${amount_paid}`
                    );
                }
            } catch (notificationError) {
                console.error(`Payment confirmation notification/log failed: ${notificationError.message}`);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in BillService.updateTransactionDetails: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { BillService };