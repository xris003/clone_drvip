const express = require("express");
const dotenv = require("dotenv");
const userRouter = require("./routes/userRoute");
const merchantRouter = require("./routes/merchantRoute");

dotenv.config({ path: "./config.env" });

const app = express();

app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/merchants", merchantRouter);

module.exports = app;
