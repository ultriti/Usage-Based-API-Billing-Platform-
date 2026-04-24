const express = require('express');
const router = express.Router();
const { isAunthenticate, isProviderAuthenticate } = require('../middleware/auth.middleware');
const { createApi, requestApiRoute, setApiKey, getProviderStats, apiPartialPayment, toggleStatus } = require('../controller/apiProvider.controller');


// provider
router.post("/createApi", isProviderAuthenticate, createApi);
router.post("/getProviderInfo", isProviderAuthenticate, getProviderStats);
router.put("/updateApiStatus/:apiId", isProviderAuthenticate, toggleStatus);
router.delete("/deleteApi/:apiId", isProviderAuthenticate, toggleStatus);



// user/consumer
router.post("/getApi", isAunthenticate, createApi);
router.post("/apiRequest", isAunthenticate, requestApiRoute);
router.get("/setApi/:consumerId", isAunthenticate, setApiKey);
router.post("/partialPayApi/:consumerId", isAunthenticate, apiPartialPayment);




module.exports = router;