import "../css/BillSummary.css";

export default function BillSummary({ summary, payTotal, onPay, processing, methodLabel }) {
  if (!summary) return <div className="bill-card skeleton">Loading summary...</div>;

  return (
    <div className="bill-card">
      <div className="section-title">Bill Summary</div>

      <div className="bill-row">
        <span className="label">Order Total (MRP)</span>
        <span className="value">₹{summary.totalAmount?.toFixed(2)}</span>
      </div>
      <div className="bill-row">
        <span className="label">Delivery Charge</span>
        <span className="value">₹{summary.deliveryCharge?.toFixed(2)}</span>
      </div>
      <div className="bill-divider" />
      <div className="bill-row total-row">
        <span className="label">Amount to Pay</span>
        <span className="value total-val">₹{summary.finalAmount?.toFixed(2)}</span>
      </div>

      {onPay && (
        <button
          className="btn-pay-summary"
          onClick={onPay}
          disabled={processing}
        >
          {processing
            ? "Processing..."
            : `Pay ₹${summary.finalAmount?.toFixed(2)}${methodLabel ? ` via ${methodLabel}` : ""}`}
        </button>
      )}
    </div>
  );
}