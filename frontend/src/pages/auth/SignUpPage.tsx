import bgImg from "../../assets/images/landing-hero-section.png";
import logo from "../../assets/icons/JAW-transparent.png";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import ROUTES from "../../constants/routes";
import { Link, useNavigate } from "react-router-dom";
import AuthButton from "./components/AuthButton";
import PasswordField from "./components/PasswordField";
import api from "../../services/api";
import { useState } from "react";
import EndPoints from "../../constants/endpoints";

function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError("");

    if (!email || !password || !confirmPassword || !role) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(EndPoints.auth.signUp, {
        email,
        password,
        role,
      });

      console.log(`response: ${res}`);

      if (res.data.success) {
        alert(res.data.message); // or show a toast
        navigate(ROUTES.AUTH.SIGN_IN);
      } else {
        setError(res.data.message || "Sign up failed");
      }
    } catch (err: any) {
      console.log(`Error in signup: ${err.response?.data?.message}`);
      setError(err.response?.data?.message ?? "SignUp failed!");
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
        flex 
        justify-center 
        items-center 
      `}
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="flex flex-col gap-3 justify-center mx-8 p-8 bg-white rounded-md shadow-md w-full max-w-xl">
        <div className="flex justify-center">
          <img src={logo} className="h-30 mb-2" />
        </div>

        {error && <p className="text-center text-red-500"> {error}</p>}

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
        <PasswordField
          title="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <LabeledDropDownField
          label="Role"
          required
          options={[
            { label: "Patient", value: "patient" },
            { label: "Doctor", value: "doctor" },
          ]}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <AuthButton
          className="my-2"
          label={loading ? "Signing Up ..." : "Sign Up"}
          disabled={loading}
          onClick={handleSignUp}
        />

        <div className="flex justify-center gap-1">
          <p className="text-center">Already have an account? </p>
          <Link to={ROUTES.AUTH.SIGN_IN} className="text-primary">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
