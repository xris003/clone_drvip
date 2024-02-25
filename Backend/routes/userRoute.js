const express = require("express");
const userController = require("../controllers/user");
const authController = require("../controllers/authUser");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.route("/").get(userController.getAllUsers);

// router.route("/:id").patch(userController.updateMerchants);

module.exports = router;
