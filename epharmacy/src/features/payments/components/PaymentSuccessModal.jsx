import "../css/PaymentSuccessModal.css";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccessModal({ orderId, amount, method, onGoHome }) {
  const navigate = useNavigate();
  return (
    <div className="popup-overlay show">
      <div className="success-popup">
        <div className="success-icon-ring">
          <div className="checkmark-wrapper">
            <svg viewBox="0 0 52 52" className="checkmark-svg">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14 27 l8 8 16-16" />
            </svg>
          </div>
        </div>

        <h4 className="popup-title">Payment Successful!</h4>
        <p className="popup-msg">
          Your order has been placed successfully.<br />
          Thank you for shopping with E-Pharmacy!
        </p>
        <div className="popup-order">
          Order ID: <strong>{orderId}</strong>
        </div>
        <div className="popup-amount">
          Amount Paid:{" "}
          <strong>
            ₹{amount?.toFixed(2)}
            {method === "Cash on Delivery" ? " (COD)" : ""}
          </strong>
        </div>

        <button className="btn-go-home" onClick={()=> navigate("/")}>
          Go to Home
        </button>
      </div>
    </div>
  );
}