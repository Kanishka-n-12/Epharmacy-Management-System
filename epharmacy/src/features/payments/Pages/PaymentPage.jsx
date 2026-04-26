import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchBillSummary,
  makeCodOrUpiPayment,
} from "../slice/paymentThunks";
import { clearPaymentMessages, resetPayment, setSelectedMethod } from "../slice/paymentSlice";
import { setPendingOrderId } from "../../cart/slice/cartSlice";
import { clearCartOnServer } from "../../cart/slice/cartThunks";
import { useRazorpay } from "../hooks/useRazorpay";

import ProgressSteps from "../../deliveries/components/ProgressSteps";
import BillSummary from "../components/BillSummary";
import PaymentMethods from "../components/PaymentMethods";
import PaymentSuccessModal from "../components/PaymentSuccessModal";

import "../css/PaymentPage.css";

export default function PaymentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { billSummary, paymentResult, processing, error, successMessage } =
    useSelector((s) => s.payment);

  const orderId = useSelector((s) => s.cart?.pendingOrderId);
  const phone   = useSelector((s) => s.auth?.phone);

  const { openRazorpay } = useRazorpay();

  const [chosenMethod, setChosenMethod] = useState(null);
  const [methodError,  setMethodError]  = useState(null);
  const [showSuccess,  setShowSuccess]  = useState(false);

  const cartCleared = useRef(false); // guard against double clear

  useEffect(() => {
    if (orderId) dispatch(fetchBillSummary(orderId));
  }, [orderId, dispatch]);

  // Safe clear — only runs once no matter how many times called
  const safeClearCart = () => {
    if (cartCleared.current) return;
    cartCleared.current = true;
    dispatch(clearCartOnServer());
  };

  useEffect(() => {
    if (successMessage) {
      safeClearCart();
      setShowSuccess(true);
      dispatch(clearPaymentMessages());
    }
    if (error) {
      setMethodError(error);
      dispatch(clearPaymentMessages());
    }
  }, [successMessage, error, dispatch]);

  const handleMethodSelect = (method) => {
    setChosenMethod(method);
    setMethodError(null);
    dispatch(setSelectedMethod(method));
  };

  const handlePay = async () => {
    if (!chosenMethod) {
      setMethodError("Please select a payment method to continue.");
      return;
    }

    if (chosenMethod === "Razorpay") {
      openRazorpay({
        orderId,
        userInfo: { phone },
        onSuccess: () => {
          safeClearCart(); // guarded — won't double-fire
          setShowSuccess(true);
        },
        onFailure: (msg) => {
          setMethodError(msg || "Payment failed. Please try again.");
        },
      });
      return;
    }

    dispatch(
      makeCodOrUpiPayment({
        orderId,
        paymentMethod: chosenMethod === "Cash on Delivery" ? "cod" : "upi",
        transactionId: null,
      })
    );
  };

  if (!orderId) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">No pending order found.</p>
        <button className="btn-back-link" onClick={() => navigate("/cart")}>
          ← Go to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">

        <ProgressSteps current={2} />

        <button className="btn-back-link" onClick={() => navigate("/delivery")}>
          ← Back to Delivery
        </button>

        {methodError && (
          <div className="method-error-bar">⚠️ {methodError}</div>
        )}

        <div className="payment-grid">
          <div>
            <div className="dp-card">
              <PaymentMethods
                selectedMethod={chosenMethod}
                onMethodSelect={handleMethodSelect}
                orderTotal={billSummary?.finalAmount || 0}
              />
              <div className="btn-row">
                <button
                  className="btn-back-styled"
                  onClick={() => navigate("/delivery")}
                >
                  Back
                </button>
                <button
                  className="btn-pay-styled"
                  onClick={handlePay}
                  disabled={processing || !chosenMethod}
                >
                  {processing
                    ? "Processing…"
                    : chosenMethod === "Cash on Delivery"
                    ? "Place Order (COD)"
                    : billSummary
                    ? `Pay ₹${billSummary.finalAmount?.toFixed(2)}`
                    : "Pay Now"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <BillSummary summary={billSummary} methodLabel={chosenMethod} />
          </div>
        </div>
      </div>

      {showSuccess && (
        <PaymentSuccessModal
          orderId={paymentResult?.orderId || orderId}
          amount={billSummary?.finalAmount}
          method={chosenMethod}
          onGoHome={() => {
            setShowSuccess(false);
            dispatch(resetPayment());
            dispatch(setPendingOrderId(null));
            cartCleared.current = false; // reset for next order session
            navigate("/");
          }}
        />
      )}
    </div>
  );
}