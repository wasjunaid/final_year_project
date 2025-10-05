export interface HospitalAssociationRequest {
  hospital_association_request_id: number;
  hospital_id: number;
  person_id: number;
  role: HospitalAssociationRequestRoleType;
  created_at: string;
  updated_at: string;
  // Additional fields from joined queries
  hospital_name?: string;
  hospital_address?: string;
  person_email?: string;
  person_first_name?: string;
  person_last_name?: string;
}

export const HospitalAssociationRequestRole = {
  doctor: "doctor",
  medicalCoder: "medical coder",
} as const;

export type HospitalAssociationRequestRoleType =
  (typeof HospitalAssociationRequestRole)[keyof typeof HospitalAssociationRequestRole];
