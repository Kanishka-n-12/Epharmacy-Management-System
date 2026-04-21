export default function CartSummary({ summary, disabled, onProceed }) {
  return (
    <div className="card p-3 shadow-sm" style={{ position: "sticky", top: 80 }}>
      <h6 className="fw-bold mb-3">Cart Summary</h6>

      <div className="d-flex justify-content-between">
        <span>No. of Items</span>
        <span>{summary?.numberOfItems ?? 0}</span>
      </div>

      <div className="d-flex justify-content-between">
        <span>MRP Total</span>
        <span>₹{summary?.mrpTotal?.toFixed(2) ?? "0.00"}</span>
      </div>

      <hr />

      <div className="d-flex justify-content-between fw-bold">
        <span>Cart Total</span>
        <span>₹{summary?.cartTotal?.toFixed(2) ?? "0.00"}</span>
      </div>

      <button
        className="btn btn-success w-100 mt-3"
        disabled={disabled}
        onClick={onProceed}
      >
        PROCEED
      </button>
    </div>
  );
}