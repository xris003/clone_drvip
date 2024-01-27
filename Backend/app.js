const express = require("express");
const userRouter = require("./routes/userRoute");

const app = express();

app.use(express.json());

// app.get("/createddb", (req, res) => {
//   let sql = "CREATE DATABASE drvip";
//   db.query(sql, (err) => {
//     if (err) {
//       throw err;
//     }
//     res.send("Database Created");
//   });
// });

app.use("/api/v1/users", userRouter);

module.exports = app;
