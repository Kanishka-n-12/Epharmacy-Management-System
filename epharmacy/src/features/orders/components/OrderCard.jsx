
import StatusBadge from "./StatusBadge";
import "../css/OrderCard.css";

const PLACEHOLDER =
  "https://res.cloudinary.com/dorv3lswe/image/upload/v1775886924/account_eavxvn.png";

function isCancellable(status) {
  return status === "processing" || status === "placed";
}

export default function OrderCard({ order, onViewDetails, onCancelClick, index }) {
  const { orderId, orderDate, orderStatus, totalAmount, paymentStatus, items = [] } = order;

  const previewItems = items.slice(0, 2);
  const extraCount = items.length - previewItems.length;

  return (
    <div
      className="order-card"
      style={{ animationDelay: `${index * 70}ms` }}
    >
     
      <div className="order-top">
        <div>
          <div className="order-id">#{String(orderId).padStart(8, "0")}</div>
          <div className="order-date">
            📅 {orderDate ? new Date(orderDate).toLocaleDateString("en-IN") : "—"}
          </div>
        </div>
        <div className="order-badges">
          <StatusBadge status={orderStatus} />
          {paymentStatus && (
            <span className={`payment-badge pay-${paymentStatus?.toLowerCase()}`}>
              {paymentStatus}
            </span>
          )}
        </div>
      </div>

      
      {previewItems.map((item, i) => (
        <div className="item-row" key={i}>
          <div className="item-img">
            <img
              src={item.imageUrl}
              alt={item.medicineName}
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
          </div>
          <div>
            <div className="item-name">{item.medicineName}</div>
            <div className="item-qty">Qty: {item.quantity}</div>
          </div>
          <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
        </div>
      ))}

      {extraCount > 0 && (
        <p className="extra-items">+{extraCount} more item{extraCount > 1 ? "s" : ""}…</p>
      )}

    
      <div className="order-bottom">
        <div className="order-total">
          Total: <span>₹{totalAmount?.toFixed(2) ?? "—"}</span>
        </div>
        <div className="order-actions">
          {isCancellable(orderStatus) && (
            <button
              className="btn-cancel-order"
              onClick={(e) => { e.stopPropagation(); onCancelClick(order); }}
            >
              Cancel Order
            </button>
          )}
          <button
            className="btn-view-details"
            onClick={() => onViewDetails(order)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}