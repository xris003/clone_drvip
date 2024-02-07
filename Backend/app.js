const express = require("express");
const userRouter = require("./routes/userRoute");
const merchantRouter = require("./routes/merchantRoute");

const app = express();

app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/merchants", merchantRouter);

module.exports = app;
