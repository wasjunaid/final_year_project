import bgImg from "../../assets/images/landing-hero-section.png";
import logo from "../../assets/icons/JAW-transparent.png";
import LabeledInputField from "../../components/LabeledInputField";
import LabeledDropDownField from "../../components/LabeledDropDownField";
import ROUTES from "../../constants/routes";
import { Link } from "react-router-dom";
import AuthButton from "./components/AuthButton";
import PasswordField from "./components/PasswordField";

function SignUpPage() {
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
      <div className="flex flex-col gap-3 justify-center mx-8 p-8 bg-white rounded-md shadow-md w-xl">
        <div className="flex justify-center">
          <img src={logo} className="h-30 mb-2" />
        </div>

        <LabeledInputField title="Email" required />
        <PasswordField title="Password" />
        <PasswordField title="Confirm Password" />
        <LabeledDropDownField
          label="Role"
          required
          options={[
            { label: "Patient", value: "patient" },
            { label: "Doctor", value: "doctor" },
            { label: "Hospital", value: "hospital" },
          ]}
        />

        <AuthButton label="Sign Up" />

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
