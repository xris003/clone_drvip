const express = require("express");
const merchantController = require("../controllers/merchant");
const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.route("/").get(merchantController.getAllUsers);

router.route("/:id").patch(merchantController.updateMerchant);

module.exports = router;
