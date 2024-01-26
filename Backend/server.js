const express = require("express");
const mysql2 = require("mysql2");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 🚨 Shutting Down....");
  console.log(err.name, err.message);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "xris07026305657",
  database: "drvip",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  res.send("Database Created");
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}... `);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 🚨 Shutting Down....");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
