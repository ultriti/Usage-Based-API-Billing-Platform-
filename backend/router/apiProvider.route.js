const express = require('express');
const router = express.Router();
const { isAunthenticate, isProviderAuthenticate } = require('../middleware/auth.middleware');
const { createApi, requestApiRoute, setApiKey } = require('../controller/apiProvider.controller');


router.post("/createApi", isProviderAuthenticate, createApi);
router.post("/getApi", isAunthenticate, createApi);


router.post("/apiRequest/:endpoint", isAunthenticate, requestApiRoute);
router.get("/setApi/:consumerId", isAunthenticate, setApiKey);

module.exports = router;