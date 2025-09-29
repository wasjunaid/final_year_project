import type { UserRole } from "../constants/roles";

// export interface Person {
//   person_id: number;
//   email: string;
//   // password_hash: string;
//   role: UserRole;
//   first_name: string;
//   last_name: string;
//   cnic: string;
//   date_of_birth: Date;
//   gender: string;
//   blood_group: string;
//   address_id: number;
//   is_verified: boolean;
// }

export interface Person {
  person_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  gender?: string;
  date_of_birth?: string;
  blood_group?: string;
  // add more fields as needed
}
