const exporess = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const bcrypt = require("bcryptjs");

const userModel = require("../model/user.model");
const providerModel = require("../model/provider.model");
const apiProviderModel = require("../model/api.model");
const apiModel = require("../model/api.model");
const { CLIENT_RENEG_WINDOW } = require("tls");

const ms = require("ms");

const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const { verifyPayment } = require("../middleware/razorpay.payment");

// const url = process.env.INFLUXDB_URL;
// const token = process.env.INFLUXDB_TOKEN;
// const org = process.env.INFLUXDB_ORG;
// const bucket = process.env.INFLUXDB_BUCKET;

// console.log("----------?\n\n\n\n", url)

// const client = new InfluxDB({ url, token });
// const writeClient = client.getWriteApi(org, bucket, 'ns');

// code generation
function generateSecureCode(length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!#$%^&*<>";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    code += charset[randomIndex];
  }

  return code;
}

// create api
module.exports.createApi = async (req, res) => {
  const provId = req.id;

  const { baseUrl, name, categories, description, subscriptionPlan, custom  } = req.body;

  console.log("baseUrl, name, categories, description, subscriptionPlan, custom:\n",baseUrl,"\n", name, "\n",categories,"\n", description,"\n", subscriptionPlan,"\n", custom)

  if (!baseUrl || !name) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  try {
    const providerDetail = await providerModel.findById(provId);
    const apiDetail = await apiModel.findOne({ baseUrl: baseUrl });

    if (apiDetail) {
      return res.status(400).json({
        message: "api areldy exists with provide api",
        success: false,
      });
    }

    if (!providerDetail) {
      return res
        .status(400)
        .json({ message: "provider already exists", success: false });
    }

    const platformUrl = `${process.env.BACKEND_URI}`;

    const createdApi = await apiModel.create({
      providerId: provId,
      name,
      baseUrl,
      description,
      categories,
      apiKeys: [],
      platformUrl: platformUrl + `?apiName=${name}`,
    });

    // Decide plan type

    if (subscriptionPlan === "basic") {
      createdApi.subscriptionPlan = {
        subscriptionType: "basic",
        // billingModel: "request_based",
        // platformCut: PLATFORM_CUT,
        // providerCut: PROVIDER_CUT,
        price: {
          partialpayment: {
            amount: 20,
            requestLimit: 800,
            timeLimit: Date.now(),
          },
          monthlypayment: {
            amount: 99,
            requestLimit: 2500,
            timeLimit: Date.now(),
          },
          annualpayment: {
            amount: 999,
            requestLimit: 40000,
            timeLimit: Date.now(),
          },
        },
      };
    }

    if (subscriptionPlan === "pro") {
      createdApi.subscriptionPlan = {
        subscriptionType: "pro",
        price: {
          partialpayment: {
            amount: 49,
            requestLimit: 800,
            timeLimit: Date.now(),
          },
          monthlypayment: {
            amount: 499,
            requestLimit: 12000,
            timeLimit: Date.now(),
          },
          annualpayment: {
            amount: 4999,
            requestLimit: 150000,
            timeLimit: Date.now(),
          },
        },
      };
    }

    if (subscriptionPlan === "Model") {
      createdApi.subscriptionPlan = {
        subscriptionType: "Model",
        // billingModel: "request_based",
        // usageNote: "Strict token cap required",
        // platformCut: PLATFORM_CUT,
        // providerCut: PROVIDER_CUT,
        // maxTokensPerRequest: 2000,
        price: {
          partialpayment: {
            amount: 199,
            requestLimit: 1500,
            timeLimit: Date.now(),
          },
          monthlypayment: {
            amount: 1999,
            requestLimit: 15000,
            timeLimit: Date.now(),
          },
          annualpayment: {
            amount: 19999,
            requestLimit: 180000,
            timeLimit: Date.now(),
          },
        },
      };
    }

    if (subscriptionPlan === "Heavy Model") {
      createdApi.subscriptionPlan = {
        subscriptionType: "Heavy Model",
        price: {
          partialpayment: {
            amount: 499,
            requestLimit: 250,
            timeLimit: Date.now(),
          },
          monthlypayment: {
            amount: 4999,
            requestLimit: 4000,
            timeLimit: Date.now(),
          },
          annualpayment: {
            amount: 49999,
            requestLimit: 60000,
            timeLimit: Date.now(),
          },
        },
      };
    }

    if (subscriptionPlan === "Ultra Heavy") {
      createdApi.subscriptionPlan = {
        subscriptionType: "Ultra Heavy",
        price: {
          partialpayment: {
            amount: 999,
            requestLimit: 15,
            timeLimit: Date.now(),
          },
          monthlypayment: {
            amount: 9999,
            requestLimit: 400,
            timeLimit: Date.now(),
          },
          annualpayment: {
            amount: 99999,
            requestLimit: 6000,
            timeLimit: Date.now(),
          },
        },
      };
    }

    if (subscriptionPlan === "custom") {
      createdApi.subscriptionPlan = {
        subscriptionType: "custom",
        price: {
          partialpayment: {
            amount: Math.max(
              custom.partialpayment?.amount ||
                defaultPrice.partialpayment.amount,
              50,
            ), // enforce minimum
            requestLimit:
              custom.partialpayment?.requestLimit ||
              defaultPrice.partialpayment.requestLimit,
            timeLimit: Date.now(),
          },
          monthlypayment: {
            amount: Math.max(
              custom.monthlypayment?.amount ||
                defaultPrice.monthlypayment.amount,
              99,
            ),
            requestLimit:
              custom.monthlypayment?.requestLimit ||
              defaultPrice.monthlypayment.requestLimit,
            timeLimit: Date.now(),
          },
          annualpayment: {
            amount: Math.max(
              custom.annualpayment?.amount || defaultPrice.annualpayment.amount,
              999,
            ),
            requestLimit:
              custom.annualpayment?.requestLimit ||
              defaultPrice.annualpayment.requestLimit,
            timeLimit: Date.now(),
          },
        },
      };
    }

    console.log("subscriptionPlan:\n,subscriptionPlan")
    await createdApi.save();

    // Generate codes
    const apiKeyCode = generateSecureCode(25);
    const apiPasswordCode = generateSecureCode(12);

    createdApi.apiKeys.push({
      consumerId: provId,
      key: apiKeyCode,
      // apiPassword: apiPasswordCode,
      status: "active",
    });

    await createdApi.save();

    providerDetail.apiCreated.push({
      apiId: createdApi._id,
      purchased: true,
    });

    await providerDetail.save();

    return res.status(201).json({
      message: "api created successfullly",
      success: true,
      createdApi,
    });
  } catch (error) {
    console.log("error :", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

module.exports.setApiKey = async (req, res) => {
  const consumerId = req.id; // from auth middleware

  try {
    // console.log("body:", req.body);

    const { providerApiId } = req.body;

    const userDetail = await userModel.findById(consumerId);
    const api = await apiModel.findById(providerApiId);

    if (!api) {
      return res
        .status(400)
        .json({ message: "API not found!", success: false });
    }

    // Generate codes
    const apiKeyCode = generateSecureCode(25);
    const apiPasswordCode = generateSecureCode(12);

    const hashedApiPasswordCode =
      await apiModel.prototype.hashKeys(apiPasswordCode);

    // Assume providerApiId is the ObjectId or string you want to check
    let existingApi = false;

    if (userDetail?.api && Array.isArray(userDetail.api)) {
      existingApi = userDetail.api.some(
        (item) => String(item.apiId) === String(providerApiId),
      );
    }

    if (existingApi) {
      return res
        .status(400)
        .json({ message: "API already purchased!", success: false });
    }

    api.apiKeys.push({
      consumerId: consumerId,
      key: apiKeyCode,
      // apiPassword: hashedApiPasswordCode,
      status: "active",
    });

    if (!userDetail) {
      return res
        .status(400)
        .json({ message: "User not found!", success: false });
    }

    // const apiKeyEntry = userDetail.apiKeys.find(item => item.apiId.equals(api._id));

    userDetail.api.push({
      apiId: api._id,
      url: api.baseUrl,
      purchased: false,
      keyCode: apiKeyCode,
      keyPassword: apiPasswordCode,
    });
    const credentailKey = {
      key: apiKeyCode,
      keyPassword: apiPasswordCode,
    };

    await api.save();
    await userDetail.save();

    return res.status(201).json({
      message: "API purchased successfully",
      success: true,
      apiKey: apiKeyCode,
      apiPassword: apiPasswordCode,
      credentailKey: credentailKey,
    });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};

// buy / get api
// module.exports.setApiKey = async (req, res) => {

//     const consumerId = req.id;

//     try {

//         console.log("bosy:", req.body)

//         const { providerApiId } = req.body;

//         const api = await apiModel.findById(providerApiId);

//         if (!api) {
//             return res.stuas(400).json({ message: "api not found !", sucess: false })
//         }

//         const apiKeyCode = generateCode(16);
//         const apiPasswordCode = generateCode(12);

//         const hashedApiKeyCode = apiModel.prototype.hashKeys(apiKeyCode);
//         const hashedApiPasswordCode = apiModel.prototype.hashKeys(apiPasswordCode);

//         api.apiKeys.push({
//             consumerId: consumerId,
//             key: hashedApiKeyCode,
//             apiPassword: hashedApiPasswordCode,
//             status: 'active'
//         });

//         await api.save();

//         const userDetail = await userModel.findById(consumerId);
//         if (!userDetail) {
//             return res.stuas(400).json({ message: "user not found !", sucess: false })

//         }

//         userDetail.api.push({
//             apiId: api._id,
//             url: api.baseUrl,
//             purchased: false
//         });

//         await userDetail.save();

//         return res.status(201).json({ message: "api brought successfully", success: true, apiKey: apiKeyCode,apiPassword: apiPasswordCode });

//     } catch (error) {

//         console.log("error :", error)
//         return res.status(500).json({ message: "internal server error", error: error.message, success: false });

//     }

// }

// requets the api
module.exports.requestApiRoute = async (req, res) => {
  const startTime = Date.now();

  // const { apiUrl } = req.body;
  const endpoint = req.query.endpoint;
  const consumerId = req.id;
  const name = req.query.apiName;

  const apiKey = req.headers["api_provide_key"];
  const apiPassword = req.headers["api_provide_password"];

  // console.log("isAuthenticate apiKey:", apiKey);
  // console.log("isAuthenticate apiPassword:", apiPassword);
  // console.log("isAuthenticate name:", name);

  if (!apiKey || !apiPassword) {
    return res.status(401).json({
      message: "please provide the authhontication keys! ",
      success: false,
      error: "API key and password required",
    });
  }

  // if (!apiUrl) {
  //     return res.status(401).json({ message: "please fill all the creadentails! ", success: false, error: 'crendetial not provided!' });
  // }

  try {
    const api = await apiModel.findOne({
      "apiKeys.key": apiKey,
      "apiKeys.status": "active",
      name: name,
    });
    const userDetail = await userModel.findById(consumerId);

    if (!userDetail) {
      return res
        .status(401)
        .json({ message: "user not found!", success: false });
    }
    if (!api) {
      return res
        .status(400)
        .json({ message: "Invalid API key", success: false });
    }

    const keyObj = api.apiKeys.find(
      (k) => k.key === apiKey && k.status === "active",
    );
    if (!keyObj) {
      return res.status(401).json({ message: "API key not active" });
    }

    const apiEntry = userDetail.api.find((api) => api.keyCode === apiKey);
    if (!apiEntry) {
      return res.status(400).json({ message: "API key not valid" });
    }

    if (apiEntry.keyPassword !== apiPassword) {
      return res.status(401).json({ message: "Invalid API password" });
    }

    const providerUrl = `${api.baseUrl}${endpoint ? endpoint : ""}`;

    const providerApiResponse = await axios.get(providerUrl, {
      params: req.query,
    });

    // user usage per request ----------
    const userApi = userDetail.api.find((k) => k.apiId.equals(api._id));
    // api request per --------------
    if (api) {
      const latency = Date.now() - startTime;

      const hasBaseUrl = api.usageLogs.some((log) =>
        log.endpoint.includes(providerUrl),
      );

      if (hasBaseUrl) {
        const log = api.usageLogs.find((log) =>
          log.endpoint.includes(providerUrl),
        );

        log.status.push(res.statusCode);
        log.latency.push(Number(latency));
        log.timestamp.push(new Date(startTime));

        try {
          //  InfluxDB put -------
          // const point = new Point('api_usage')
          //     .tag('apiId', api._id.toString())
          //     .tag('endpoint', providerUrl)
          //     .intField('status_code', res.statusCode)
          //     .floatField('latency_ms', Number(latency))
          //     .timestamp(new Date(startTime))
          // writeClient.writePoint(point)
          // // flush asynchronously (don’t block request)
          // writeClient.flush().catch(err => {
          //     console.error('Influx flush error', err)
          // })
        } catch (error) {
          console.log("error :", error);
          return res.status(500).json({
            message: "internal server error (inflix) ",
            error: error.message,
            success: false,
          });
        }
      } else {
        api.usageLogs.push({
          apiKey: apiKey,
          endpoint: providerUrl,
          status: [res.statusCode],
          latency: [Number(latency)],
          timestamp: [new Date(startTime)],
        });
      }

      await api.save();

      console.log("userApi :->\n", userApi);

      if (userApi.Subscription.maxRequests == userApi.Subscription.requests) {
        console.log(
          "userApi.Subscription.maxRequests\n",
          userApi.Subscription.maxRequests,
        );
        userApi.Subscription.subscriptionPurchased = false;
        userApi.partialPayment = false;

        // console.log(
        //   "userApi.Subscription.subscriptionPurchased\n\n\n",
        //   userApi.Subscription.subscriptionPurchased,
        //   userApi.partialPayment,
        // );

        await userApi.save();
        await userDetail.save();

        return res.status(400).json({
          messgae: "free limit has been crosed ! --",
          sucess: false,
        });
      } else {
        // ------------------ PARTIAL PAYMANET ----------------------->
        if (userApi.Subscription.type == "partialpayment") {
          // api billing ----------------------->
          if (typeof userApi.usage !== "number") {
            userApi.usage = 0;
          }
          userApi.usage += 1;

          if (userApi.usage > 500) {
            if (userApi.purchased == true) {
              api.billing.totalRequests += 1;
            } else {
              if (userApi.partialPayment == true) {
                // api.billing.amount += 1;
                api.billing.totalRequests += 1;
                userApi.apiBill += 0.2;
                userApi.Subscription.requests += 1;

                if (userApi.usage % 100 === 99) {
                  userApi.partialPayment = false;
                }
              } else {
                if (userApi.usage % 100 === 0) {
                  return res.status(400).json({
                    messgae: "free limit has been crosed ! ",
                    sucess: false,
                  });
                } else {
                  if (userApi.partialPayment) {
                    // api.billing.amount += 0
                    api.billing.totalRequests += 1;
                    userApi.apiBill += 0.2;

                    userApi.Subscription.requests += 1;
                  }
                }
              }
            }
          } else {
            // api.billing.totalRequests += 1;
            // userApi.apiBill += 0.2;

            if (userApi.partialPayment == true) {
              // api.billing.amount += 1;
              api.billing.totalRequests += 1;
              userApi.apiBill += 0.2;

              userApi.Subscription.requests += 1;

              if (userApi.usage % 100 === 99) {
                userApi.partialPayment = false;
              }
            } else {
              if (userApi.usage % 100 === 0) {
                return res.status(400).json({
                  messgae: "free limit has been crosed ! ",
                  sucess: false,
                });
              } else {
                if (userApi.usage < 500) {
                  api.billing.totalRequests += 1;
                  userApi.apiBill = 1;

                  userApi.Subscription.requests += 1;
                } else {
                  if (userApi.partialPayment) {
                    // api.billing.amount += 0
                    api.billing.totalRequests += 0;
                    userApi.apiBill += 0.2;

                    userApi.Subscription.requests += 0;
                  } else {
                    api.billing.totalRequests += 1;
                    userApi.apiBill += 0.2;

                    userApi.Subscription.requests += 1;
                  }
                }
              }
            }
          }
        }

        // monthly subscription ----------------------->
        else if (userApi.Subscription.type == "monthlypayment") {
          // console.log(
          //   "---------------------\n\n\n\n\n monthly subscrion : \n",
          //   userApi.usage,
          //   userApi.Subscription.maxRequests,
          // );
          if (userApi.usage <= userApi.Subscription.maxRequests) {
            userApi.usage += 1;
            api.billing.totalRequests += 1;
            userApi.Subscription.requests += 1;
          } else {
            userApi.Subscription.subscriptionPurchased = false;
            userApi.partialPayment = false;
            await userApi.save();
            return res.status(400).json({
              messgae: "monthly subscription limit has been crosed ! ",
              sucess: false,
            });
          }
        }

        // yealry subscrion ----------------------->
        if (userApi.Subscription.type == "annualpayment") {
          if (userApi.usage <= userApi.Subscription.maxRequests) {
            userApi.usage += 1;
            api.billing.totalRequests += 1;
            userApi.Subscription.requests += 1;
          } else {
            userApi.Subscription.subscriptionPurchased = false;
            userApi.partialPayment = false;
            await userApi.save();
            return res.status(400).json({
              messgae: "annual subscription limit has been crosed ! ",
              sucess: false,
            });
          }

          await api.save();
          await userDetail.save();
        }
      }
    } else {
      console.log("API not linked to user yet");
    }

    await userApi.save();
    await api.save();
    await userDetail.save();

    return res.status(201).json({
      messgae: "got the response",
      data: providerApiResponse.data,
      success: true,
      status: providerApiResponse.status,
    });
  } catch (error) {
    console.log("error :", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

// get provide api stats
module.exports.getProviderStats = async (req, res) => {
  //     const client = new InfluxDB({ url: 'http://localhost:8086', token: 'my-token' });
  //     const queryApi = client.getQueryApi('MeterFlow');
  //     const timeApi = req.query.time;
  //     const apiId = req.query.apiId;

  //     console.log("timeApi", timeApi)

  //     const fluxQuery = `
  //   from(bucket: "api_logs")
  //     |> range(start: ${timeApi ? `-${timeApi}` : '-2h'})
  //     |> filter(fn: (r) => r._measurement == "api_usage")
  //     |> filter(fn: (r) => r.apiId == "${apiId}")  // <-- filter by ID
  // `;

  // let results = [];
  // let resultsTime = [];
  // let resultsLatency = [];
  // let resultsStatus = [];

  try {
    const { time, apiId } = req.query;

    // Calculate time range - ms() parses human-readable time like '2h' to milliseconds [web:11][web:20]
    const startTime = time
      ? new Date(Date.now() - ms(time))
      : new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Use lean() query once for read-only data to improve performance [web:8]
    const apiDoc = await apiModel.findById(apiId).lean();

    if (!apiDoc) {
      return res.status(404).json({ message: "API not found" });
    }

    // Filter usage logs where at least one timestamp >= startTime [web:3]
    // const filteredLogs = apiDoc.usageLogs.filter((log) => {
    //   return log.timestamp.some((ts) => new Date(ts) >= startTime);
    // });

    const filteredLogs = apiDoc.usageLogs;

    console.log("filteredLogs---\n", filteredLogs);

    // Separate latency and status results
    const resultsLatency = [];
    const resultsStatus = [];

    filteredLogs.forEach((log) => {
      log.latency.forEach((lat, idx) => {
        resultsLatency.push({
          time: log.timestamp[idx],
          latency: lat,
        });
      });

      log.status.forEach((st, idx) => {
        resultsStatus.push({
          time: log.timestamp[idx],
          status: st,
        });
      });
    });

    // Fixed: Swapped keys were incorrect - resultsStatus should contain status data [web:16]
    res.status(200).json({
      // Use 200 for successful data retrieval, not 201 [web:5]
      resultsLatency,
      resultsStatus,
      request: apiDoc?.billing?.totalRequests, // Use apiDoc (lean) since no mutations needed
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }

  // queryApi.queryRows(fluxQuery, {
  //     next(row, tableMeta) {
  //         const o = tableMeta.toObject(row);
  //         if (o._field === "latency_ms") {
  //             resultsLatency.push({
  //                 time: o._time,
  //                 latency: o._value
  //             });
  //         } else if (o._field === "status_code") {
  //             resultsStatus.push({
  //                 time: o._time,
  //                 status: o._value
  //             });
  //         }

  //     },
  //     error(err) {
  //         console.error(err);
  //         res.status(500).send({ error: err.message });
  //     },
  //     complete() {
  //         console.log('Query finished');
  //         console.log('resultsStatus, resultsLatency : ', resultsStatus, resultsLatency);
  //         console.log('resultsStatus, resultsLatency : ', api?.billing?.totalRequests);

  //         res.status(201).json({ resultsStatus, resultsLatency, "request": api?.billing?.totalRequests });
  //     },
  // });
};

// pay api proider
module.exports.apiPartialPayment = async (req, res) => {
  const consumerId = req.id;

  const { apiId, amount, type } = req.body;

  console.log("----------------\n start od the partial payment ");

  if (!consumerId || !apiId) {
    return res.status(401).json({
      message: "Api or user not found ! ",
      success: false,
      error: "error fetching he user detail",
    });
  }

  try {
    const api = await apiModel.findById(apiId);
    const userDetail = await userModel.findById(consumerId);
    const userApi = userDetail.api.find((k) => k.apiId.equals(api._id));

    console.log("----------------\n something ");
    if (userApi.partialPayment) {
      return res
        .status(400)
        .json({ message: "payment alredy done ( 20)", success: false });
    }

    // --------------- patial payment -----------
    if (type == "partialpayment") {
      api.billing.amount += amount;
      api.billing.totalAmount += amount;
      userApi.Subscription.subscriptionPurchased = true;
      userApi.Subscription.type = type;
      userApi.Subscription.maxRequests = 500;
      userApi.partialPayment = true;
    }
    // ----------- monthly payment --------------
    else if (type == "monthlypayment") {
      api.billing.amount += amount;
      api.billing.totalAmount += amount;
      userApi.Subscription.subscriptionPurchased = true;
      userApi.Subscription.ammount += amount;
      userApi.Subscription.type = type;
      userApi.Subscription.maxRequests = 25000;
      userApi.partialPayment = true;
      userApi.usage = true;
    }
    // -------------- annul payment --------------------------
    else if (type == "annualpayment") {
      api.billing.amount += amount;
      api.billing.totalAmount += amount;
      userApi.Subscription.subscriptionPurchased = true;
      userApi.Subscription.ammount += amount;
      userApi.Subscription.type = type;
      userApi.Subscription.maxRequests = 500000;
      userApi.partialPayment = true;
    }

    userApi.apiBill = 0;
    userApi.usage = 0;
    userApi.Subscription.requests = 0;

    api.billing.consumerDetail.push({
      customerId: consumerId,
      ammountPaid: amount,
      paidAt: new Date(),
      status: "paid",
    });

    await api.save();
    await userDetail.save();
    await userApi.save();

    console.log("--------> enf of the paument!");
    return res
      .status(201)
      .json({ message: "payment done sucessfully", success: true });
  } catch (error) {
    console.log("error :", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

// active / deactive toggle
module.exports.toggleStatus = async (req, res) => {
  const apiId = req.params.apiId;
  const { status } = req.body;
  const providerId = req.id;

  try {
    const api = await apiModel.findById(apiId);

    if (api.providerId != providerId) {
      return res.status(201).json({
        message: "you are not the provider of this api!",
        success: false,
      });
    }

    if (status == "active") {
      api.status = "revoked";
    } else {
      api.status = "active";
    }

    await api.save();

    return res.status(201).json({
      message: "api status updated!",
      success: true,
      status: api.status,
    });
  } catch (error) {
    console.log("error :", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

// delete api
module.exports.deleteApi = async (req, res) => {
  const providerId = req.id;
  const apiId = req.params.apiId;

  try {
    const providerDetail = await providerModel.findById(providerId);
    const api = await apiModel.findById(apiId);

    if (!api) {
      return res
        .status(400)
        .json({ message: "api not found !", sucess: false });
    }
    if (!providerDetail) {
      return res
        .status(400)
        .json({ message: "provider not found !", sucess: false });
    }

    if (providerId != api.providerId) {
      return res
        .status(400)
        .json({ message: "you are not owner of this api !", sucess: false });
    }

    await apiModel.findByIdAndDelete(api._id);

    providerDetail.apiCreated.includes(api._id);

    await providerDetail.save();

    return res.status(400).json({ message: "api deleted !", success: true });
  } catch (error) {
    console.log("error :", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

// get all api
module.exports.getAllApis = async (req, res) => {
  const consumerId = req.id;

  const { category } = req.query;

  try {
    if (category) {
      const userDetail = await userModel.findById(consumerId);

      if (!userDetail) {
        return res
          .status(400)
          .json({ message: "user not registired in !", success: false });
      }

      const allApis = await apiModel.find({ categories: category });

      return res
        .status(200)
        .json({ message: "api deleted !", success: true, allApi: allApis });
    }
    const userDetail = await userModel.findById(consumerId);

    if (!userDetail) {
      return res
        .status(400)
        .json({ message: "user not registired in !", success: false });
    }

    const allApis = await apiModel.find();

    return res
      .status(200)
      .json({ message: "api deleted !", success: true, allApi: allApis });
  } catch (error) {
    console.log("error :", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

// get api
module.exports.getApi = async (req, res) => {
  const consumerId = req.id;
  const apiId = req.params.apiId;
  // const ApiKey = req.params.apiKey;

  try {
    const userDetail = await userModel.findById(consumerId);

    if (!userDetail) {
      return res
        .status(400)
        .json({ message: "user not registired in !", success: false });
    }

    const api = await apiModel.findById(apiId);

    const apiEntry = userDetail.api.find((api) => api.apiId == apiId);

    if (apiEntry) {
      const credentailKey = {
        key: apiEntry.keyCode,
        keyPassword: apiEntry.keyPassword,
      };

      return res.status(200).json({
        message: "api deleted !",
        success: true,
        api: api,
        apiEntry: apiEntry,
        userDetail: userDetail,
        credentailKey: credentailKey,
      });
    } else {
      // const credentailKey = {
      //     key: apiEntry.keyCode,
      //     keyPassword: apiEntry.keyPassword
      // }

      return res.status(200).json({
        message: "api not deleted !",
        success: true,
        api: null,
        apiEntry: apiEntry,
        userDetail: userDetail,
        credentailKey: null,
      });
    }
  } catch (error) {
    console.log("error :", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};
