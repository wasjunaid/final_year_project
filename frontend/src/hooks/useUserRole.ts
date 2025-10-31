/**import { useAuth } from "../hooks/useAuth";

 * useUserRole Hook

 * export function useUserRole() {

 * A simple utility hook that extracts the user's role from the authentication state.  const { role } = useAuth();

 * This hook is a convenience wrapper around useAuth to provide easy access to   return role;

 * the current user's role without needing to destructure the entire auth object.}

 * 
 * Usage:
 * ```tsx
 * const role = useUserRole();
 * 
 * if (role === ROLES.DOCTOR) {
 *   // Doctor-specific logic
 * }
 * ```
 * 
 * Returns:
 * - UserRole | null - The current user's role or null if not authenticated
 */

import { useAuth } from './useAuth';
import type { UserRole } from '../constants/roles';

export function useUserRole(): UserRole | null {
  const { role } = useAuth();
  return role;
}

export default useUserRole;