const express = require("express");
const Users = require("../models");
const userController = require("../controllers/userController");
// const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUsers);

// router.route("/:id").patch(merchantController.updateMerchants);

module.exports = router;
