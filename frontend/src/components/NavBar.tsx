import { FaBars, FaBell } from "react-icons/fa";
import JAW from "../assets/icons/JAW-transparent.png";
import profilePlaceHolder from "../assets/icons/profile.jpg";

interface INavBarProps {
  onToggleSidebar: () => void;
  profileImage?: string;
  onNotificationsClick: () => void;
}

function NavBar({
  onToggleSidebar,
  profileImage,
  onNotificationsClick,
}: INavBarProps) {
  const resolvedProfileImage =
    profileImage && profileImage.trim() !== ""
      ? profileImage
      : profilePlaceHolder;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-grayColor shadow-sm border-b border-gray-300">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="text-gray-700">
          <FaBars size={22} />
        </button>
        <img src={JAW} className="h-9" alt="Logo" />
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4">
        <button onClick={onNotificationsClick} className="text-gray-700">
          <FaBell size={18} />
        </button>
        <img
          src={resolvedProfileImage}
          alt="Profile"
          className="w-9 h-9 rounded-full object-cover"
        />
      </div>
    </div>
  );
}

export default NavBar;
