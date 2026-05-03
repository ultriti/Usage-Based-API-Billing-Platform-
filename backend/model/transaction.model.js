// models/transactionModel.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    apiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "API",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "settling", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "paypal", "manual"],
      default: "razorpay",
    },
    transactionRef: {
      type: String, // e.g. Razorpay payment_id
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    settledAt: {
      type: Date,
    },
    consumerDetail: {
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      ammountPaid: { type: Number, default: 0 },
      paidAt: { type: Date },
      status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
