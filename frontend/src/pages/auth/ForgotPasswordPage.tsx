import logo from "../../assets/icons/JAW-transparent.png";
import LabeledInputField from "../../components/LabeledInputField";
import AuthButton from "./components/AuthButton";
import { useState } from "react";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";
import AuthBg from "./components/AuthBg";
import Card from "../../components/Card";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(EndPoints.auth.forgotPassword, { email });
      if (res.data.success) {
        setSuccess(res.data.message || "Reset link sent to your email.");
      } else {
        setError(res.data.message || "Failed to send reset link.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBg>
      <Card className="mx-8 max-w-md w-full">
        <div className="flex justify-center">
          <img src={logo} className="h-30 mb-4" />
        </div>

        {error && <p className="text-center text-red-500">{error}</p>}
        {success && <p className="text-center text-green-600">{success}</p>}

        <LabeledInputField
          title="Email"
          required
          hint="Enter your email to get password reset link"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <AuthButton
          label={loading ? "Sending..." : "Send Reset Link"}
          onClick={handleForgotPassword}
          disabled={loading}
        />
      </Card>
    </AuthBg>
  );
}

export default ForgotPasswordPage;
