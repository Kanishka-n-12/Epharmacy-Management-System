// features/profile/components/AddressModal.jsx
import { useState, useEffect } from "react";
import "../css/AddressModal.css";

const EMPTY_FORM = {
  type: "Home",
  text: "",
  city: "",
  pin: "",
  phone: "",
};

const STORAGE_KEY = "epharmAddresses";

function loadAddresses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAddresses(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function AddressModal({ open, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setAddresses(loadAddresses());
      setForm(EMPTY_FORM);
      setErrors({});
      setSaved(false);
    }
  }, [open]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.text.trim()) errs.text = "Address is required.";
    if (!form.city.trim()) errs.city = "City is required.";
    if (!form.pin) errs.pin = "PIN code is required.";
    else if (!/^\d{6}$/.test(form.pin)) errs.pin = "Enter a valid 6-digit PIN code.";
    if (!form.phone) errs.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = "Enter a valid 10-digit phone number.";
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const newAddr = { ...form, id: Date.now() };
    const updated = [...addresses, newAddr];
    saveAddresses(updated);
    setAddresses(updated);
    setForm(EMPTY_FORM);
    setErrors({});
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function handleDelete(id) {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddresses(updated);
    setAddresses(updated);
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
  }

  return (
    <div className="addr-overlay" onClick={onClose}>
      <div className="addr-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="addr-modal-header">
          <h5 className="addr-modal-title">Manage Addresses</h5>
          <button className="addr-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="addr-modal-body">
          {/* Type */}
          <div className="addr-field">
            <label className="addr-label">Address Type</label>
            <select
              name="type"
              className="addr-select"
              value={form.type}
              onChange={handleChange}
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
          </div>

          {/* Full Address */}
          <div className="addr-field">
            <label className="addr-label">
              Full Address <span className="text-danger">*</span>
            </label>
            <textarea
              name="text"
              className={`addr-textarea${errors.text ? " is-invalid" : ""}`}
              rows={3}
              placeholder="Street, area, landmark..."
              value={form.text}
              onChange={handleChange}
            />
            {errors.text && <span className="addr-err">{errors.text}</span>}
          </div>

          {/* City & PIN */}
          <div className="addr-row">
            <div className="addr-field">
              <label className="addr-label">
                City <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="city"
                className={`addr-input${errors.city ? " is-invalid" : ""}`}
                placeholder="City"
                value={form.city}
                onChange={handleChange}
              />
              {errors.city && <span className="addr-err">{errors.city}</span>}
            </div>

            <div className="addr-field">
              <label className="addr-label">
                Pincode <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="pin"
                className={`addr-input${errors.pin ? " is-invalid" : ""}`}
                placeholder="6-digit PIN"
                maxLength={6}
                value={form.pin}
                onChange={(e) =>
                  handleChange({
                    target: { name: "pin", value: e.target.value.replace(/\D/g, "") },
                  })
                }
              />
              {errors.pin && <span className="addr-err">{errors.pin}</span>}
            </div>
          </div>

          {/* Phone */}
          <div className="addr-field">
            <label className="addr-label">
              Phone <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              className={`addr-input${errors.phone ? " is-invalid" : ""}`}
              placeholder="10-digit mobile number"
              maxLength={10}
              value={form.phone}
              onChange={(e) =>
                handleChange({
                  target: { name: "phone", value: e.target.value.replace(/\D/g, "") },
                })
              }
            />
            {errors.phone && <span className="addr-err">{errors.phone}</span>}
          </div>

          {/* Saved Addresses */}
          {addresses.length > 0 && (
            <div className="saved-addresses">
              <hr />
              <p className="saved-title">Saved Addresses</p>
              {addresses.map((a) => (
                <div key={a.id} className="saved-addr-item">
                  <span className="addr-type-badge">{a.type}</span>
                  <button
                    className="addr-delete-btn"
                    onClick={() => handleDelete(a.id)}
                    title="Delete address"
                  >
                    🗑️
                  </button>
                  <p className="addr-text">
                    {a.text}, {a.city} — {a.pin}
                    <br />
                    📞 {a.phone}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="addr-modal-footer">
          <button className="btn btn-danger btn-sm" onClick={handleReset}>
            Reset
          </button>
          <button className="addr-save-btn" onClick={handleSave}>
            {saved ? "✅ Saved!" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}