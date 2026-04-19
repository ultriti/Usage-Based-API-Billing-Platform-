const express = require('express');
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/DB");
const cookieParser = require("cookie-parser");

const user = require("./router/user.router")


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

app.post('/data', (req, res) => {
  const body = req.body;
  res.json({ message: 'Data received', data: body });
});


app.use("/api/user", user)


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
