import "./MethodShared.css";

export default function RazorpayMethod({ onSelect }) {
  return (
    <div>
      <div className="razorpay-info">
        <p>🔒 Pay securely via Razorpay — supports UPI, Cards, Net Banking & Wallets.</p>
      </div>
      <div className="method-item selected" onClick={onSelect}>
        <span className="method-name">Pay via Razorpay</span>
        <span className="method-radio checked">●</span>
      </div>
    </div>
  );
}