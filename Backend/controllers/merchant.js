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

exports.updateMerchant = async (req, res, next) => {
  const merchant = await Merchant.update({
    where: { id: req.params.id },
    attributes: [
      "businessName",
      "businessType",
      "businessEmail",
      "contact",
      "walletAddress",
    ],
  });
  // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   runValidators: true,
  // });

  if (!merchant) {
    return next(new AppError("No document with that number", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: merchant,
    },
  });
};
