const express = require('express');
const router = express.Router();
const { isAunthenticate, isProviderAuthenticate } = require('../middleware/auth.middleware');
const { createApi, requestApiRoute, setApiKey, getProviderStats, apiPartialPayment, toggleStatus, deleteApi, getAllApis, getApi } = require('../controller/apiProvider.controller');


// provider
router.post("/createApi", isProviderAuthenticate, createApi);
router.post("/getProviderInfo", isProviderAuthenticate, getProviderStats);
router.put("/updateApiStatus/:apiId", isProviderAuthenticate, toggleStatus);
router.delete("/deleteApi/:apiId", isProviderAuthenticate, deleteApi);



// user/consumer
router.get("/getAllApi", isAunthenticate, getAllApis);
router.get("/getApi/:apiId", isAunthenticate, getApi);
router.get("/apiRequest", isAunthenticate, requestApiRoute);
router.post("/setApi/:consumerId", isAunthenticate, setApiKey);
router.post("/partialPayApi/:consumerId", isAunthenticate, apiPartialPayment);




module.exports = router;