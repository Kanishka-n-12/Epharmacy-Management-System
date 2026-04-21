import "../css/OrderSummary.css";

export default function OrderSummary({ summary, selectedAddr, submitting, onProceed }) {
  return (
    <div className="dp-card">
      <p className="dp-section-title">Order Summary</p>

      <div className="summary-row">
        <span>No. of Items</span>
        <span style={{ fontWeight: 600 }}>{summary?.numberOfItems ?? 0}</span>
      </div>
      <div className="summary-row">
        <span>MRP Total</span>
        <span style={{ fontWeight: 600 }}>
          ₹{summary?.mrpTotal?.toFixed(2) ?? "0.00"}
        </span>
      </div>

      <hr className="summary-divider" />    

      <div className="summary-row total">
        <span>Cart Total</span>
        <span>₹{summary?.cartTotal?.toFixed(2) ?? "0.00"}</span>
      </div>

      {selectedAddr && (
        <div className="delivering-to">
          <p className="dp-section-title" style={{ marginBottom: 8 }}>
            Delivering To
          </p>
          <div className="delivering-to-details">
            <strong>{selectedAddr.name}</strong>
            <br />
            {selectedAddr.line}, {selectedAddr.city}
            <br />
            {selectedAddr.state} –{" "}
            <span style={{ fontFamily: "var(--font-mono)" }}>
              {selectedAddr.pincode}
            </span>
            <br />
            📞 {selectedAddr.phone}
          </div>
        </div>
      )}

      <hr className="summary-divider" />

      <button
        className="btn-proceed"
        disabled={!selectedAddr || submitting}
        onClick={onProceed}
      >
        PROCEED TO PAYMENT
      </button>
    </div>
  );
}