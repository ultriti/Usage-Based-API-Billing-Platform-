const express = require('express');
const router = express.Router();
const { isAunthenticate, isProviderAuthenticate } = require('../middleware/auth.middleware');
const { createApi, requestApiRoute, setApiKey, getProviderStats, apiPartialPayment } = require('../controller/apiProvider.controller');


// provider
router.post("/createApi", isProviderAuthenticate, createApi);
router.post("/getProviderInfo", isProviderAuthenticate, getProviderStats);


// user/consuner
router.post("/getApi", isAunthenticate, createApi);
router.post("/apiRequest/:endpoint", isAunthenticate, requestApiRoute);
router.get("/setApi/:consumerId", isAunthenticate, setApiKey);
router.post("/partialPayApi/:consumerId", isAunthenticate, apiPartialPayment);




module.exports = router;