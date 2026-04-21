import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearMessages } from "../slice/authSlice";
import Required from "../../../components/ui/Required";
import Toast from "../../admin/components/Toast";

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

export default function ChangePasswordModal({ show, onClose, verifiedPhone, otp, onPasswordChanged }) {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);

  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  function showToast(msg, type = "success") {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type }), 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!newPass) errs.newPass = "Password cannot be empty";
    else if (!passRegex.test(newPass)) errs.newPass = "Min 8 chars, 1 Upper, 1 Lower, 1 Number, 1 Special";
    if (!confirm) errs.confirm = "Please confirm your password";
    else if (newPass !== confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await dispatch(resetPassword({
      phone: verifiedPhone, otp: String(otp), newPassword: newPass,
    }));

    if (resetPassword.fulfilled.match(result)) {
      showToast("Password changed successfully!");
      setNewPass(""); setConfirm(""); setErrors({});
      dispatch(clearMessages());
      setTimeout(() => { onPasswordChanged?.(); onClose(); }, 1500);
    }
  }

  useEffect(() => { if (error) showToast(error, "error"); }, [error]);

  return (
    <>
      <Toast show={toast.show} msg={toast.msg} type={toast.type} />

      <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
        <div className="modal-content login-modal-content p-4">
          <div className="modal-header border-0 pb-0 justify-content-center position-relative">
            <button className="btn-close position-absolute top-0 end-0 m-2" onClick={onClose} />
            <div className="d-flex flex-column align-items-center gap-1">
              <img src={LOGO_URL} alt="Logo" style={{ width: 48, height: 48, borderRadius: 8 }} />
              <span style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: 2, color: "#28a745" }}>
                EPHARMACY
              </span>
            </div>
          </div>

          <div className="modal-body text-center pt-2">
            <h5 className="fw-bold mb-1">Change Password</h5>

            <form onSubmit={handleSubmit} noValidate autoComplete="off">
              <div className="mb-3 text-start">
                <label className="form-label fw-bold" style={{ fontSize: "0.78rem" }}>
                  Enter New Password <Required />
                </label>
                <div className="position-relative">
                  <input type={showNew ? "text" : "password"}
                    className={`form-control login-input ${errors.newPass ? "is-invalid-input" : ""}`}
                    placeholder="Enter new password" value={newPass} style={{ paddingRight: "40px" }}
                    onChange={(e) => { setNewPass(e.target.value); setErrors((p) => ({ ...p, newPass: "" })); }}
                  />
                  <span style={eyeIconStyle} onClick={() => setShowNew((v) => !v)}>
                    {showNew ? <EyeOff /> : <EyeOpen />}
                  </span>
                </div>
                {errors.newPass && <div className="text-danger" style={{ fontSize: "0.7rem" }}>{errors.newPass}</div>}
              </div>

              <div className="mb-3 text-start">
                <label className="form-label fw-bold" style={{ fontSize: "0.78rem" }}>
                  Confirm Password <Required />
                </label>
                <div className="position-relative">
                  <input type={showConfirm ? "text" : "password"}
                    className={`form-control login-input ${errors.confirm ? "is-invalid-input" : ""}`}
                    placeholder="Confirm new password" value={confirm} style={{ paddingRight: "40px" }}
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
                  CHANGE PASSWORD
                </button>
                <button type="button" className="btn btn-reset px-4"
                  onClick={() => { setNewPass(""); setConfirm(""); setErrors({}); }}>
                  RESET
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}