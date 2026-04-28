import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { register} from "../slice/authThunks";
import { clearMessages } from "../slice/authSlice";
import Required from "../../../components/ui/Required";
import Toast from "../../admin/components/Toast";

const phoneRegex = /^[6-9][0-9]{9}$/;
const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const LOGO_URL = "https://res.cloudinary.com/dorv3lswe/image/upload/v1775886926/logo_xefmqf.png";

const EyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const eyeIconStyle = {
  cursor: "pointer", position: "absolute", right: "12px",
  top: "50%", transform: "translateY(-50%)",
  display: "flex", alignItems: "center", color: "#6c757d", transition: "color 0.2s",
};

export default function RegisterModal({ show, onClose, onSwitchToLogin }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState("");
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

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
    else if (!passRegex.test(password))
       e.password = "Min 8 chars, 1 Upper, 1 Lower, 1 Number, 1 Special";
    if (!confirm)
       e.confirm = "Please confirm your password";
    else if (password !== confirm)
       e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setApiError("");
  if (!validate()) return;

  const result = await dispatch(register({ phone, password, name: phone, email: "" }));

  if (register.fulfilled.match(result)) {
    showToast("Registration successful! Please login."); 
    setTimeout(() => {
      dispatch(clearMessages());
      handleClose();
      onSwitchToLogin?.();
    }, 2000);
    return;
  }

  if (register.rejected.match(result)) {
    const msg = typeof result.payload === "string" ? result.payload : "Registration failed";
    setApiError(msg); 
  }
}

  function handleReset() {
  setPhone(""); setPassword(""); setConfirm(""); 
  setErrors({});
  setApiError(""); 
}

  function handleClose() {
    handleReset();
    dispatch(clearMessages());
    onClose();
  }

  useEffect(() => {
    if (show) dispatch(clearMessages());
  }, [show, dispatch]);

  return (
    <>
      {toast.show && toast.type === "success" && (
  <Toast show={toast.show} msg={toast.msg} type={toast.type} />
)}

      <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
        <div className="modal-content login-modal-content p-4">
          <div className="modal-header border-0 pb-0 justify-content-center position-relative">
            <button className="btn-close position-absolute top-0 end-0 m-2" onClick={handleClose} />
            <div className="d-flex flex-column align-items-center gap-1">
              <img src={LOGO_URL} alt="Logo" style={{ width: 48, height: 48, borderRadius: 8 }} />
              <span style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: 2, color: "#28a745" }}>
                EPHARMACY
              </span>
            </div>
          </div>

          <div className="modal-body text-center pt-2">
            <h5 className="fw-bold mb-1">Sign up</h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.72rem", textTransform: "uppercase" }}>
              Register with your phone number
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
                <input type="tel" maxLength={10}
                  className={`form-control login-input ${errors.phone ? "is-invalid-input" : ""}`}
                  placeholder="Enter phone number" value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                />
                {errors.phone && <div className="text-danger" style={{ fontSize: "0.7rem" }}>{errors.phone}</div>}
              </div>

             
              <div className="mb-3 text-start">
                <label className="form-label fw-bold" style={{ fontSize: "0.78rem" }}>
                  Password <Required />
                </label>
                <div className="position-relative">
                  <input type={showPass ? "text" : "password"}
                    className={`form-control login-input ${errors.password ? "is-invalid-input" : ""}`}
                    placeholder="Enter password" value={password} style={{ paddingRight: "40px" }}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                  />
                  <span style={eyeIconStyle} onClick={() => setShowPass((v) => !v)}>
                    {showPass ? <EyeOff /> : <EyeOpen />}
                  </span>
                </div>
                {errors.password && <div className="text-danger" style={{ fontSize: "0.7rem" }}>{errors.password}</div>}
              </div>

              
              <div className="mb-3 text-start">
                <label className="form-label fw-bold" style={{ fontSize: "0.78rem" }}>
                  Confirm Password <Required />
                </label>
                <div className="position-relative">
                  <input type={showConfirm ? "text" : "password"}
                    className={`form-control login-input ${errors.confirm ? "is-invalid-input" : ""}`}
                    placeholder="Confirm password" value={confirm} style={{ paddingRight: "40px" }}
                    onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }}
                  />
                  <span style={eyeIconStyle} onClick={() => setShowConfirm((v) => !v)}>
                    {showConfirm ? <EyeOff /> : <EyeOpen />}
                  </span>
                </div>
                {errors.confirm && <div className="text-danger" style={{ fontSize: "0.7rem" }}>{errors.confirm}</div>}
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button type="submit" className="btn btn-login px-4" disabled={loading}>
                  {loading ? "REGISTERING..." : "REGISTER"}
                </button>
                <button type="button" className="btn btn-reset px-4" onClick={handleReset} disabled={loading}>
                  RESET
                </button>
              </div>
            </form>

            <p className="mt-4" style={{ fontSize: "0.78rem" }}>
              Already have an account?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); handleClose(); onSwitchToLogin?.(); }}
                style={{ color: "rgb(87,149,242)", textDecoration: "none" }}>
                Login here
              </a>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}