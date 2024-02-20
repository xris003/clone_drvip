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
  try {
    const [numRowsAffected, updatedMerchant] = await Merchant.update(
      {
        businessName: req.body.businessName,
        businessType: req.body.businessType,
        businessAddress: req.body.businessAddress,
        businessEmail: req.body.businessEmail,
        city: req.body.city,
        state: req.body.state,
        contact: req.body.contact,
        walletAddress: req.body.walletAddress,
      },
      {
        where: { id: req.params.id },
        returning: true, // Make sure to include this to get the updated record
      }
    );

    if (numRowsAffected === 0) {
      return next(new AppError("No document with that number", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: updatedMerchant[0], // Since returning is set to true, updatedMerchant is an array with the updated record at index 0
      },
    });
  } catch (error) {
    // Handle any Sequelize errors
    next(error);
  }
};
