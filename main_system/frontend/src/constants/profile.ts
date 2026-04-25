export const GENDER = {
    MALE: 'M',
    FEMALE: 'F',
    OTHER: 'O',
} as const;

export const BLOOD_GROUP = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
} as const;

export const ROLES = {
    SYSTEM_ADMIN: "super admin",
    SYSTEM_SUB_ADMIN: "admin",

    PATIENT: "patient",
    DOCTOR: "doctor",
    MEDICAL_CODER: "medical coder",

    HOSPITAL_ADMIN: "hospital admin",
    HOSPITAL_SUB_ADMIN: "hospital sub admin",
    HOSPITAL_FRONT_DESK: "hospital front desk",
    HOSPITAL_LAB_TECHNICIAN: "hospital lab technician",
    HOSPITAL_PHARMACIST: "hospital pharmacist",
} as const;

export const DoctorStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
} as const;

// Type exports
export type Gender = typeof GENDER[keyof typeof GENDER];
export type BloodGroup = typeof BLOOD_GROUP[keyof typeof BLOOD_GROUP];
export type UserRole = typeof ROLES[keyof typeof ROLES];
export type DoctorStatus = typeof DoctorStatus[keyof typeof DoctorStatus];