import bgImg from "../../assets/images/landing-hero-section.png";
import logo from "../../assets/icons/JAW-transparent.png";
import LabeledInputField from "../../components/LabeledInputField";
import AuthButton from "./components/AuthButton";

function ForgotPasswordPage() {
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
      <div className="flex flex-col gap-4 justify-center mx-8 p-8 bg-white rounded-md shadow-md w-xl">
        <div className="flex justify-center">
          <img src={logo} className="h-30 mb-4" />
        </div>

        <LabeledInputField
          title="Email"
          required
          hint="Enter your email to get password reset link"
        />

        <AuthButton label="Send Reset Link" />
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
