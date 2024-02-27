const express = require("express");
const merchantController = require("../controllers/merchant");
const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
// router.post("/forgotPassword", authController.forgotPassword);
// router.patch("/resetPassword/:token", authController.resetPassword);
// router.patch(
//   "/updatePassword",
//   authController.protect,
//   authController.updatePassword
// );

router.route("/").get(merchantController.getAllUsers);

router
  .route("/:id")
  .patch(authController.protect, merchantController.updateMerchant);

module.exports = router;
