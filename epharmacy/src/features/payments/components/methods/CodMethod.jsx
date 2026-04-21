import { useState } from "react";
import "./MethodShared.css";
import "./CodMethod.css";

const COD_LIMIT = 5000;

export default function CodMethod({ orderTotal, onSelect }) {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);
  const overLimit = orderTotal > COD_LIMIT;

  const handleSelect = () => {
    if (overLimit) { setError(`COD not available above ₹${COD_LIMIT}`); return; }
    if (!agreed) { setError("Please accept the COD terms to continue"); return; }
    setError(null);
    onSelect();
  };

  return (
    <div className="cod-wrap">
      <div className="cod-info-box">
        <span className="cod-icon">📦</span>
        <p><strong>Pay when your order arrives.</strong> Keep exact change ready.</p>
        <p>⚠️ COD available for orders up to <strong>₹{COD_LIMIT}</strong>.</p>
        <p>🚚 Estimated delivery: <strong>3–5 business days</strong>.</p>
      </div>

      {overLimit ? (
        <p className="cod-overlimit">❌ Your order total exceeds the COD limit of ₹{COD_LIMIT}. Please choose another method.</p>
      ) : (
        <div className="cod-check-row">
          <input
            type="checkbox"
            id="codAgree"
            checked={agreed}
            onChange={(e) => { setAgreed(e.target.checked); setError(null); }}
          />
          <label htmlFor="codAgree">
            I agree to keep the exact amount ready at delivery and understand COD orders cannot be cancelled after dispatch.
          </label>
        </div>
      )}

      {error && <span className="field-err">{error}</span>}

      {!overLimit && (
        <div className="method-item" onClick={handleSelect} style={{ marginTop: 10 }}>
          <span className="method-name">Confirm Cash on Delivery</span>
          <span className="method-radio">○</span>
        </div>
      )}
    </div>
  );
}