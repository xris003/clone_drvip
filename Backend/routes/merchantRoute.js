const express = require("express");
const merchantController = require("../controllers/merchantController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, merchantController.getAllMerchants)
  .post(merchantController.createMerchants);

router.route("/:id").patch(merchantController.updateMerchants);

module.exports = router;
