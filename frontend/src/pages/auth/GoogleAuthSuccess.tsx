import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSvg from "./components/LoadingSvg";
import ErrorSvg from "./components/ErrorSvg";
import ROUTES from "../../constants/routes";
import AuthButton from "./components/AuthButton";
import { useAuth } from "../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import type { User } from "../../models/User";
import AuthBg from "./components/AuthBg";
import Card from "../../components/Card";
import rolePortalRoute from "./utils/rolePortalNavigation";

function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      signIn({ accessToken, refreshToken });

      //TODO: find a better way to pass user-role instead of decoding manually
      const user = jwtDecode<User>(accessToken);
      const role = user.role;

      setTimeout(() => {
        navigate(rolePortalRoute({ role }) ?? ROUTES.HOME);
      }, 100);
    } else {
      setError("Missing tokens.");
    }
  }, [searchParams]);

  return (
    <AuthBg>
      <Card className="w-full max-w-sm">
        {error && (
          <>
            <div className="mx-auto">
              <ErrorSvg />
            </div>
            <h2 className="text-2xl text-center font-bold mb-2 text-red-700">
              Verification Failed
            </h2>

            <p className="text-center text-gray-500">{error}</p>

            <AuthButton
              className="mt-2"
              label="Back to login"
              onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}
            />
          </>
        )}

        {!error && (
          <>
            <div className="mx-auto">
              <LoadingSvg />
            </div>

            <p className="text-center text-gray-700 text-lg">
              Successfully Authenticated. Redirecting...
            </p>
          </>
        )}
      </Card>
    </AuthBg>
  );
}

export default GoogleAuthSuccess;
