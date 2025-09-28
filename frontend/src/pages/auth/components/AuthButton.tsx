import SideBarButton, {
  type ISideBarButtonProps,
} from "../../../components/SideBarButton";

interface IAuthButtonProps extends ISideBarButtonProps {}

function AuthButton(props: IAuthButtonProps) {
  const { className, ...rest } = props;

  return (
    <SideBarButton
      className={`justify-center font-medium ${className}`}
      selected
      {...rest}
    />
  );
}

export default AuthButton;
