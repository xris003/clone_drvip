const {
  models: { User },
} = require("../models");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

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

  createSendToken(user, 201, res);
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
