import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import SideBarButton from "./SideBarButton";
import { FaSignOutAlt } from "react-icons/fa";
import ROUTES from "../constants/routes";

export interface ISideBarItem {
  label: string;
  icon: React.ReactNode;
  page: string; // page identifier
}

interface ISideBarProps {
  items: ISideBarItem[];
  selected: string;
  onSelect: (page: string) => void;
  collapsed: boolean;
}

function SideBar({ items, selected, onSelect, collapsed }: ISideBarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className={` bg-grayColor shadow-sm transition-all duration-200 flex flex-col justify-between
      ${collapsed ? "w-14" : "w-50"} p-2`}
    >
      {/* Top Section - Sidebar Items */}
      <div className="flex flex-col gap-2 mt-2">
        {items.map((item) => (
          <SideBarButton
            key={item.page}
            label={item.label}
            icon={item.icon}
            selected={selected === item.page}
            onClick={() => onSelect(item.page)}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Bottom Section - Logout Button */}
      <div className="mb-2">
        <SideBarButton
          label="Logout"
          icon={<FaSignOutAlt />}
          selected={false}
          onClick={() => {
            signOut();
            navigate(ROUTES.AUTH.SIGN_IN);
          }}
          collapsed={collapsed}
        />
      </div>
    </div>
  );
}

export default SideBar;
