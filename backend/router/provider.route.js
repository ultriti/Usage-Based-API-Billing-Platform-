const express = require('express');
const router = express.Router();
const { providerRegister, providerLogin, getProviderDetail, providerLogout, updateProviderDetail, codeGen, deleteProvider } = require("../controller/provider.controller");
const { isAunthenticate, isProviderAuthenticate } = require('../middleware/auth.middleware');



// user auth routes ------------------------
router.post("/providerRegister", providerRegister);
router.post("/providerLogin", providerLogin);
router.get("/providerLogout", providerLogout);

router.delete("/providerDelete",isProviderAuthenticate, deleteProvider);



// provider route
router.get("/providerDetail", isProviderAuthenticate, getProviderDetail);
router.put("/providerUpdate", isProviderAuthenticate, updateProviderDetail);
router.get("/providerCodegen",isProviderAuthenticate, codeGen);


module.exports = router;    