// controllers/transactionController.js
const Transaction = require("../model/transaction.model");

module.exports.createTransaction = async (req, res) => {
  try {
    const { providerId, apiId, amount, consumerId } = req.body;

    const txn = new Transaction({
      providerId,
      apiId,
      amount,
      consumerDetail: {
        customerId: consumerId,
        ammountPaid: 0,
        status: "pending",
      },
    });

    await txn.save();

    return res.status(201).json({
      message: "Transaction created",
      success: true,
      transaction: txn,
    });
  } catch (err) {
    console.error("Transaction error:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err.message,
    });
  }
};

module.exports.updateTransactionStatus = async (req, res) => {
    console.log("---------------->update transacition ",req.body.txnId)
  try {
    const { txnId, status, transactionRef } = req.body;

    const txn = await Transaction.findById(txnId);
    if (!txn) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    txn.status = status;
    if (status === "paid") {
      txn.consumerDetail.ammountPaid = txn.amount;
      txn.consumerDetail.status = "paid";
      txn.consumerDetail.paidAt = new Date();
      txn.settledAt = new Date();
    }
    txn.transactionRef = transactionRef;

    await txn.save();

    return res.status(200).json({
      message: "Transaction updated",
      success: true,
      transaction: txn,
    });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err.message,
    });
  }
};


// Get all transactions (with optional limit/pagination)
module.exports.getAllTransactions = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query; // optional pagination
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .populate("providerId", "username email")
      .populate("apiId", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Transactions fetched successfully",
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err.message,
    });
  }
};

// Get transactions for a particular provider
module.exports.getProviderTransactions = async (req, res) => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      return res.status(400).json({
        message: "Provider ID is required",
        success: false,
      });
    }

    const transactions = await Transaction.find({ providerId })
      .populate("providerId", "username email")
      .populate("apiId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Provider transactions fetched successfully",
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error("Error fetching provider transactions:", err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err.message,
    });
  }
};
