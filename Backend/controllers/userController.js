const Users = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
  const user = await Users.findAll();

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
  await Users.create(user);
  res.json;
};
