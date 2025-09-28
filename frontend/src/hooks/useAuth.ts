import { signIn, signOut } from "../redux/slices/authSlice";
import { useAppSelector, useAppDispatch } from "../redux/hooks";

interface ISignInProps {
  accessToken: string;
  refreshToken: string;
}

export function useAuth() {
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);

  const dispatch = useAppDispatch();

  return {
    user,
    accessToken,
    refreshToken,
    signIn: (tokens: ISignInProps) => dispatch(signIn(tokens)),
    signOut: () => dispatch(signOut()),
  };
}
