import bgImg from "../../assets/images/landing-hero-section.png";
import logo from "../../assets/icons/JAW-transparent.png";
import LabeledInputField from "../../components/LabeledInputField";
import AuthButton from "./components/AuthButton";
import PasswordField from "./components/PasswordField";

function ResetPasswordPage() {
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

        <PasswordField title="New Password" />
        <PasswordField title="Confirm New Password" />

        <AuthButton label="Change Password" />
      </div>
    </div>
  );
}

export default ResetPasswordPage;
