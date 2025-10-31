import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ROUTES from "../../constants/routes";
import { authApi } from "../../services/authApi";
import AuthButton from "./components/AuthButton";
import SuccessSvg from "./components/SuccessSvg";
import ErrorSvg from "./components/ErrorSvg";
import LoadingSvg from "./components/LoadingSvg";
import AuthBg from "./components/AuthBg";
import Card from "../../components/Card";

function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    } else {
      setError("Invalid verification link.");
      setLoading(false);
    }
  }, []);

  const verifyEmail = async (token: string) => {
    try {
      const response = await authApi.verifyEmail({ token: token });

      if (response.success) {
        setVerified(true);
      } else {
        setError(response.message || "Verification failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthBg>
        <Card>
          <div className="mx-auto">
            <LoadingSvg />
          </div>
          <p className="text-lg font-medium text-gray-700">
            Verifying your email...
          </p>
        </Card>
      </AuthBg>
    );
  }

  return (
    <AuthBg>
      <Card className="max-w-md w-full">
        {verified ? (
          <>
            <div className="mx-auto">
              <SuccessSvg />
            </div>

            <h2 className="text-2xl text-center font-bold mb-2 text-green-700">
              Email Verified!
            </h2>

            <p className="text-gray-600 mb-6 text-center">
              Your email has been successfully verified. You can now log in to
              your account.
            </p>

            <AuthButton
              label="Go to Login"
              onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}
            />
          </>
        ) : (
          <>
            <div className="mx-auto">
              <ErrorSvg />
            </div>

            <h2 className="text-2xl text-center font-bold mb-2 text-red-700">
              Verification Failed
            </h2>

            <p className="text-gray-600 mb-6 text-center">{error}</p>

            <AuthButton
              label="Back to Login"
              onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}
            />
          </>
        )}
      </Card>
    </AuthBg>
  );
}

export default EmailVerification;
