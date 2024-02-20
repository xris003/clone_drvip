const {
  models: { Merchant },
} = require("../models");

const jwt = require("jsonwebtoken");
const merchant = require("../models/merchant");

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
    attributes: ["password"],
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
