import bgImg from "../../assets/images/landing-hero-section.png";
import logo from "../../assets/icons/JAW-transparent.png";
import AuthButton from "./components/AuthButton";
import PasswordField from "./components/PasswordField";
import { useState } from "react";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import { useSearchParams, useNavigate } from "react-router-dom";
import ROUTES from "../../constants/routes";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(EndPoints.auth.resetPassword, {
        token,
        password,
      });

      if (res.data.success) {
        setSuccess(true);
      } else {
        setError(res.data.message || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Error resetting password!");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex flex-col gap-4 justify-center mx-8 p-8 bg-white rounded-md shadow-md w-full max-w-xl">
        <div className="flex justify-center">
          <img src={logo} className="h-30 mb-4" />
        </div>

        {!token ? (
          <>
            <p className="text-center text-red-500 text-lg">
              Invalid or missing password reset link.
            </p>

            <AuthButton
              className="my-2"
              label="Go to Sign In page"
              onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}
            />
          </>
        ) : success ? (
          <div className="text-center">
            <p className="text-green-500 text-lg mb-4">
              Password has been reset successfully.
            </p>
            <AuthButton
              label="Go to Login"
              onClick={() => navigate(ROUTES.AUTH.SIGN_IN)}
            />
          </div>
        ) : (
          <>
            {error && <p className="text-center text-red-500">{error}</p>}

            <PasswordField
              title="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordField
              title="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <AuthButton
              className="my-2"
              disabled={loading}
              label={loading ? "Loading..." : "Change Password"}
              onClick={handleResetPassword}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
