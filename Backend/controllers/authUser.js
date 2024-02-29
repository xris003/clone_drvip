const {
  models: { User },
} = require("../models");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // For Production Environment Only
  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from the returned data.
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res) => {
  const user = await User.create(req.body);

  // 2) Generate the random email verification token
  const verifyToken = user.createAccountVerifyToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to the user's email
  const verificationURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/verifyEmail/${verifyToken}`;

  const message = `Welcome to YourApp! To verify your email, please submit a PATCH request to: ${verificationURL}.\n If you didn't sign up for an account, please ignore this email!`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Verify Your Email Address",
      message,
    });
    // console.log(req.body.email);
    res.status(200).json({
      status: "success",
      message: "Verification token sent to email!",
    });
  } catch (err) {
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Handle the error, e.g., return a 500 status code
    res.status(500).json({
      status: "error",
      message: "Failed to send verification email. Please try again later.",
    });
  }
  //createSendToken(user, 201, res);
};

exports.verifyEmail = async (req, res, next) => {
  // 1) Get USER based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  // user.password = req.body.password;
  // user.passwordConfirm = req.body.passwordConfirm;
  user.activated = true;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user

  // 4) Log the healthcare in, send JWT
  createSendToken(user, 200, res);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) If email and password exists
  if (!email || !password) {
    next(new AppError("Please provide email and password", 400));
  }

  // 2) if User and password is correct
  const customer = await User.findOne({
    where: { email },
    attributes: ["password"],
  });

  if (
    !customer ||
    !(await customer.correctPassword(password, customer.password))
  ) {
    return next(new AppError("Incorrect email or password"));
  }

  // 3) if ok send token to client
  createSendToken(customer, 200, res);
};

// exports.logout = (req, res) => {
//   res.cookie("jwt", "loggedout", {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });
//   res.status(200).json({ status: "success" });
// };

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

  // 3) Check if healthcare stil exists
  const currentUser = await User.findOne({ where: { id: decoded.id } });
  if (!currentUser) {
    return next(new AppError("The healthcare no longer exists", 401));
  }

  // 4) Check if healthcare changed password after the token was isssued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "Healthcare recently changed password! Please log in again.",
        401
      )
    );
  }

  // Set currentHealthcare in both req.user and res.locals.user
  req.user = currentUser;

  // Grants Access to proctected route
  next();
};

exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) {
    return next(new AppError("There is no user with the email address", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new passsword and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10mins)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
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

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user

  // 4) Log the healthcare in, send JWT
  createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  // 1) Get USER from Collection
  const user = await User.findOne({ where: { email }, attributes: [password] });

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  // 3) If so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log User in, send JWT
  createSendToken(user, 200, res);
};
