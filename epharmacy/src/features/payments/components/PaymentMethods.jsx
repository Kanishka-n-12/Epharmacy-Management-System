import "../css/PaymentMethods.css";

const RAZORPAY_FEATURES = [
  { icon: "💳", label: "Credit & Debit Cards" },
  { icon: "📱", label: "UPI (GPay, PhonePe, Paytm…)" },
  { icon: "🏦", label: "Net Banking" },
  { icon: "👛", label: "Wallets" },
  { icon: "🔄", label: "EMI Options" },
];

export default function PaymentMethods({ onMethodSelect, selectedMethod }) {
  return (
    <div className="pm-wrapper">
      <p className="pm-section-title">Choose Payment Method</p>

      {/* ── Razorpay card ── */}
      <div
        className={`pm-card ${selectedMethod === "Razorpay" ? "selected" : ""}`}
        onClick={() => onMethodSelect("Razorpay")}
      >
        {/* Selected check */}
        <div className="pm-check">
          <svg viewBox="0 0 16 16"><polyline points="2,8 6,13 14,4" /></svg>
        </div>

        <div className="pm-radio">
          <div className="pm-radio-dot" />
        </div>

        <div className="pm-card-body">
          <div className="pm-card-header-row">
            <div className="pm-card-title-group">
              <span className="pm-card-title">Pay via Razorpay</span>
              <span className="pm-badge secure">🔒 Secure</span>
            </div>
            <img
              className="pm-razorpay-logo"
              src="https://razorpay.com/assets/razorpay-glyph.svg"
              alt="Razorpay"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>

          <p className="pm-card-subtitle">
            Complete your payment through Razorpay's secure checkout
          </p>

          <div className="pm-features-grid">
            {RAZORPAY_FEATURES.map(({ icon, label }) => (
              <div key={label} className="pm-feature-chip">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cash on Delivery card ── */}
      <div
        className={`pm-card ${selectedMethod === "Cash on Delivery" ? "selected" : ""}`}
        onClick={() => onMethodSelect("Cash on Delivery")}
      >
        <div className="pm-check">
          <svg viewBox="0 0 16 16"><polyline points="2,8 6,13 14,4" /></svg>
        </div>

        <div className="pm-radio">
          <div className="pm-radio-dot" />
        </div>

        <div className="pm-card-body">
          <div className="pm-card-header-row">
            <div className="pm-card-title-group">
              <span className="pm-card-title">Cash on Delivery</span>
              <span className="pm-badge cod">📦 COD</span>
            </div>
            <span className="pm-cod-icon">💵</span>
          </div>
          <p className="pm-card-subtitle">
            Pay in cash when your order is delivered to your doorstep
          </p>
        </div>
      </div>
    </div>
  );
}