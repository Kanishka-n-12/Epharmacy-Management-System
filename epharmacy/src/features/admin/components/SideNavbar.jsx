import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../features/auth/slice/authSlice";
import "./css/SideNavbar.css";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/user-management", label: "User Management" },
  { to: "/admin/category-management", label: "Category Management" },
  { to: "/admin/medicine-management", label: "Medicine Management" },
  { to: "/admin/orders-payment", label: "Orders & Payment" },
  { to: "/admin/prescription-management", label: "Prescription Management" },
  { to: "/admin/delivery-management", label: "Delivery Management" },
  { to: "/admin/reports", label: "Reports & Analytics" },
];

export default function SideNavbar({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm("Log out of EPHARMACY Admin?")) {
      await dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      
      <div className="admin-sidebar-logo">
        <img
          src="https://res.cloudinary.com/dorv3lswe/image/upload/v1775886926/logo_xefmqf.png"
          alt="EPHARMACY Logo"
          className="admin-sidebar-logo-img"
        />
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-name">EPHARMACY</span>
          <span className="admin-sidebar-sub">Admin Panel</span>
        </div>
      </div>

     
      <nav className="admin-sidebar-nav">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            {label}
          </NavLink>
        ))}
      </nav>

     
      <div className="admin-sidebar-footer">
        <div className="admin-avatar">A</div>
        <div className="admin-info">
          <p className="admin-name">Administrator</p>
          <p className="admin-role">Admin</p>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          ⏻
        </button>
      </div>
    </aside>
  );
}