import logo from "../../assets/icons/JAW-transparent.png";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import ROUTES from "../../constants/routes";
import { Link, useNavigate } from "react-router-dom";
import AuthButton from "./components/AuthButton";
import PasswordField from "./components/PasswordField";
import { useState } from "react";
import AuthBg from "./components/AuthBg";
import Card from "../../components/Card";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";

function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, loading, error, success, clearMessages } = useAuth();
  
  // Form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<string>("");
  
  // Local validation state
  const [validationError, setValidationError] = useState("");

  const handleSignUp = async () => {
    clearMessages();
    setValidationError("");

    // Client-side validation
    if (!email || !password || !confirmPassword || !role) {
      setValidationError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    try {
      const success = await signUp({ email, password, role });
      
      if (success) {
        // Navigate to sign in page after successful registration
        setTimeout(() => {
          navigate(ROUTES.AUTH.SIGN_IN);
        }, 2000); // Give user time to see success message
      }
    } catch (err: any) {
      // Error handling is managed by the hook
      console.error("Sign up failed:", err);
    }
  };

  const displayError = validationError || error;

  return (
    <AuthBg>
      <Card className="w-full max-w-xl mx-8">
        <div className="flex justify-center">
          <img src={logo} className="h-30 mb-2" alt="Logo" />
        </div>

        {displayError && (
          <div className="text-center text-red-500 mb-4">
            <p>{displayError}</p>
            <button 
              onClick={() => {
                clearMessages();
                setValidationError("");
              }}
              className="text-sm underline hover:no-underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {success && (
          <div className="text-center text-green-500 mb-4">
            <p>{success}</p>
            <p className="text-sm mt-1">Redirecting to sign in...</p>
          </div>
        )}

        <LabeledInputField
          title="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          disabled={loading}
        />
        
        <PasswordField
          title="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        
        <PasswordField
          title="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
        
        <LabeledDropDownField
          label="Role"
          required
          options={[
            { label: "Patient", value: ROLES.PATIENT },
            { label: "Doctor", value: ROLES.DOCTOR },
            { label: "Medical Coder", value: ROLES.MEDICAL_CODER }, // TODO: remove this option and move the medical coder signup to a admin flow
          ]}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
        />

        <AuthButton
          className="my-2"
          label={loading ? "Signing Up ..." : "Sign Up"}
          disabled={loading || !!success}
          onClick={handleSignUp}
        />

        <div className="flex justify-center gap-1">
          <p className="text-center">Already have an account? </p>
          <Link to={ROUTES.AUTH.SIGN_IN} className="text-primary">
            Sign In
          </Link>
        </div>
      </Card>
    </AuthBg>
  );
}

export default SignUpPage;