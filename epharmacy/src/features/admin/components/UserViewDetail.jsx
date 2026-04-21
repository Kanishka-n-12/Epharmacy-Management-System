
import "./css/UserViewDetail.css";

const fullName = (u) =>
  u?.firstName ? `${u.firstName} ${u.lastName}`.trim() : `(${u?.phone})`;


export default function UserViewDetail({ u }) {
  const roleId = u.roleId ?? u.role;

  const items = [
    { label: "Full Name",  value: fullName(u) },
    { label: "Username",   value: u.username || "—" },
    { label: "Email",      value: u.email || "—" },
    { label: "Phone",      value: u.phone },
    { label: "Gender",     value: u.gender || "—", cap: true },
    { label: "Role",       value: roleId === 1 ? "Admin" : "User" },
    { label: "Status",     value: u.status === "active" ? "Active" : "Inactive" },
    { label: "Joined On",  value: (u.createdAt || u.created || "").slice(0, 10) || "—" },
  ];

  return (
    <div className="detail-grid">
      {items.map(({ label, value, cap }) => (
        <div className="detail-item" key={label}>
          <div className="detail-lbl">{label}</div>
          <div className={`detail-val${cap ? " td-cap" : ""}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}