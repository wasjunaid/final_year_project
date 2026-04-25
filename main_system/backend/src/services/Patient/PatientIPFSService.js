const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { uploadToIPFS } = require("../../utils/ipfs");
const {canonicalizePatient} = require("../../utils/canonicalize"); // assumes this exports a function
const { PatientService } = require("./PatientService"); // must expose getPatientIfExists or equivalent

class PatientIPFSService {
  static async uploadCanonicalPatientToIPFS(patient_id) {
    if (!patient_id) {
      throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
    }

    // Fetch patient from your existing service
    const patient = await PatientService.getPatientIfExists(patient_id);
    if (!patient) {
      throw new AppError("Patient not found", STATUS_CODES.NOT_FOUND);
    }

    // Canonicalize full patient object (or pick a subset if desired)
    const canonicalJSON = canonicalizePatient(patient);

    // Upload to IPFS
    const cid = await uploadToIPFS(canonicalJSON);

    return { patient_id, cid };
  }
}

module.exports = PatientIPFSService;