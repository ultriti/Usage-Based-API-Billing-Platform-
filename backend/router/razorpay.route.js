const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
} = require("../middleware/razorpay.payment.js");

// Create order route
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await createOrder(amount);

    console.log("-razorpay details", order);


    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

// Verify payment route
router.post("/verify-payment", (req, res) => {
  const success = verifyPayment(req.body);
  res.json({ success });
});

module.exports = router;
