const express = require("express");
const merchantController = require("../controllers/merchant");
// const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(merchantController.getAllUsers)
  .post(merchantController.createUsers);

// router.route("/:id").patch(merchantController.updateMerchants);

module.exports = router;
