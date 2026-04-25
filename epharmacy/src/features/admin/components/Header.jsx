import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../auth/slice/authThunks";
import "./css/Header.css";
import NotificationBell from "../../notifications/components/NotificationBell";

const ROUTE_LABELS = {
  "/admin": "Dashboard",
  "/admin/dashboard": "Dashboard",
  "/admin/medicine-management": "Medicine Management",
  "/admin/category-management": "Category Management",
  "/admin/user-management": "User Management",
  "/admin/orders-payment": "Order Management",
  "/admin/delivery-management": "Delivery Management",
  "/admin/prescription-management": "Prescription Management",
  "/admin/reports": "Reports",
};

function getBreadcrumb(pathname) {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];

  const match = Object.keys(ROUTE_LABELS)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];

  if (match) return ROUTE_LABELS[match];

  const segment = pathname.split("/").filter(Boolean).pop() || "Dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export default function Header({ onHamburger }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [date, setDate] = useState("");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const avatarRef = useRef(null);

  const pageLabel = getBreadcrumb(location.pathname);

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
    } catch {
    } finally {
      setLoggingOut(false);
      setAvatarOpen(false);
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={onHamburger}>☰</button>
        <div className="breadcrumb">
          <span>Home</span>
          <span className="sep">›</span>
          <span className="crumb-active">{pageLabel}</span>
        </div>
      </div>

      <div className="topbar-right">
        <span className="topbar-date">{date}</span>

        <div className="topbar-icon-btn">
          <NotificationBell />
        </div>

        <div className="topbar-user" ref={avatarRef} style={{ position: "relative" }}>
          <button
            className="topbar-avatar-btn"
            onClick={() => setAvatarOpen((o) => !o)}
            title="Account options"
          >
            <div className="topbar-avatar">A</div>
            <span className="topbar-username">Admin</span>
            <span
              style={{
                fontSize: 10,
                marginLeft: 2,
                color: "var(--text-muted)",
                transition: "transform 0.2s",
                display: "inline-block",
                transform: avatarOpen ? "rotate(180deg)" : "none",
              }}
            >
              ▾
            </span>
          </button>

          {avatarOpen && (
            <div className="avatar-dropdown">
              <div className="avatar-dd-header">
                <div className="avatar-dd-icon">A</div>
                <div>
                  <div className="avatar-dd-name">Admin</div>
                  <div className="avatar-dd-role">Administrator</div>
                </div>
              </div>
              <hr className="avatar-dd-divider" />
              

              <button
  className="dropdown-item text-danger"
  onClick={handleLogout}
  disabled={loggingOut}
  style={{
    fontSize: "14px",
    padding: "6px 12px",
    width: "auto",
    display: "inline-block"
  }}
>
  LOGOUT →
</button>
            </div>
          )}
        </div>
      </div>

     
    </header>
  );
}