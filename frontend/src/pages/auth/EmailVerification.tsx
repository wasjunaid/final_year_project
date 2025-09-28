import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ROUTES from "../../constants/routes";
import EndPoints from "../../constants/endpoints";
import AuthButton from "./components/AuthButton";
import bgImg from "../../assets/images/landing-hero-section.png";
import api from "../../services/api";

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
      await api.post(EndPoints.emailVerification.verify, { token: token });

      setVerified(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`
        h-screen 
        bg-cover 
        bg-center 
        bg-[url("${bgImg}")]
        flex 
        justify-center 
        items-center 
      `}
      >
        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-primary mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700">
            Verifying your email...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        h-screen 
        bg-cover 
        bg-center 
        bg-[url("${bgImg}")]
        flex 
        justify-center 
        items-center 
      `}
    >
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full flex flex-col items-center">
        {verified ? (
          <>
            <svg
              className="h-16 w-16 text-green-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="#e6fffa"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2l4-4"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2 text-green-700">
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
            <svg
              className="h-16 w-16 text-red-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="#ffeaea"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 9l-6 6m0-6l6 6"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2 text-red-700">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6 text-center">{error}</p>
            <AuthButton
              label="Back to Login"
              onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default EmailVerification;
