
import "../css/CancelConfirmModel.css";

export default function CancelConfirmModal({ order, onConfirm, onClose, cancelling }) {
  if (!order) return null;

  return (
    <div className="cancel-overlay" onClick={onClose}>
      <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>

      
        <div className="cancel-header">
          <h5 className="cancel-title">Cancel Order</h5>
          <button className="cancel-close" onClick={onClose}>✕</button>
        </div>

        
        <div className="cancel-body">
          <p className="cancel-msg">Are you sure you want to cancel order</p>
          <p className="cancel-order-id">
            #{String(order.orderId).padStart(8, "0")}
          </p>
          <p className="cancel-warning">This action cannot be undone.</p>
        </div>

       
        <div className="cancel-footer">
          <button className="btn-keep" onClick={onClose} disabled={cancelling}>
            Keep Order
          </button>
          <button
            className="btn-confirm-cancel"
            onClick={onConfirm}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}