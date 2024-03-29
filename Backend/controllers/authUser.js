const {
  models: { User },
} = require("../models");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  console.log("In sign token", id);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  // console.log("Inside createsendtoken", user);
  const token = signToken(user.id);
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
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
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
    // Handle the error, e.g., return a 500 status code
    console.log(err);
    return next(new AppError("Email Verification not sent", 500));
  }
};

exports.verifyEmail = async (req, res, next) => {
  // 1) Get USER based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    where: {
      emailVerifyToken: hashedToken,
    },
  });

  // 2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // Update the ACTIVATED, EMAILVERIFYTOKEN and EMAILVERIFYEXPIRES
  user.activated = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();

  // 4) Log the USER in, send JWT
  createSendToken(user, 200, res);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) If email and password exists
  if (!email || !password) {
    next(new AppError("Please provide email and password", 400));
  }

  // 2) if User and password is correct
  const user = await User.findOne({
    where: { email },
    // attributes: ["password"],
  });

  if (user.activated != true) {
    return next(new AppError("Kindly Verify Email"));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password"));
  }

  // 3) if ok send token to client
  createSendToken(user, 200, res);
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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Login to have access", 401)
    );
  }

  // 2) Verification token
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if User still exists
    const currentUser = await User.findByPk(decoded.id);
    // console.log("Email received:", req.user);
    if (!currentUser) {
      return next(new AppError("The user no longer exists", 401));
    }

    // 4) Check if User changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    // Set currentUser in both req.user and res.locals.user
    req.user = currentUser;
    res.locals.user = currentUser;

    // Grants Access to protected route
    next();
  } catch (err) {
    console.log(err);
    return next(new AppError("Invalid token. Please log in again.", 401));
  }
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
  try {
    // 1) Get User from Collection
    const user = await User.findByPk(req.user.id, {
      attributes: { include: ["password"] },
    });

    // 2) Check if POSTed current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("Your current password is wrong", 401));
    }

    // 3) If so update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log User in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    console.error(err);
    return next(new AppError("Error updating password", 500));
  }
};
