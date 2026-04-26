import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordRazorpayFailure,
} from "../slice/paymentThunks";

export function useRazorpay() {
  const dispatch = useDispatch();

  const loadScript = () =>
    new Promise((resolve) => {
      if (document.getElementById("razorpay-sdk")) { resolve(true); return; }
      const script    = document.createElement("script");
      script.id       = "razorpay-sdk";
      script.src      = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload   = () => resolve(true);
      script.onerror  = () => resolve(false);
      document.body.appendChild(script);
    });

  const openRazorpay = useCallback(
    async ({ orderId, userInfo, onSuccess, onFailure }) => {
      console.log("=== useRazorpay openRazorpay called, orderId:", orderId);

      const loaded = await loadScript();
      console.log("=== Script loaded:", loaded);
      if (!loaded) { onFailure?.("Failed to load Razorpay SDK"); return; }

      const result = await dispatch(createRazorpayOrder({ orderId }));
      console.log("=== createRazorpayOrder result:", result);
      console.log("=== result payload:", result.payload);

      if (createRazorpayOrder.rejected.match(result)) {
        console.log("=== createRazorpayOrder REJECTED:", result.payload);
        onFailure?.(result.payload);
        return;
      }

      const { razorpayOrderId, amount, currency, keyId, appOrderId } = result.payload;
      console.log("=== Razorpay details:", { razorpayOrderId, amount, currency, keyId, appOrderId });

      const options = {
        key:         keyId,
        amount,
        currency,
        name:        "E-Pharmacy",
        description: `Order #${appOrderId}`,
        order_id:    razorpayOrderId,
        prefill: {
          contact: userInfo?.phone || "",
        },
        theme: { color: "#52a468" },
        handler: async (response) => {
          console.log("=== Razorpay handler fired:", response);
          const verify = await dispatch(
            verifyRazorpayPayment({
              orderId:           appOrderId,
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
          );
          console.log("=== verifyRazorpayPayment result:", verify);
          if (verifyRazorpayPayment.fulfilled.match(verify)) {
            console.log("=== Payment verified successfully");
            onSuccess?.(verify.payload);
          } else {
            console.log("=== Payment verification failed");
            await dispatch(recordRazorpayFailure({
              orderId:          appOrderId,
              razorpayOrderId,
              errorCode:        "VERIFICATION_FAILED",
              errorDescription: verify.payload || "Signature verification failed",
            }));
            onFailure?.(verify.payload);
          }
        },
        modal: {
          escape:     false,
          ondismiss:  async () => {
            console.log("=== Modal dismissed, appOrderId:", appOrderId);
            try {
              await dispatch(recordRazorpayFailure({
                orderId:          appOrderId,
                razorpayOrderId,
                errorCode:        "PAYMENT_CANCELLED",
                errorDescription: "User closed the payment window",
              }));
              console.log("=== Cancelled payment recorded");
            } catch (err) {
              console.log("=== Failure record error:", err);
            }
            onFailure?.("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async (response) => {
        console.log("=== payment.failed event:", response.error);
        try {
          await dispatch(recordRazorpayFailure({
            orderId:          appOrderId,
            razorpayOrderId,
            errorCode:        response.error?.code        || "PAYMENT_FAILED",
            errorDescription: response.error?.description || "Payment failed",
          }));
          console.log("=== Failed payment recorded");
        } catch (err) {
          console.log("=== Failure record error:", err);
        }
        onFailure?.(response.error?.description || "Payment failed");
      });

      rzp.open();
    },
    [dispatch]
  );

  return { openRazorpay };
}