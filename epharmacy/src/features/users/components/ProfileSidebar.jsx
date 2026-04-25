// features/profile/components/ProfileSidebar.jsx
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../auth/slice/authThunks";
import { useNavigate } from "react-router-dom";
import "../css/ProfileSidebar.css";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dorv3lswe/image/upload/v1775886924/account_eavxvn.png";

export default function ProfileSidebar({ activeLink = "profile" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((s) => s.profile);

  async function handleLogout() {
    await dispatch(logout());
    navigate("/", { replace: true });
  }

  const navLinks = [
    { key: "profile", label: "MY PROFILE", to: "/profile" },
    { key: "orders", label: "MY ORDERS", to: "/orders" },
    { key: "prescriptions", label: "MY PRESCRIPTIONS", to: "/prescriptions" },
  ];

  return (
    <aside className="profile-sidebar">
      {/* Avatar */}
      <div className="sidebar-avatar-wrap">
        <div className="sidebar-avatar">
          <img
            src={profile?.imageUrl || DEFAULT_AVATAR}
            alt="User"
          />
        </div>
        {profile?.firstName && (
          <p className="sidebar-name">
            {profile.firstName} {profile.lastName}
          </p>
        )}
      </div>

      {/* Promo badge */}
      <div className="sidebar-promo">
        🏷️ FLAT 5% DISCOUNT ON YOUR FIRST 3 ORDERS
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navLinks.map(({ key, label, to }) => (
          <Link
            key={key}
            to={to}
            className={`sidebar-link${activeLink === key ? " active" : ""}`}
          >
            {label}
          </Link>
        ))}
        <button className="sidebar-link logout-link" onClick={handleLogout}>
          LOGOUT <span className="logout-arrow">→</span>
        </button>
      </nav>
    </aside>
  );
}