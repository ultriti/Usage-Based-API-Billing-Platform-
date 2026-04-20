const exporess = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios")
const bcrypt = require('bcryptjs');

const userModel = require("../model/user.model");
const providerModel = require("../model/provider.model");
const apiProviderModel = require("../model/api.model");
const apiModel = require("../model/api.model");
const { CLIENT_RENEG_WINDOW } = require("tls");



const { InfluxDB, Point } = require('@influxdata/influxdb-client')

const token = process.env.INFLUXDB_TOKEN
const url = 'http://localhost:8086'
const org = 'MeterFlow'
const bucket = 'api_logs'

const client = new InfluxDB({ url, token })
const writeClient = client.getWriteApi(org, bucket, 'ns')



// code generation 
function generateSecureCode(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
    let code = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        code += charset[randomIndex];
    }

    return code;
}

// create api 
module.exports.createApi = async (req, res) => {

    const provId = req.id;

    const { providerId, baseUrl, name } = req.body;

    if (!providerId || !baseUrl || !name) {
        return res.status(400).json({ message: "All fields are required", success: false });

    }

    try {
        const providerDetail = await providerModel.findById(provId);
        const apiDetail = await apiModel.findOne({ baseUrl: baseUrl });

        if (apiDetail) {
            return res.status(400).json({ message: "api areldy exists with provide api", success: false })
        }

        if (!providerDetail) {
            return res.status(400).json({ message: "provider already exists", success: false });

        }

        const createdApi = await apiModel.create({
            providerId: providerId,
            name: name,
            baseUrl: baseUrl

        })

        return res.status(201).json({ message: "api created successfullly", success: true, createdApi });


    } catch (error) {

        console.log("error :", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });

    }

}



