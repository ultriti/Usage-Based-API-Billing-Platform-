const express = require('express');
const router = express.Router();
const { userRegister, userLogin, getUserDetail, userLogout, updateUserDetail, promoteUser, codeGen, deleteUser } = require("../controller/user.controller");
const { isAunthenticate } = require('../middleware/auth.middleware');



// user auth routes ------------------------
router.post("/userRegister", userRegister);
router.post("/userLogin", userLogin);
router.get("/userLogout", userLogout);
router.delete("/userDelete",isAunthenticate, deleteUser)



// user route
router.get("/userDetail", isAunthenticate, getUserDetail);
router.put("/userUpdate", isAunthenticate, updateUserDetail);
router.get("/promoteUser/:userId", isAunthenticate, promoteUser); // promote existing user
// router.get("/codegen",isAunthenticate, codeGen)
router.get("/codegen",isAunthenticate, codeGen);


module.exports = router;    