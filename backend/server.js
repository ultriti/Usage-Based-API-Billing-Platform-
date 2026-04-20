const express = require('express');
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/DB");
const cookieParser = require("cookie-parser");

const user = require("./router/user.route")
const provider = require("./router/provider.route")
const apiGen = require("./router/apiProvider.route")


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


app.use("/api/user", user);
app.use("/api/provider", provider);
app.use("/api/apiGen", apiGen);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
