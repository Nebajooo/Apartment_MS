import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { isAdmin, isTenant } = useAuth();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/notices", label: "Notice Board", icon: "📢" },
  ];

  // Add to menuItems when isAdmin:
  if (isAdmin) {
    menuItems.push(
      { path: "/dashboard", label: "Dashboard", icon: "📊" },
      { path: "/apartments", label: "Apartments", icon: "🏢" }, // Add this
      { path: "/tenants", label: "Tenants", icon: "👥" },
      { path: "/maintenance", label: "Maintenance", icon: "🔧" },
      { path: "/rent", label: "Rent", icon: "💰" },
      { path: "/visitors", label: "Visitors", icon: "🚪" },
      { path: "/notices", label: "Notices", icon: "📢" },
    );
  }
  if (isTenant) {
    menuItems.push(
      { path: "/maintenance", label: "My Requests", icon: "🔧" },
      { path: "/rent", label: "My Rent", icon: "💰" },
      { path: "/visitors", label: "My Visitors", icon: "🚪" },
    );
  }

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