module.exports.setApiKey = async (req, res) => {
    const consumerId = req.id; // from auth middleware

    try {
        console.log("body:", req.body);

        const { providerApiId } = req.body;

        const userDetail = await userModel.findById(consumerId);
        const api = await apiModel.findById(providerApiId);
        if (!api) {
            return res.status(400).json({ message: "API not found!", success: false });
        }

        // Generate codes
        const apiKeyCode = generateSecureCode(25);
        const apiPasswordCode = generateSecureCode(12);

        const hashedApiPasswordCode = await apiModel.prototype.hashKeys(apiPasswordCode);

        console.log("api:--------------\n", api?._id)

        // Assume providerApiId is the ObjectId or string you want to check
        let existingApi = false;

        if (userDetail?.api && Array.isArray(userDetail.api)) {
            existingApi = userDetail.api.some(item =>
                String(item.apiId) === String(providerApiId)
            );
        }

        console.log("existingApi:", existingApi);



        console.log("------------->", existingApi)

        if (existingApi) {
            return res.status(400).json({ message: "API already purchased!", success: false });
        }

        api.apiKeys.push({
            consumerId: consumerId,
            key: apiKeyCode,
            apiPassword: hashedApiPasswordCode,
            status: 'active'
        });




        if (!userDetail) {
            return res.status(400).json({ message: "User not found!", success: false });
        }

        // const apiKeyEntry = userDetail.apiKeys.find(item => item.apiId.equals(api._id));


        userDetail.api.push({
            apiId: api._id,
            url: api.baseUrl,
            purchased: false,
            keyCode : apiKeyCode,
            keyPassword : apiPasswordCode

        });



        // if (apiKeyEntry) {
        //     apiKeyEntry.keyCode = apiKeyCode;
        //     apiKeyEntry.keyPassword = apiPasswordCode;
        // }


        await api.save();

        await userDetail.save();

        return res.status(201).json({
            message: "API purchased successfully",
            success: true,
            apiKey: apiKeyCode,
            apiPassword: apiPasswordCode
        });

    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false
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
    const endpoint = req.params.endpoint;
    const consumerId = req.id;

    const apiKey = req.headers['api_provide_key'];
    const apiPassword = req.headers['api_provide_password'];

    console.log("isAuthenticate apiKey:", apiKey);
    console.log("isAuthenticate apiPassword:", apiPassword);


    if (!apiKey || !apiPassword) {
        return res.status(401).json({ message: "please provide the authhontication keys! ", success: false, error: 'API key and password required' });
    }

    // if (!apiUrl) {
    //     return res.status(401).json({ message: "please fill all the creadentails! ", success: false, error: 'crendetial not provided!' });
    // }



    try {
        const api = await apiModel.findOne({ "apiKeys.key": apiKey, "apiKeys.status": "active" });
        const userDetail = await userModel.findById(consumerId);


        if (!userDetail) {
            return res.status(401).json({ message: "user not found!", success: false });
        }
        if (!api) {
            return res.status(401).json({ message: "Invalid API key", success: false });
        }
        const keyObj = api.apiKeys.find(k => k.key === apiKey && k.status === "active");
        if (!keyObj) {
            return res.status(401).json({ message: "API key not active" });
        }
        const isKeyPassMatch = await bcrypt.compare(apiPassword, keyObj.apiPassword);
        if (!isKeyPassMatch) {
            return res.status(400).json({ message: "invalid api key credentail!", sucess: false })
        }


        const providerUrl = `${api.baseUrl}${endpoint}`;

        const providerApiResponse = await axios.get(providerUrl, {
            params: req.query
        });


        // user usage per request ----------
        const userApi = userDetail.api.find(k => k.apiId.equals(api._id));
        // api request per -------------- 
        if (api) {

            const latency = Date.now() - startTime;

            const hasBaseUrl = api.usageLogs.some(log => log.endpoint.includes(providerUrl));

            if (hasBaseUrl) {

                const log = api.usageLogs.find(log => log.endpoint.includes(providerUrl));

                log.status.push(res.statusCode);
                log.latency.push(Number(latency));
                log.timestamp.push(new Date(startTime));

                try {

                    console.log("latency", latency);

                    //  InfluxDB put -------
                    const point = new Point('api_usage')
                        .tag('apiId', api._id.toString())
                        .tag('endpoint', providerUrl)
                        .intField('status_code', res.statusCode)
                        .floatField('latency_ms', Number(latency))
                        .timestamp(new Date(startTime))

                    writeClient.writePoint(point)

                    // flush asynchronously (don’t block request)
                    writeClient.flush().catch(err => {
                        console.error('Influx flush error', err)
                    })

                } catch (error) {
                    console.log("error :", error)
                    return res.status(500).json({ message: "internal server error (inflix) ", error: error.message, success: false });

                }

            } else {

                api.usageLogs.push({
                    apiKey: apiKey,
                    endpoint: providerUrl,
                    status: [res.statusCode],
                    latency: [Number(latency)],
                    timestamp: [new Date(startTime)]
                });
            }

            await api.save();



            // api billing -----------------------> 
            if (typeof userApi.usage !== 'number') {
                userApi.usage = 0;
            }
            userApi.usage += 1;

            if (userApi.usage > 500) {

                if (userApi.purchased == true) {
                    // userApi.apiBill += 0;
                    // api.billing.amount += 0;
                    api.billing.totalRequests += 1;
                } else {

                    console.log("userApi.usage % 100 === 0", userApi.usage % 100, 0)
                    if (userApi.partialPayment == true) {

                        // api.billing.amount += 1;
                        api.billing.totalRequests += 1;
                        userApi.apiBill += .2;


                        if (userApi.usage % 100 === 99) {
                            userApi.partialPayment = false;
                        }

                    } else {
                        if (userApi.usage % 100 === 0) {
                            return res.status(400).json({ messgae: "free limit has been crosed ! ", sucess: false })

                        } else {

                            if (userApi.partialPayment) {
                                // api.billing.amount += 0
                                api.billing.totalRequests += 1;
                                userApi.apiBill += .2;

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


                    if (userApi.usage % 100 === 99) {
                        userApi.partialPayment = false;
                    }

                } else {

                    console.log("----------- else ", userApi.usage)

                    if (userApi.usage % 100 === 0) {
                        return res.status(400).json({ messgae: "free limit has been crosed ! ", sucess: false })

                    } else {

                        if (userApi.usage < 500) {
                            api.billing.totalRequests += 1;
                            userApi.apiBill = 20;

                        } else {
                            if (userApi.partialPayment) {
                                // api.billing.amount += 0
                                api.billing.totalRequests += 0;
                                userApi.apiBill += 0.2;

                            } else {
                                api.billing.totalRequests += 1;
                                userApi.apiBill += 0.2;
                            }
                        }


                    }
                }

            }



            await api.save();
            await userDetail.save();
        } else {
            console.log("API not linked to user yet");
        }

        return res.status(201).json({ messgae: "got the response", data: providerApiResponse.data, success: true, status: providerApiResponse.status });

    } catch (error) {

        console.log("error :", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });

    }




}


// get 
module.exports.getProviderStats = async (req, res) => {

    const client = new InfluxDB({ url: 'http://localhost:8086', token: 'my-token' });
    const queryApi = client.getQueryApi('MeterFlow');

    const fluxQuery = `
    from(bucket: "api_logs")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "api_usage")
  `;

    // let results = [];
    // let resultsTime = [];
    let resultsLatency = [];
    let resultsStatus = [];

    queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
            const o = tableMeta.toObject(row);
            if (o._field === "latency_ms") {
                resultsLatency.push({
                    time: o._time,
                    latency: o._value
                });
            } else if (o._field === "status_code") {
                resultsStatus.push({
                    time: o._time,
                    status: o._value
                });
            }


        },
        error(err) {
            console.error(err);
            res.status(500).send({ error: err.message });
        },
        complete() {
            console.log('Query finished');
            console.log('resultsStatus, resultsLatency : ', resultsStatus, resultsLatency);

            res.json({ resultsStatus, resultsLatency });
        },
    });
}


// pay api proider
module.exports.apiPartialPayment = async (req, res) => {

    const consumerId = req.id;

    const { apiId } = req.body;


    if (!consumerId || !apiId) {
        return res.status(401).json({ message: "Api or user not found ! ", success: false, error: 'error fetching he user detail' });
    }

    try {


        const api = await apiModel.findById(apiId);
        const userDetail = await userModel.findById(consumerId);
        const userApi = userDetail.api.find(k => k.apiId.equals(api._id));

        if (userApi.partialPayment) {
            return res.status(400).json({ message: "payment alredy done ( 20)", success: false })
        }




        if (userApi.usage % 100 === 99) {

            api.billing.amount += userApi.apiBill;
            userApi.partialPayment = true;


        }

        userApi.apiBill = 0;

        await api.save()
        await userDetail.save()





        return res.status(201).json({ message: "payment done sucessfully", success: true })


    } catch (error) {

        console.log("error :", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });

    }





} 
