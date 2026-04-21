 

import { useState, useEffect }       from "react";
import { useSelector, useDispatch }  from "react-redux";
import { useNavigate }               from "react-router-dom";

import { logout }                  from "../../../features/auth/slice/authSlice";
import { fetchCartCount }          from "../../../features/cart/slice/cartSlice";
import LoginModal                  from "../../../features/auth/components/LoginModal";
import RegisterModal               from "../../../features/auth/components/RegisterModal";
import ForgotPasswordModal         from "../../../features/auth/components/ForgotPasswordModal";
import ChangePasswordModal         from "../../../features/auth/components/ChangePasswordModal";
import NotificationBell from "../../../features/notifications/components/NotificationBell";
import UserDropdown from "../../ui/UserDropdown";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
 
  const { isAuthenticated, phone } = useSelector((s) => s.auth);
  const cartCount                  = useSelector((s) => s.cart.count);

   
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartCount());
    }
  }, [isAuthenticated, dispatch]);

  const [modal,         setModal]         = useState(null);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [verifiedOtp,   setVerifiedOtp]   = useState("");

  const openModal  = (name) => setModal(name);
  const closeModal = ()     => setModal(null);

  async function handleLogout() {
    await dispatch(logout());
    navigate("/", { replace: true });
  }

  function handleOtpVerified({ phone, otp }) {
    setVerifiedPhone(phone);
    setVerifiedOtp(otp);
    closeModal();
    setTimeout(() => openModal("change"), 300);
  }

  function handlePasswordChanged() {
    closeModal();
    setTimeout(() => openModal("login"), 300);
  }

  return (
    <>
      <header className="bg-white py-2 border-bottom">
        <div className="container d-flex justify-content-between align-items-center">

          
          <div className="d-flex align-items-center">
            <img
              src="https://res.cloudinary.com/dorv3lswe/image/upload/v1775886926/logo_xefmqf.png"
              alt="Logo"
              className="me-3 logo-img"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            />
            <span className="brand-name">EPHARMACY</span>
            <div className="address-text d-none d-lg-block ms-3">
              <span className="text-muted small">📍 5/167, Uttharappan Nagar, Salem-636010.</span>
            </div>
          </div>

         
          <div className="d-flex align-items-center gap-4 header-tools">
            <span className="icon d-none d-sm-inline"
            onClick={() => navigate("/prescriptions")}>☁️</span>
            <div className="d-flex align-items-center ms-auto">
            <NotificationBell />
          </div>
            <span
              className="icon position-relative"
              onClick={() => navigate("/cart")}
              style={{ cursor: "pointer" }}
            >
              🛒
              <span className="badge-count">{cartCount}</span>
            </span>

            {isAuthenticated ? (
  <UserDropdown />
) : (
  <span
    className="text-dark fw-bold small"
    style={{ cursor: "pointer" }}
    onClick={() => openModal("login")}
  >
    Login / Sign Up
  </span>
)}
          </div>
        </div>
      </header>

      
      <LoginModal
        show={modal === "login"}
        onClose={closeModal}
        onSwitchToRegister={() => { closeModal(); setTimeout(() => openModal("register"), 300); }}
        onSwitchToForgot={() => { closeModal(); setTimeout(() => openModal("forgot"), 300); }}
      />
      <RegisterModal
        show={modal === "register"}
        onClose={closeModal}
        onSwitchToLogin={() => { closeModal(); setTimeout(() => openModal("login"), 300); }}
      />
      <ForgotPasswordModal
        show={modal === "forgot"}
        onClose={closeModal}
        onSwitchToLogin={() => { closeModal(); setTimeout(() => openModal("login"), 300); }}
        onOtpVerified={handleOtpVerified}
      />
      <ChangePasswordModal
        show={modal === "change"}
        onClose={closeModal}
        verifiedPhone={verifiedPhone}
        otp={verifiedOtp}
        onPasswordChanged={handlePasswordChanged}
      />
    </>
  );
}