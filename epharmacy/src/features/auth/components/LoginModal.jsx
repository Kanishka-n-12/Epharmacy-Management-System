import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../slice/authThunks";
import Required from "../../../components/ui/Required";
import Toast from "../../admin/components/Toast";

const phoneRegex = /^[6-9][0-9]{9}$/;

export default function LoginModal({ show, onClose, onSwitchToRegister, onSwitchToForgot }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading } = useSelector((state) => state.auth);

  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [toast,    setToast]    = useState({ show: false, msg: "", type: "success" });

  function showToast(msg, type = "success") {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type }), 3000);
  }

  function validate() {
    const e = {};
    if (!phone) 
      e.phone = "Phone number cannot be empty";
    else if (!phoneRegex.test(phone))
       e.phone = "Must be 10 digits, starts with 6-9";
    if (!password)
       e.password = "Password cannot be empty";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    const result = await dispatch(login({ phone, password }));

    if (login.fulfilled.match(result)) {
      const { role } = result.payload;
      showToast("Login successful!");
      setTimeout(() => {
        onClose();
        if (role === "ROLE_ADMIN") navigate("/admin/dashboard", { replace: true });
        else if (role === "ROLE_USER") {
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        } else navigate("/", { replace: true });
      }, 800);
      return;
    }

    if (login.rejected.match(result)) {
      setApiError(typeof result.payload === "string" ? result.payload : "Invalid credentials");
    }
  }

  function handleReset() {
    setPhone("");
    setPassword("");
    setErrors({});
    setApiError("");
  }

  return (
    <>
    {toast.show && toast.type === "success" && (
  <Toast show={toast.show} msg={toast.msg} type={toast.type} />
)}

      <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
        <div className="modal-content login-modal-content p-4">
          
          <div className="modal-header border-0 pb-0 justify-content-center position-relative">
            <button type="button" className="btn-close position-absolute top-0 end-0 m-2" onClick={onClose} />
            <div className="d-flex flex-column align-items-center gap-1">
              <img
                src="https://res.cloudinary.com/dorv3lswe/image/upload/v1775886926/logo_xefmqf.png"
                alt="Logo"
                style={{ width: 48, height: 48, borderRadius: 8 }}
              />
              <span style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: 2, color: "#28a745" }}>
                EPHARMACY
              </span>
            </div>
          </div>

          <div className="modal-body text-center pt-2">
            <h5 className="fw-bold mb-1">Hello User, Welcome to Epharm!</h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>
              Login with your phone number
            </p>

            {apiError && (
              <div style={{
                background: "#fce4e4", color: "#c62828", fontSize: "0.78rem",
                fontWeight: 600, padding: "10px 14px", borderRadius: 8,
                marginBottom: 16, textAlign: "left", border: "1px solid #f5c6c6",
              }}>
                 {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate autoComplete="off">
              <div className="mb-3 text-start">
                <label className="form-label fw-bold" style={{ fontSize: "0.78rem" }}>
                  Phone Number <Required />
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  className={`form-control login-input ${errors.phone ? "is-invalid-input" : ""}`}
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); setApiError(""); }}
                />
                {errors.phone && <div className="text-danger" style={{ fontSize: "0.7rem" }}>{errors.phone}</div>}
              </div>

              <div className="mb-1 text-start">
                <label className="form-label fw-bold" style={{ fontSize: "0.78rem" }}>
                  Password <Required />
                </label>
                <div className="position-relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className={`form-control login-input ${errors.password ? "is-invalid-input" : ""}`}
                    placeholder="Enter password"
                    value={password}
                    style={{ paddingRight: "40px" }}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); setApiError(""); }}
                  />
                  <span
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      cursor: "pointer", position: "absolute", right: "12px",
                      top: "50%", transform: "translateY(-50%)",
                      display: "flex", alignItems: "center", color: "#6c757d",
                    }}
                  >
                    {showPass ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </span>
                </div>
                {errors.password && <div className="text-danger" style={{ fontSize: "0.7rem" }}>{errors.password}</div>}
              </div>

              <div className="text-start mb-3">
                <a href="#" style={{ fontSize: "0.75rem", color: "rgb(87,149,242)", textDecoration: "none" }}
                  onClick={(e) => { e.preventDefault(); onClose(); onSwitchToForgot?.(); }}>
                  Forgot password?
                </a>
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button type="submit" className="btn btn-login px-4" disabled={loading}>
                  {loading ? "LOGGING IN…" : "LOGIN"}
                </button>
                <button type="button" className="btn btn-reset px-4" onClick={handleReset} disabled={loading}>
                  RESET
                </button>
              </div>
            </form>

            <p className="mt-4" style={{ fontSize: "0.78rem" }}>
              Don't have account?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); onClose(); onSwitchToRegister?.(); }}
                style={{ color: "rgb(87,149,242)", textDecoration: "none" }}>
                Create account
              </a>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}