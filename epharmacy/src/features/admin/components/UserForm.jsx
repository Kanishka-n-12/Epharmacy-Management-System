
import "./css/UserForm.css";


export default function UserForm({ form, errors, isEdit, onChange }) {

  const field = (id, label, required, type = "text", placeholder = "") => (
    <div className="mfield">
      <label className="mlabel" htmlFor={id}>
        {label} {required && <span className="req-star">*</span>}
      </label>
      <input
        id={id}
        className={`minput${errors[id] ? " err" : ""}`}
        type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={(e) => onChange(id, e.target.value)}
        autoComplete={type === "password" ? "new-password" : "off"}
      />
      {errors[id] && <div className="merr show">{errors[id]}</div>}
    </div>
  );

  const select = (id, label, required, options) => (
    <div className="mfield">
      <label className="mlabel" htmlFor={id}>
        {label} {required && <span className="req-star">*</span>}
      </label>
      <select
        id={id}
        className={`mselect${errors[id] ? " err" : ""}`}
        value={form[id]}
        onChange={(e) => onChange(id, e.target.value)}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(({ v, l }) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {errors[id] && <div className="merr show">{errors[id]}</div>}
    </div>
  );

  return (
    <div className="user-form">
      <div className="form-row">
        {field("firstName", "First Name", true, "text", "Enter first name")}
        {field("lastName",  "Last Name",  true, "text", "Enter last name")}
      </div>
      <div className="form-row">
        {field("email", "Email",  false, "email", "user@example.com")}
        {field("phone", "Phone",  true,  "tel",   "10-digit mobile number")}
      </div>
      <div className="form-row">
        {select("gender", "Gender", true, [
          { v: "male",   l: "Male"   },
          { v: "female", l: "Female" },
          { v: "other",  l: "Other"  },
        ])}
        {select("roleId", "Role", true, [
          { v: "1", l: "Admin" },
          { v: "2", l: "User"  },
        ])}
      </div>
      <div className="form-row">
        {select("status", "Status", true, [
          { v: "active",   l: "Active"   },
          { v: "inactive", l: "Inactive" },
        ])}
        {!isEdit && field("password", "Password", true, "password", "Min. 8 characters")}
      </div>
      <div className="form-row single">
        {field("username", "Username", false, "text", "Enter username (optional)")}
      </div>
    </div>
  );
}