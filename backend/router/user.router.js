const express = require('express');
const router = express.Router();
const { userRegister, userLogin, getUserDetail, userLogout } = require("../controller/user.controller");
const { isAunthenticate } = require('../middleware/auth.middleware');



// user auth routes ------------------------
router.post("/userRegister", userRegister);
router.post("/userLogin", userLogin);
router.get("/userLogout", userLogout);


// user route
router.get("/userDetail", isAunthenticate, getUserDetail);





module.exports = router;    