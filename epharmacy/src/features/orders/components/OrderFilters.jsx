
import "../css/OrderFilters.css";

export default function OrderFilters({ statusFilter, dateFilter, onChange }) {
  return (
    <div className="orders-filters">
      <select
        className="filter-select"
        value={statusFilter}
        onChange={(e) => onChange("status", e.target.value)}
      >
        <option value="ALL">ALL ORDERS</option>
        <option value="placed">PLACED</option>
        <option value="processing">SHIPPED</option>
        <option value="delivered">DELIVERED</option>
        <option value="cancelled">CANCELLED</option>
      </select>

      <input
        type="date"
        className="filter-date"
        value={dateFilter}
        onChange={(e) => onChange("date", e.target.value)}
      />
    </div>
  );
}