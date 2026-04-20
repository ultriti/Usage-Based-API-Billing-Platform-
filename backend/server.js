const express = require('express');
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/DB");
const cookieParser = require("cookie-parser");

const user = require("./router/user.route")
const provider = require("./router/provider.route")
const apiGen = require("./router/apiProvider.route")

const { exec } = require("child_process");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();



app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});


// demo testing 
app.get('/data', (req, res) => {

  const data = {
    "name": "Pikachu",
    "type": "Electric",
    "level": 25,
    "abilities": ["Static", "Lightning Rod"],
    "stats": {
      "hp": 35,
      "attack": 55,
      "defense": 40,
      "speed": 90
    }
  }

  res.json({ message: 'Data received', data: data });
});


// get from influx
const { InfluxDB } = require('@influxdata/influxdb-client');

app.post("/influx", async (req, res) => {
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
      res.json({resultsStatus , resultsLatency}); // send results back to client
    },
  });
});






app.use("/api/user", user);
app.use("/api/provider", provider);
app.use("/api/apiGen", apiGen);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
