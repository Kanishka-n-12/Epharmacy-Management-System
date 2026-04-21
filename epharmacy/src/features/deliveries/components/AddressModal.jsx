import { useState } from "react";
import { createPortal } from "react-dom";
import "../css/AddressModal.css";

const TYPES = ["HOME", "OFFICE", "OTHER"];

const EMPTY_FORM = {
  addressType: "HOME",
  name: "",
  phone: "",
  line: "",
  pincode: "",
  city: "",
  state: "",
};

export default function AddressModal({ initial, submitting, onClose, onSave }) {
  const [form, setForm] = useState(
    initial
      ? {
          addressType: initial.addressType,
          name: initial.name,
          phone: initial.phone,
          line: initial.line,
          pincode: initial.pincode,
          city: initial.city,
          state: initial.state,
        }
      : { ...EMPTY_FORM }
  );

  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.match(/^[A-Za-z0-9_ ]{2,20}$/))
      e.name = "Name must be 2–20 alphanumeric characters.";
    if (!form.phone.match(/^[6-9][0-9]{9}$/))
      e.phone = "Enter a valid 10-digit mobile number.";
    if (!form.line || form.line.length < 5)
      e.line = "Address must be at least 5 characters.";
    if (!form.pincode.match(/^[0-9]{6}$/))
      e.pincode = "Pincode must be exactly 6 digits.";
    if (!form.city.match(/^[A-Za-z ]{2,20}$/))
      e.city = "City must be 2–20 letters.";
    if (!form.state.match(/^[A-Za-z ]{2,20}$/))
      e.state = "State must be 2–20 letters.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onSave(form);
  };

  const handleReset = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
  };

  const typeBtnClass = (t) => {
    if (form.addressType !== t) return "";
    if (t === "HOME") return "active-home";
    if (t === "OFFICE") return "active-work";
    return "active-other";
  };

  return createPortal(
    <div className="addr-modal-overlay" onClick={onClose}>
      <div className="addr-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="addr-modal-header">
          <span className="addr-modal-title">
            {initial ? "Edit Address" : "Add New Address"}
          </span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Address Type */}
        <label className="form-label">Address Type</label>
        <div className="addr-type-group">
          {TYPES.map((t) => (
            <button
              key={t}
              className={`addr-type-btn ${typeBtnClass(t)}`}
              onClick={() => set("addressType", t)}
            >
              {t === "HOME" ? "🏠" : t === "OFFICE" ? "💼" : "📍"} {t}
            </button>
          ))}
        </div>

        {/* Name + Phone side by side */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="e.g. John_Doe"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              className={`form-input ${errors.phone ? "error" : ""}`}
              placeholder="10-digit number"
              maxLength={10}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/, ""))}
            />
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>
        </div>

        {/* Address Line */}
        <div className="form-group">
          <label className="form-label">Address Line</label>
          <input
            className={`form-input ${errors.line ? "error" : ""}`}
            placeholder="House no., Street, Area"
            value={form.line}
            onChange={(e) => set("line", e.target.value)}
          />
          {errors.line && <p className="form-error">{errors.line}</p>}
        </div>

        {/* Pincode */}
        <div className="form-group">
          <label className="form-label">Pincode</label>
          <input
            className={`form-input ${errors.pincode ? "error" : ""}`}
            placeholder="6-digit pincode"
            maxLength={6}
            value={form.pincode}
            onChange={(e) => set("pincode", e.target.value.replace(/\D/, ""))}
          />
          {errors.pincode && <p className="form-error">{errors.pincode}</p>}
        </div>

        {/* City + State */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              className={`form-input ${errors.city ? "error" : ""}`}
              placeholder="City"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
            {errors.city && <p className="form-error">{errors.city}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input
              className={`form-input ${errors.state ? "error" : ""}`}
              placeholder="State"
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
            />
            {errors.state && <p className="form-error">{errors.state}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn-submit"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Saving…" : initial ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}