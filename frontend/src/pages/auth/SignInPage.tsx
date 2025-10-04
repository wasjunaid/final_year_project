import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/icons/JAW-transparent.png";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import PasswordField from "./components/PasswordField";
import AuthButton from "./components/AuthButton";
import ROUTES from "../../constants/routes";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import { useAuth } from "../../hooks/useAuth";
import WarningCard from "../../components/WarningCard";
import type { User } from "../../models/User";
import { jwtDecode } from "jwt-decode";
import rolePortalRoute from "./utils/rolePortalNavigation";
import AuthBg from "./components/AuthBg";
import Card from "../../components/Card";

function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Verification states
  const [verifyEmail, setVerifyEmail] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");

  const handleSignIn = async () => {
    setError("");
    setSuccess("");
    setVerifyEmail(false);

    setVerifyEmail(false);
    setResendLoading(false);
    setResendError("");
    setResendSuccess("");

    if (!email || !password || !role) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(EndPoints.auth.signIn, {
        email,
        password,
        role,
      });

      if (res.data.success) {
        // alert(res.data.message); // or use toast
        const { accessToken, refreshToken } = res.data.data || {};
        if (accessToken && refreshToken) {
          signIn({ accessToken, refreshToken });
        }

        //TODO: find a better way to pass user-role instead of decoding manually
        const tempUser = jwtDecode<User>(accessToken);
        const role = tempUser?.role;

        navigate(rolePortalRoute({ role }) ?? ROUTES.HOME);
      } else {
        setError(res.data.message || "Sign in failed");
      }
    } catch (err: any) {
      const data = err.response?.data;

      if (data?.emailVerificationNeeded) {
        setVerifyEmail(true);
        setError(""); // clear generic error
      } else {
        setError(data?.message ?? "Sign in failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!email) {
      setResendError("Please enter your email above.");
      return;
    }

    setResendError("");
    setResendSuccess("");
    setResendLoading(true);

    try {
      const res = await api.post(EndPoints.emailVerification.sendOrResend, {
        email: email,
      });

      if (res.data.success) {
        setResendSuccess(
          "Verification email sent! Please check your inbox or spam folder."
        );
      } else {
        setResendError(
          res.data.message ?? "Failed to send verification email."
        );
      }
    } catch (err: any) {
      setResendError(
        err.response?.data?.message ?? "Something went wrong while resending."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthBg>
      <Card className="w-full max-w-xl mx-8">
        <div className="flex justify-center">
          <img src={logo} className="h-30 mb-2" />
        </div>

        {error && <p className="text-center text-red-500">{error}</p>}
        {success && <p className="text-center text-green-500">{success}</p>}

        {verifyEmail && (
          <WarningCard>
            <p className="text-center text-yellow-700 font-medium">
              Please verify your email before signing in.
            </p>

            {resendError && (
              <p className="text-center text-red-500 text-sm">{resendError}</p>
            )}
            {resendSuccess && (
              <p className="text-center text-green-600 text-sm">
                {resendSuccess}
              </p>
            )}

            <button
              type="button"
              onClick={handleResendVerificationEmail}
              disabled={resendLoading}
              className="text-primary hover:underline disabled:opacity-50"
            >
              {resendLoading
                ? "Sending..."
                : resendSuccess
                ? "Didn’t receive? Resend"
                : "Send Verification Email"}
            </button>
          </WarningCard>
        )}

        <LabeledInputField
          title="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          title="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <LabeledDropDownField
          label="Role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { label: "Patient", value: "patient" },
            { label: "Doctor", value: "doctor" },
            { label: "super admin", value: "super admin" },
            { label: "admin", value: "admin" },
            { label: "hospital admin", value: "hospital admin" },
            { label: "hospital sub admin", value: "hospital sub admin" },
            { label: "hospital front desk", value: "hospital front desk" },
            {
              label: "hospital lab technician",
              value: "hospital lab technician",
            },
          ]}
        />

        <AuthButton
          className="my-2"
          label={loading ? "Signing In ..." : "Sign In"}
          disabled={loading}
          onClick={handleSignIn}
        />

        <a
          href={ROUTES.AUTH.FORGOT_PASSWORD}
          className="text-center text-primary"
        >
          Forgot password?
        </a>

        <div className="flex justify-center gap-1">
          <p className="text-center">Don't have an account? </p>
          <a href={ROUTES.AUTH.SIGN_UP} className="text-primary">
            Sign Up
          </a>
        </div>
      </Card>
    </AuthBg>
  );
}

export default SignInPage;
