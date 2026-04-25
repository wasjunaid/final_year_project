import type {
  PersonDTO,
  PatientDTO,
  DoctorDTO,
  MedicalCoderDTO,
  HospitalStaffDTO,
} from './dto';
import type {
  PersonProfileModel,
  PatientProfileModel,
  DoctorProfileModel,
  MedicalCoderProfileModel,
  HospitalStaffProfileModel,
} from './model';
import type { CountryCodeValue } from '../../constants/countryCode';
import type { UserRole } from '../../constants/profile';
import type { UpdateDoctorRequest, UpdatePatientRequest, UpdatePersonRequest } from './payload';

// Transform PersonDTO to PersonProfileModel
export function transformPersonDto(dto: PersonDTO): PersonProfileModel {
  return {
    personId: dto.person_id,
    email: dto.email,
    firstName: dto.first_name,
    lastName: dto.last_name,
    fullName: dto.first_name && dto.last_name ? `${dto.first_name} ${dto.last_name}` : undefined,
    cnic: dto.cnic,
    dateOfBirth: dto.date_of_birth,
    age: dto.date_of_birth ? Math.floor((new Date().getTime() - new Date(dto.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 0,
    gender: dto.gender,
    addressId: dto.address_id,
    address: dto.address,
    contactId: dto.contact_id,
    countryCode: dto.country_code as CountryCodeValue,
    phoneNumber: dto.number,
    isVerified: dto.is_verified,
    isPersonProfileComplete: dto.is_person_profile_complete,
  };
}

// Transform PatientDTO (with PersonDTO) to PatientProfileModel
export function transformPatientDto(personDto: PersonDTO, patientDto: PatientDTO): PatientProfileModel {
  return {
    ...transformPersonDto(personDto),
    patientId: patientDto.patient_id,
    emergencyContactId: patientDto.emergency_contact_id,
    emergencyContactCountryCode: patientDto.emergency_contact_country_code as CountryCodeValue,
    emergencyContactNumber: patientDto.emergency_contact_number,
    bloodGroup: patientDto.blood_group,
    walletAddress: patientDto.wallet_address,
    isPatientProfileComplete: patientDto.is_patient_profile_complete,
  };
}

// Transform DoctorDTO (with PersonDTO) to DoctorProfileModel
export function transformDoctorDto(personDto: PersonDTO, doctorDto: DoctorDTO): DoctorProfileModel {
  return {
    ...transformPersonDto(personDto),
    doctorId: doctorDto.doctor_id,
    licenseNumber: doctorDto.license_number,
    specialization: doctorDto.specialization,
    yearsOfExperience: doctorDto.years_of_experience,
    sittingStart: doctorDto.sitting_start,
    sittingEnd: doctorDto.sitting_end,
    status: doctorDto.doctor_status,
    hospitalId: doctorDto.hospital_id,
    hospitalName: doctorDto.hospital_name,
    isDoctorProfileComplete: doctorDto.is_doctor_profile_complete,
  };
}

// Transform MedicalCoderDTO (with PersonDTO) to MedicalCoderProfileModel
export function transformMedicalCoderDto(personDto: PersonDTO, coderDto: MedicalCoderDTO): MedicalCoderProfileModel {
  return {
    ...transformPersonDto(personDto),
    medicalCoderId: coderDto.medical_coder_id,
    hospitalId: coderDto.hospital_id,
    hospitalName: coderDto.hospital_name,
    isMedicalCoderProfileComplete: coderDto.is_medical_coder_profile_complete,
  };
}

// Transform HospitalStaffDTO (with PersonDTO) to HospitalStaffProfileModel
export function transformHospitalStaffDto(personDto: PersonDTO, staffDto: HospitalStaffDTO): HospitalStaffProfileModel {
  return {
    ...transformPersonDto(personDto),
    hospitalStaffId: staffDto.hospital_staff_id,
    hospitalId: staffDto.hospital_id,
    hospitalName: staffDto.hospital_name,
    role: staffDto.role as UserRole,
    isHospitalStaffProfileComplete: staffDto.is_hospital_staff_profile_complete,
  };
}

// Transform PersonProfileModel to UpdatePersonRequest
export function toUpdatePersonRequest(data: Partial<PersonProfileModel>): UpdatePersonRequest {
  const request: UpdatePersonRequest = {};
  
  if (data.firstName !== undefined) request.first_name = data.firstName;
  if (data.lastName !== undefined) request.last_name = data.lastName;
  if (data.cnic !== undefined) request.cnic = data.cnic;
  if (data.dateOfBirth !== undefined) request.date_of_birth = data.dateOfBirth;
  if (data.gender !== undefined) request.gender = data.gender;
  if (data.address !== undefined) request.address = data.address;
  if (data.countryCode !== undefined) request.country_code = data.countryCode;
  if (data.phoneNumber !== undefined) request.number = data.phoneNumber;
  
  return request;
}

// Transform PatientProfileModel to UpdatePatientRequest
export function toUpdatePatientRequest(data: Partial<PatientProfileModel>): UpdatePatientRequest {
  return {
    emergency_contact_country_code: data.emergencyContactCountryCode,
    emergency_contact_number: data.emergencyContactNumber,
    blood_group: data.bloodGroup,
    wallet_address: data.walletAddress,
  };
}

// Transform DoctorProfileModel to UpdateDoctorRequest
export function toUpdateDoctorRequest(data: Partial<DoctorProfileModel>): UpdateDoctorRequest {
  return {
    license_number: data.licenseNumber,
    specialization: data.specialization,
    years_of_experience: data.yearsOfExperience,
    sitting_start: data.sittingStart,
    sitting_end: data.sittingEnd,
  };
}
