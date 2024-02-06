const db = require("./models");

const app = require("./app");

(async () => {
  db.sequelize.sync().then(() => {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`App running on port ${port}... `);
    });
  });
})();

// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION! 🚨 Shutting Down....");
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
