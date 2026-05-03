// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllTransactions,
  getProviderTransactions,
  createTransaction,
  updateTransactionStatus,
} = require("../controller/transaction.controller");
const {
  isAdminAuthenticate,
  isProviderAuthenticate,
} = require("../middleware/auth.middleware");

router.post("/creatTansaction", createTransaction);
router.post("/updateTansaction", updateTransactionStatus);

router.get("/transactions", isAdminAuthenticate, getAllTransactions);

router.get(
  "/transactions/provider/:providerId",
  isProviderAuthenticate,
  getProviderTransactions,
);

module.exports = router;
