
import "../css/EmptyOrders.css";

export default function EmptyOrders({ filtered = false }) {
  return (
    <div className="empty-orders">
      <span className="empty-icon">📦</span>
      <p>
        {filtered
          ? "No orders found for the selected filters."
          : "You haven't placed any orders yet."}
      </p>
    </div>
  );
}