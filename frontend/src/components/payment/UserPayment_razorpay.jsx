import React from "react";
import axios from "axios";

const UserPayment_razorpay = ({ amount }) => {
  const razorpayKey =
    import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SjYP78XCXQDWg2";
  const apiBase = import.meta.env.VITE_BACKEND_URL || "";

  const handlePayment = async () => {


    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }

    try {
      // ✅ Step 1: Ask backend to create order
      const { data: order } = await axios.post(
        `${apiBase}/api/ultriti/payment/create-order`,
        { amount },
        { withCredentials: true },
      );

      // ✅ Step 2: Configure Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "API Billing App",
        description: `Payment of ₹${amount}`,
        order_id: order.id,
        handler: async function (response) {
          // ✅ Step 3: Verify payment with backend
          const verifyRes = await axios.post(
            `${apiBase}/api/ultriti/payment/verify-payment`,
            response,
            { withCredentials: true },
          );
          if (verifyRes.data.success) {
            alert("Payment successful!");
          } else {
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        className="w-full py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
      >
        subscribe ₹{amount}
      </button>
    </div>
  );
};

export default UserPayment_razorpay;
