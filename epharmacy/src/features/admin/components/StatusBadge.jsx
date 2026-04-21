

const MAPS = {
  user: {
    active:   { bg: "#e8f5e9", color: "#2e7d32" },
    inactive: { bg: "#fce4e4", color: "#c62828" },
  },
  availability: {
    available:     { bg: "#e8f5e9", color: "#2e7d32" },
    not_available: { bg: "#fce4e4", color: "#c62828" },
    unavailable:   { bg: "#fce4e4", color: "#c62828" },
  },
  order: {
    placed:    { bg: "#e3f2fd", color: "#1565c0" },
    shipped:   { bg: "#f3e5f5", color: "#6a1b9a" },
    delivered: { bg: "#e8f5e9", color: "#2e7d32" },
    cancelled: { bg: "#fce4e4", color: "#c62828" },
  },
  payment: {
    success: { bg: "#e8f5e9", color: "#2e7d32" },
    pending: { bg: "#fff8e1", color: "#f57f17" },
    failed:  { bg: "#fce4e4", color: "#c62828" },
  },
  prescription: {
    pending:  { bg: "#fff8e1", color: "#f57f17" },
    approved: { bg: "#e8f5e9", color: "#2e7d32" },
    rejected: { bg: "#fce4e4", color: "#c62828" },
  },
  delivery: {
    placed:    { bg: "#e3f2fd", color: "#1565c0" },
    shipped:   { bg: "#f3e5f5", color: "#6a1b9a" },
    delivered: { bg: "#e8f5e9", color: "#2e7d32" },
    cancelled: { bg: "#fce4e4", color: "#c62828" },
  },
};

function cap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "—";
}

export default function StatusBadge({
  status,
  preset = "user",
  bg: bgOverride,
  color: colorOverride,
  style = {},
}) {
  const key    = (status || "").toLowerCase();
  const map    = MAPS[preset] ?? MAPS.user;
  const colors = map[key] ?? { bg: "#f5f5f5", color: "#555" };

  const bg    = bgOverride    ?? colors.bg;
  const color = colorOverride ?? colors.color;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 11px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: bg,
        color,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {cap(status)}
    </span>
  );
}