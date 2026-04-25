import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../slice/authThunks";
import Required from "../../../components/ui/Required";
import Toast from "../../admin/components/Toast";
import { clearMessages } from "../slice/authSlice";

const phoneRegex = /^[6-9][0-9]{9}$/;

export default function ForgotPasswordModal({ show, onClose, onOtpVerified }) {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  function showToast(msg, type = "success") {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type }), 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!otpStep) {
      if (!phone) return setErrors({ phone: "Phone cannot be empty" });
      if (!phoneRegex.test(phone)) return setErrors({ phone: "Must be 10 digits, starts with 6-9" });

      const result = await dispatch(forgotPassword(phone));
      if (forgotPassword.fulfilled.match(result)) {
        setOtpStep(true);
        setErrors({});
        showToast("OTP sent successfully!");
      }
    } else {
      if (!otp) return setErrors({ otp: "Please enter the code" });
      handleReset();
      onClose();
      onOtpVerified?.({ phone, otp });
    }
  }

  function handleReset() {
    setPhone(""); setOtp(""); setOtpStep(false); setErrors({});
    dispatch(clearMessages());
  }

  useEffect(() => { if (error) showToast(error, "error"); }, [error]);
  useEffect(() => { if (success) showToast(success); }, [success]);

  return (
    <>
      <Toast show={toast.show} msg={toast.msg} type={toast.type} />

      <Modal show={show} onHide={() => { handleReset(); onClose(); }} centered backdrop="static" keyboard={false}>
        <div className="modal-content login-modal-content p-4">
          <div className="modal-header border-0 pb-0 justify-content-center position-relative">
            <button className="btn-close position-absolute top-0 end-0 m-2"
              onClick={() => { handleReset(); onClose(); }} />
            <div className="d-flex flex-column align-items-center gap-1">
              <img src="https://res.cloudinary.com/dorv3lswe/image/upload/v1775886926/logo_xefmqf.png"
                alt="Logo" style={{ width: 48, height: 48, borderRadius: 8 }} />
              <span style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: 2, color: "#28a745" }}>
                EPHARMACY
              </span>
            </div>
          </div>

          <div className="modal-body text-center pt-2">
            <h5 className="fw-bold mb-1">Forgot Password</h5>

            <form onSubmit={handleSubmit}>
              <div className="mb-3 text-start">
                <label className="form-label fw-bold" style={{ fontSize: "0.78rem" }}>
                  Phone Number <Required />
                </label>
                <input type="text" maxLength={10}
                  className={`form-control login-input ${errors.phone ? "is-invalid-input" : ""}`}
                  placeholder="Enter phone number" value={phone} readOnly={otpStep}
                  onChange={(e) => { setPhone(e.target.value); setErrors({}); }}
                />
                {errors.phone && <div className="text-danger" style={{ fontSize: "0.7rem" }}>{errors.phone}</div>}
              </div>

              {otpStep && (
                <div className="mb-3 text-start">
                  <label className="form-label fw-bold" style={{ fontSize: "0.78rem" }}>
                    Verification Code :
                  </label>
                  <input type="text" maxLength={6}
                    className={`form-control login-input text-center ${errors.otp ? "is-invalid-input" : ""}`}
                    placeholder="Enter 6-digit code" value={otp} style={{ letterSpacing: 4 }}
                    onChange={(e) => { setOtp(e.target.value); setErrors({}); }}
                  />
                  {errors.otp && <div className="text-danger" style={{ fontSize: "0.7rem" }}>{errors.otp}</div>}
                </div>
              )}

              <div className="d-flex justify-content-center gap-3">
                <button type="submit" className="btn btn-login px-4" disabled={loading}>
                  {otpStep ? "VERIFY CODE" : "SEND CODE"}
                </button>
                <button type="button" className="btn btn-reset px-4" onClick={handleReset}>
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