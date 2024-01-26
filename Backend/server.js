const express = require("express");
// const mysql2 = require("mysql2");
// const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 🚨 Shutting Down....");
  console.log(err.name, err.message);
});

// dotenv.config({ path: "./config.env" });
const app = express();

const db = require("/models");

db.sequelize.sync().then(() => {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`App running on port ${port}... `);
  });
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 🚨 Shutting Down....");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
