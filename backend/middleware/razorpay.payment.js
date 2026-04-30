import Razorpay from "razorpay";
import crypto from "crypto";

// ✅ Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create order function
export async function createOrder(amount) {
  const options = {
    amount: amount * 100, // convert to paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };
  return await razorpay.orders.create(options);
}

// ✅ Verify payment signature function
export function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  return generated_signature === razorpay_signature;
}
