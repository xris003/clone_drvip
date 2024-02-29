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
  const token = signToken(merchant._id);
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
  const currentMerchant = await Merchant.findOne({ where: { id: decoded.id } });
  if (!currentMerchant) {
    return next(new AppError("The healthcare no longer exists", 401));
  }

  // 4) Check if healthcare changed password after the token was isssued
  if (currentMerchant.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "Healthcare recently changed password! Please log in again.",
        401
      )
    );
  }

  // Set currentHealthcare in both req.user and res.locals.user
  req.merchant = currentMerchant;

  // Grants Access to proctected route
  next();
};
