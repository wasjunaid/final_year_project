import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSvg from "./components/LoadingSvg";
import ErrorSvg from "./components/ErrorSvg";
import ROUTES from "../../constants/routes";
import AuthButton from "./components/AuthButton";
import { useAuth } from "../../hooks/useAuth";
import AuthBg from "./components/AuthBg";
import Card from "../../components/Card";
import rolePortalRoute from "./utils/rolePortalNavigation";

function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { signInWithTokens, role, isAuthenticated } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      const success = signInWithTokens({ accessToken, refreshToken });
      
      if (!success) {
        setError("Failed to authenticate with provided tokens.");
      }
    } else {
      setError("Missing tokens in URL parameters.");
    }
  }, [searchParams, signInWithTokens]);

  // Navigate when authentication is successful and role is available
  useEffect(() => {
    if (isAuthenticated && role) {
      setTimeout(() => {
        navigate(rolePortalRoute({ role }) ?? ROUTES.HOME);
      }, 500);
    }
  }, [isAuthenticated, role, navigate]);

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
