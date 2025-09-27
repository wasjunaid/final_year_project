import SideBarButton, {
  type ISideBarButtonProps,
} from "../../../components/SideBarButton";

interface IAuthButtonProps extends ISideBarButtonProps {}

function AuthButton(props: IAuthButtonProps) {
  return (
    <SideBarButton className="justify-center font-medium" selected {...props} />
  );
}

export default AuthButton;
