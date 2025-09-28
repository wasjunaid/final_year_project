import type { UserRole } from "../constants/roles";

export interface User {
  person_id: number;
  role: UserRole;
  iat?: number; // issued at (optional, standard JWT)
  exp?: number; // expiration (optional, standard JWT)
}
