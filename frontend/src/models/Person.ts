export interface Person {
  person_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  // role: UserRole;
  gender?: GenderType;
  address_id: number;
  date_of_birth?: string;
  blood_group?: string;
  cnic: string;
  is_verified: boolean;
  // add more fields as needed
}

export const Gender = {
  male: "M",
  female: "F",
  other: "O",
} as const;

export type GenderType = (typeof Gender)[keyof typeof Gender];
