const express = require("express");
const userController = require("../controllers/user");
const authController = require("../controllers/authUser");

const router = express.Router();

router.post("/signup", authController.signup);
router.route("/").get(userController.getAllUsers);

// router.route("/:id").patch(userController.updateMerchants);

module.exports = router;
