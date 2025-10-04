import { FaBars, FaBell } from "react-icons/fa";
import JAW from "../assets/icons/JAW-transparent.png";
import profilePlaceHolder from "../assets/icons/profile.jpg";
import type { ReactNode } from "react";

interface INavBarProps {
  className?: string;
  style?: React.CSSProperties;
  onToggleSidebar: () => void;
  profileImage?: string;
  onNotificationsClick: () => void;
  disableLeadingIcon?: boolean;
  leadingIcon?: ReactNode; // optional custom leading icon
  onLeadingIconClick?: () => void; // optional click handler for leading icon
  hideNotifications?: boolean; // allow hiding notifications (default true)
}

function NavBar({
  className = "",
  style,
  onToggleSidebar,
  profileImage,
  onNotificationsClick,
  disableLeadingIcon = false,
  leadingIcon,
  onLeadingIconClick,
  hideNotifications = false,
}: INavBarProps) {
  const resolvedProfileImage =
    profileImage && profileImage.trim() !== ""
      ? profileImage
      : profilePlaceHolder;

  return (
    <div
      className={`flex
        items-center 
        justify-between 
        px-4 
        py-2 
        bg-white 
        shadow-sm  
        ${className}
      `}
      style={style}
    >
      {/* Left: Leading Icon (or Sidebar Toggle) + Logo */}
      <div className="flex items-center gap-3">
        {!disableLeadingIcon && (
          <>
            {leadingIcon ? (
              <button onClick={onLeadingIconClick} className="text-gray-700">
                {leadingIcon}
              </button>
            ) : (
              <button onClick={onToggleSidebar} className="text-gray-700">
                <FaBars size={22} />
              </button>
            )}
          </>
        )}
        <img src={JAW} className="h-12" alt="Logo" />
      </div>

      {/* Right: Notifications (optional) + Profile */}
      <div className="flex items-center gap-4">
        {!hideNotifications && (
          <button onClick={onNotificationsClick} className="text-gray-700">
            <FaBell size={18} />
          </button>
        )}
        <img
          src={resolvedProfileImage}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </div>
  );
}

export default NavBar;
