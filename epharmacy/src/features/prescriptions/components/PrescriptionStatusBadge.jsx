// features/prescriptions/components/PrescriptionStatusBadge.jsx

const CONFIG = {
  approved: { label: "Approved", cls: "rx-badge-approved" },
  pending:  { label: "Pending",  cls: "rx-badge-pending"  },
  rejected: { label: "Rejected", cls: "rx-badge-rejected" },
};

export default function PrescriptionStatusBadge({ status }) {
  const key = status?.toLowerCase();
  const { label, cls } = CONFIG[key] || { label: status || "—", cls: "rx-badge-pending" };

  return <span className={`rx-status-badge ${cls}`}>{label}</span>;
}