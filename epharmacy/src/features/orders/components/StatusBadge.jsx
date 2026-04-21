
import "../css/StatusBadge.css";

const STATUS_MAP = {
  delivered:  { label: "Delivered",  cls: "status-delivered" },
  processing: { label: "Processing", cls: "status-processing" },
  placed:     { label: "Placed",     cls: "status-placed" },
  cancelled:  { label: "Cancelled",  cls: "status-cancelled" },
};

export default function StatusBadge({ status }) {
  const s = status?.toLowerCase() ?? "";
  const { label, cls } = STATUS_MAP[s] ?? {
    label: status ?? "Unknown",
    cls: "status-default",
  };

  return <span className={`status-badge ${cls}`}>{label}</span>;
}