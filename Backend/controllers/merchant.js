const {
  models: { Merchant },
} = require("../models");

exports.getAllUsers = async (req, res) => {
  const user = await Merchant.findAll();

  if (!user) {
    return next(new AppError("No document with that number", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
};

exports.getUser = async (req, res, next) => {
  const user = await Merchant.findOne({ where: { id: req.params.id } });

  if (!user) {
    return next(new AppError("No document with that number", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
};

exports.createUsers = async (req, res) => {
  const user = req.body;
  await Merchant.create(user);
  res.json({
    status: "success",
    data: {
      data: user,
    },
  });
};
