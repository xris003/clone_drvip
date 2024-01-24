const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 🚨 Shutting Down....");
  console.log(err.name, err.message);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");
