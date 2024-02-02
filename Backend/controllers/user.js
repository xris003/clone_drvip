const { User } = require("../models");

exports.getAllUsers = async (req, res) => {
  const user = await User.findAll();

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
  await User.create(user);
  res.json({
    status: "success",
    data: {
      data: user,
    },
  });
};
