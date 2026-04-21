import "./css/StatisticsCard.css"

export default function StatisticsCard({ icon, value, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-ico-wrap" style={{ "--ic": color }}>{icon}</div>
      <div className="stat-info">
        <div className="stat-val">{value}</div>
        <div className="stat-lbl">{label}</div>
      </div>
    </div>
  );
}