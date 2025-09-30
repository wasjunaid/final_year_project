import { useAuth } from "../hooks/useAuth";

export function useUserRole() {
  const { user } = useAuth();
  return user?.role;
}
