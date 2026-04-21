// features/profile/components/ProfileForm.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, clearProfileMessages } from "../slice/profileSlice";
import AddressModal from "./AddressModal";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import "../css/ProfileForm.css";

/* ── Validation rules ── */
const RULES = {
  username: {
    required: "Username is required.",
    invalid: "Username must be at least 3 characters (letters, numbers, _).",
    fn: (v) => /^[a-zA-Z][a-zA-Z0-9_]{2,}$/.test(v),
  },
  email: {
    required: "Email address is required.",
    invalid: "Enter a valid email, e.g. user@gmail.com",
    fn: (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v),
  },
  firstName: {
    required: "First name is required.",
    invalid: "First name must be at least 3 alphabetic characters.",
    fn: (v) => /^[a-zA-Z]{3,}$/.test(v),
  },
  lastName: {
    required: "Last name is required.",
    invalid: "Last name must contain only alphabetic characters.",
    fn: (v) => /^[a-zA-Z]{1,}$/.test(v),
  },
};

function validate(field, value) {
  const rule = RULES[field];
  if (!rule) return "";
  const v = value.trim();
  if (!v) return rule.required;
  if (!rule.fn(v)) return rule.invalid;
  return "";
}

export default function ProfileForm() {
  const dispatch = useDispatch();
  const { profile, updating, successMsg, error } = useSelector((s) => s.profile);

  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    gender: "male",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [addressOpen, setAddressOpen] = useState(false);

  /* Pre-fill form when profile loads */
  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || "",
        email: profile.email || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        gender: profile.gender?.toLowerCase() || "male",
      });
    }
  }, [profile]);

  /* Auto-clear success/error messages */
  useEffect(() => {
    if (successMsg || error) {
      const t = setTimeout(() => dispatch(clearProfileMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [successMsg, error, dispatch]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Re-validate live if already touched
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  }

  function handleReset() {
    if (profile) {
      setForm({
        username: profile.username || "",
        email: profile.email || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        gender: profile.gender?.toLowerCase() || "male",
      });
    } else {
      setForm({ username: "", email: "", firstName: "", lastName: "", gender: "male" });
    }
    setErrors({});
    setTouched({});
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    let allValid = true;
    Object.keys(RULES).forEach((field) => {
      const msg = validate(field, form[field]);
      if (msg) { newErrors[field] = msg; allValid = false; }
    });

    setErrors(newErrors);
    setTouched({ username: true, email: true, firstName: true, lastName: true });

    if (!allValid) return;

    dispatch(updateProfile({
      username: form.username.trim(),
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
    }));
  }

  const fieldClass = (name) => {
    let cls = "field-input";
    if (touched[name] && errors[name]) cls += " is-invalid";
    else if (touched[name] && !errors[name]) cls += " is-valid";
    return cls;
  };

  return (
    <div className="profile-card">
      <div className="profile-card-inner">
        {/* Photo */}
        <ProfilePhotoUpload />

        {/* Form */}
        <form className="profile-form" onSubmit={handleSubmit} noValidate>

          {/* Phone — read-only from profile */}
          <div className="field-group">
            <label className="field-label">
              PHONE NUMBER <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="field-input prefilled"
              value={profile?.phone || ""}
              readOnly
            />
          </div>

          {/* Username */}
          <div className="field-group">
            <label className="field-label">
              USERNAME <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="username"
              className={fieldClass("username")}
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. john_doe"
            />
            {touched.username && errors.username && (
              <span className="err show">{errors.username}</span>
            )}
          </div>

          {/* Email */}
          <div className="field-group">
            <label className="field-label">
              EMAIL <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={fieldClass("email")}
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="user@example.com"
            />
            {touched.email && errors.email && (
              <span className="err show">{errors.email}</span>
            )}
          </div>

          {/* First Name */}
          <div className="field-group">
            <label className="field-label">
              FIRST NAME <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              className={fieldClass("firstName")}
              value={form.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John"
            />
            {touched.firstName && errors.firstName && (
              <span className="err show">{errors.firstName}</span>
            )}
          </div>

          {/* Last Name */}
          <div className="field-group">
            <label className="field-label">
              LAST NAME <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              className={fieldClass("lastName")}
              value={form.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Doe"
            />
            {touched.lastName && errors.lastName && (
              <span className="err show">{errors.lastName}</span>
            )}
          </div>

          {/* Gender */}
          <div className="field-group">
            <label className="field-label">
              GENDER <span className="text-danger">*</span>
            </label>
            <div className="gender-group">
              {["male", "female", "others"].map((g) => (
                <label key={g} className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                  />
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="alert-success">✅ {successMsg}</div>
          )}
          {error && (
            <div className="alert-error">
              ❌ {typeof error === "string" ? error : "Something went wrong."}
            </div>
          )}

          {/* Buttons */}
          <div className="form-btns">
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleReset}
            >
              Reset
            </button>

            <button
              type="submit"
              className="btn-save"
              disabled={updating}
            >
              {updating ? "SAVING…" : "SAVE & UPDATE"}
            </button>

            <button
              type="button"
              className="btn-manage"
              onClick={() => setAddressOpen(true)}
            >
              + MANAGE ADDRESS
            </button>
          </div>
        </form>
      </div>

      {/* Address Modal */}
      <AddressModal
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
      />
    </div>
  );
}