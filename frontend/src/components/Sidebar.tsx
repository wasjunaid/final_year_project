import SideBarButton from "./SideBarButton";
import { FaSignOutAlt } from "react-icons/fa";

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
            // TODO: Add logout logic later
          }}
          collapsed={collapsed}
        />
      </div>
    </div>
  );
}

export default SideBar;
