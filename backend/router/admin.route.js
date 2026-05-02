const express = require("express");
const router = express.Router();
const {
  adminRegister,
  adminLogin,
  getAllProvider,
  deleteProvider,
} = require("../controller/admin.controller");
const { isAdminAuthenticate } = require("../middleware/auth.middleware");

// admin auth
router.post("/createAdmin", adminRegister);
router.post("/loginAdmin", adminLogin);
router.delete("/provider/delete", isAdminAuthenticate, deleteProvider);


router.get("/getAllProviders", isAdminAuthenticate, getAllProvider);
router.get("/getAllApis", isAdminAuthenticate, getAllProvider);

module.exports = router;
