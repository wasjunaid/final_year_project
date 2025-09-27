import { useState, type ReactNode } from "react";
import LabeledInputField, {
  type ILabeledInputFieldProps,
} from "../../../components/LabeledInputField";
import { BiHide, BiShow } from "react-icons/bi";

export interface IPasswordFieldProps extends ILabeledInputFieldProps {}

function PasswordField(props: IPasswordFieldProps) {
  const [showPassowrd, setShowPassword] = useState<boolean>(false);

  const toggleShowPassword = () => setShowPassword(!showPassowrd);

  const trailingButton: ReactNode = (
    <button
      type="button"
      onClick={toggleShowPassword}
      className="focus:outline-none"
    >
      {showPassowrd ? <BiHide /> : <BiShow />}
    </button>
  );

  return (
    <LabeledInputField
      type={showPassowrd ? "text" : "password"}
      trailing={trailingButton}
      required
      {...props}
    />
  );
}

export default PasswordField;
