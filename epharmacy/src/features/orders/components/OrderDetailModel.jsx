
import StatusBadge from "./StatusBadge";
import "../css/OrderDetailModel.css";

const PLACEHOLDER =
  "https://res.cloudinary.com/dorv3lswe/image/upload/v1775886924/account_eavxvn.png";

function isCancellable(status) {
  return  status === "PLACED";
}

export default function OrderDetailModal({ order, onClose, onCancelClick }) {
  if (!order) return null;

  const {
    orderId,
    orderDate,
    orderStatus,
    paymentStatus,
    totalAmount,
    items = [],
  } = order;

 

  const formattedDate = orderDate
    ? new Date(orderDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

 
  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
     

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>

      
        <div className="detail-header">
          <div>
            <h5 className="detail-order-id">
              Order #{String(orderId).padStart(8, "0")}
            </h5>
            <div className="detail-meta">
              <span>Ordered on: {formattedDate}</span>
              <StatusBadge status={orderStatus} />
              {paymentStatus && (
                <span className={`payment-badge pay-${paymentStatus?.toLowerCase()}`}>
                  {paymentStatus}
                </span>
              )}
            </div>
          </div>
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>

      
        <div className="detail-body">

       
          <p className="detail-section-title">Order Items</p>
          {items.map((item, i) => (
            <div className="detail-item-row" key={i}>
              <div className="detail-item-img">
                
                <img
                  src={item.imageUrl}
                  alt={item.medicineName}
                  onError={(e) => { e.target.src = PLACEHOLDER; }}
                />
              </div>
              <div className="detail-item-info">
                <div className="detail-item-name">{item.medicineName}</div>
                <div className="detail-item-qty">Qty: {item.quantity}</div>
              </div>
              <div className="detail-item-price">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <p className="detail-section-title" style={{ marginTop: 18 }}>
            Order Summary
          </p>
          <div className="detail-summary">
            <div className="summary-row">
              <span>Items Total</span>
              <span>₹{itemsTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>Amount Paid</span>
              <span>₹{totalAmount?.toFixed(2) ?? itemsTotal.toFixed(2)}</span>
            </div>
          </div>

          {console.log(orderStatus)};
         
          {isCancellable(orderStatus) && (
            <div className="detail-cancel-wrap">
              <button
                className="btn-cancel-order"
                onClick={() => { onCancelClick(order); onClose(); }}
              >
                Cancel This Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}