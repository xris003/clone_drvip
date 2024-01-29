// userModel.js

const { DataTypes } = require("sequelize");
const sequelize = require("../models/index"); // Update the path accordingly

const Users = sequelize.define("Users", {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  confirmPassword: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Users;
