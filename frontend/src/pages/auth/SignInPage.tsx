import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/icons/JAW-transparent.png";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import PasswordField from "./components/PasswordField";
import AuthButton from "./components/AuthButton";
import ROUTES from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../services/authApi";
import WarningCard from "../../components/WarningCard";
import rolePortalRoute from "./utils/rolePortalNavigation";
import AuthBg from "./components/AuthBg";
import Card from "../../components/Card";
import GoogleAuthButton from "./components/GoogleAuthButton";
import type { UserRole } from "../../constants/roles";

function SignInPage() {
  const navigate = useNavigate();
  const { signIn, loading, error, success, clearMessages } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  // Verification states
  const [verifyEmail, setVerifyEmail] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");

  const handleSignIn = async () => {
    clearMessages();
    setVerifyEmail(false);
    setResendError("");
    setResendSuccess("");

    if (!email || !password || !role) {
      return;
    }

    try {
      const success = await signIn({ email, password, role });
      
      if (success) {
        navigate(rolePortalRoute({ role: role as UserRole }) ?? ROUTES.HOME);
      }
    } catch (err: any) {
      // Check if email verification is needed
      if (err?.emailVerificationNeeded === true) {
        setVerifyEmail(true);
      }
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
      await authApi.sendOrResendEmailVerificationToken({
        email: email,
        role: role,
      });

      setResendSuccess(
        "Verification email sent! Please check your inbox or spam folder."
      );
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
          <img src={logo} className="h-30 mb-2" alt="Logo" />
        </div>

        {error && (
          <div className="text-center text-red-500 mb-4">
            <p>{error}</p>
            <button 
              onClick={clearMessages}
              className="text-sm underline hover:no-underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {success && (
          <div className="text-center text-green-500 mb-4">
            <p>{success}</p>
            <button 
              onClick={clearMessages}
              className="text-sm underline hover:no-underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

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
                ? "Didn't receive? Resend"
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

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <GoogleAuthButton />
      </Card>
    </AuthBg>
  );
}

export default SignInPage;