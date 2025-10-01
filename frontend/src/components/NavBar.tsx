import { FaBars, FaBell } from "react-icons/fa";
import JAW from "../assets/icons/JAW-transparent.png";
import profilePlaceHolder from "../assets/icons/profile.jpg";
import type { ReactNode } from "react";

interface INavBarProps {
  onToggleSidebar: () => void;
  profileImage?: string;
  onNotificationsClick: () => void;
  leadingIcon?: ReactNode;             // optional custom leading icon
  onLeadingIconClick?: () => void;     // optional click handler for leading icon
  showNotifications?: boolean;         // allow hiding notifications (default true)
}

function NavBar({
  onToggleSidebar,
  profileImage,
  onNotificationsClick,
  leadingIcon,
  onLeadingIconClick,
  showNotifications = true,
}: INavBarProps) {
  const resolvedProfileImage =
    profileImage && profileImage.trim() !== ""
      ? profileImage
      : profilePlaceHolder;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-grayColor shadow-sm border-b border-gray-300">
      {/* Left: Leading Icon (or Sidebar Toggle) + Logo */}
      <div className="flex items-center gap-3">
        {leadingIcon ? (
          <button onClick={onLeadingIconClick} className="text-gray-700">
            {leadingIcon}
          </button>
        ) : (
          <button onClick={onToggleSidebar} className="text-gray-700">
            <FaBars size={22} />
          </button>
        )}
        <img src={JAW} className="h-9" alt="Logo" />
      </div>

      {/* Right: Notifications (optional) + Profile */}
      <div className="flex items-center gap-4">
        {showNotifications && (
          <button onClick={onNotificationsClick} className="text-gray-700">
            <FaBell size={18} />
          </button>
        )}
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
