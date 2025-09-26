import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { signIn, signOut } from "../redux/slices/authSlice";
import { useAppSelector } from "../redux/hooks";

interface ISignInProps {
  accessToken: string;
  refreshToken: string;
}

export function useAuth() {
  const person = useAppSelector((state) => state.auth.person);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);

  const dispatch = useDispatch<AppDispatch>();

  return {
    person,
    accessToken,
    refreshToken,
    signIn: (tokens: ISignInProps) => dispatch(signIn(tokens)),
    signOut: () => dispatch(signOut()),
  };
}
