const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const db = require("./db");

const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);

app.listen(PORT, () => {
  console.log(`The app is running at http://localhost:${PORT}`);
});
