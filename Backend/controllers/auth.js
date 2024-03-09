const {
  models: { Merchant },
} = require("../models");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const merchant = require("../models/merchant");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (merchant, statusCode, res) => {
  const token = signToken(merchant.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // For Production Environment Only
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from the returned data.
  merchant.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      merchant,
    },
  });
};

exports.signup = async (req, res) => {
  const merchant = await Merchant.create(req.body);

  createSendToken(merchant, 201, res);
};

exports.login = async (req, res, next) => {
  const { businessEmail, password } = req.body;

  // 1) If email and password exists
  if (!businessEmail || !password) {
    next(new AppError("Please provide email and password", 400));
  }

  // 2) if User and password is correct
  const merchant = await Merchant.findOne({
    where: { businessEmail },
    // attributes: ["password"],
  });

  if (
    !merchant ||
    !(await merchant.correctPassword(password, merchant.password))
  ) {
    return next(new AppError("Incorrect email or password"));
  }

  // 3) if ok send token to client
  createSendToken(merchant, 200, res);
};

// exports.logout = (req, res) => {
//   res.cookie("jwt", "loggedout", {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });
//   res.status(200).json({ status: "success" });
// };

// THIS FUNCTION IS STILL UNDER REVIEW
exports.protect = async (req, res, next) => {
  // 1) Get the token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Login to have access", 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //3) Check if Merchant stil exists
  const currentMerchant = await Merchant.findOne({ where: { id: decoded.id } });
  if (!currentMerchant) {
    return next(new AppError("The merchant no longer exists", 401));
  }
  const currentmerchant = await Merchant.findByPk(decoded.id);
  if (!currentmerchant) {
    return next(new AppError("The merchant no longer exists", 401));
  }

  // 4) Check if Merchant changed password after the token was isssued
  if (currentmerchant.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "Healthcare recently changed password! Please log in again.",
        401
      )
    );
  }

  // Set currentMerchant in both req.merchant and res.locals.merchant
  req.merchant = currentmerchant;

  // Grants Access to proctected route
  next();
};

exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const merchant = await Merchant.findOne({ where: { email: req.body.email } });
  if (!merchant) {
    return next(new AppError("There is no user with the email address", 404));
  }

  // 2) Generate the random reset token
  const resetToken = merchant.createPasswordResetToken();
  await merchant.save({ validateBeforeSave: false });

  // 3) Send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/merchants/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new passsword and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: merchant.email,
      subject: "Your password reset token (valid for 10mins)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    merchant.passwordResetToken = undefined;
    merchant.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again"),
      500
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1) Get USER based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const merchant = await Merchant.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is a user, set the new password
  if (!merchant) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  merchant.password = req.body.password;
  merchant.passwordConfirm = req.body.passwordConfirm;
  merchant.passwordResetToken = undefined;
  merchant.passwordResetExpires = undefined;
  await merchant.save();

  // 3) Update changedPasswordAt property for the user

  // 4) Log the healthcare in, send JWT
  createSendToken(merchant, 200, res);
};
