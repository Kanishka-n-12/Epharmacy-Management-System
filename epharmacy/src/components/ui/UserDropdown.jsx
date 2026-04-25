import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../../features/auth/slice/authThunks";
import "./css/UserDropdown.css";

export default function UserDropdown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { phone } = useSelector((s) => s.auth);

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await dispatch(logout());
    navigate("/", { replace: true });
  }

  return (
    <div className="user-dropdown" ref={ref}>
      
      <div
  className="user-trigger"
  onClick={() => setOpen(prev => !prev)}
>
        <span className="fw-bold small d-none d-md-inline">
          Welcome, {phone}
        </span>

        <div className="user-avatar">
          <img
            src="https://res.cloudinary.com/dorv3lswe/image/upload/v1775886924/account_eavxvn.png"
            alt="User"
          />
        </div>
      </div>

      {open && (
        <ul className="user-menu">
          <li>
            <Link
              className="dropdown-item"
              to="/profile"
              onClick={() => setOpen(false)}
            >
              MY PROFILE
            </Link>
          </li>

          <li>
            <Link
              className="dropdown-item"
              to="/orders"
              onClick={() => setOpen(false)}
            >
              MY ORDERS
            </Link>
          </li>

          <li>
            <Link
              className="dropdown-item"
              to="/prescriptions"
              onClick={() => setOpen(false)}
            >
              MY PRESCRIPTIONS
            </Link>
          </li>
          

          <li>
            <hr className="dropdown-divider" />
          </li>

          <li>
            <button
              className="dropdown-item text-danger"
              onClick={handleLogout}
            >
              LOGOUT →
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}