import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { createRazorpayOrder, verifyRazorpayPayment } from "../slice/paymentSlice";

export function useRazorpay() {
  const dispatch = useDispatch();

  const loadScript = () =>
    new Promise((resolve) => {
      if (document.getElementById("razorpay-sdk")) { resolve(true); return; }
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const openRazorpay = useCallback(
    async ({ orderId, userInfo, onSuccess, onFailure }) => {
      const loaded = await loadScript();
      if (!loaded) { onFailure?.("Failed to load Razorpay SDK"); return; }

      
      const result = await dispatch(createRazorpayOrder({ orderId }));
      if (createRazorpayOrder.rejected.match(result)) {
        onFailure?.(result.payload);
        return;
      }

      const { razorpayOrderId, amount, currency, keyId, appOrderId } = result.payload;

      
      const options = {
        key: keyId,
        amount: amount ,
        currency,
        name: "E-Pharmacy",
        description: `Order #${appOrderId}`,
        order_id: razorpayOrderId,
        prefill: {
          name: userInfo?.name || "",
          email: userInfo?.email || "",
          contact: userInfo?.phone || "",
        },
        theme: { color: "#52a468" },
        handler: async (response) => {
          const verify = await dispatch(
            verifyRazorpayPayment({
              orderId: appOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
          );
          if (verifyRazorpayPayment.fulfilled.match(verify)) {
            onSuccess?.(verify.payload);
          } else {
            onFailure?.(verify.payload);
          }
        },
        modal: {
          ondismiss: () => onFailure?.("Payment cancelled"),
        },
      };

      new window.Razorpay(options).open();
    },
    [dispatch]
  );

  return { openRazorpay };
}