const bcrypt = require("bcryptjs");
const crypto = require("crypto");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
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
        type: DataTypes.VIRTUAL,
        allowNull: false,
        validate: {
          isSamePassword(value) {
            if (value !== this.password) {
              throw new Error("Passwords do not match");
            }
          },
        },
      },
      passwordResetToken: {
        type: DataTypes.STRING,
      },
      passwordResetExpiresAt: {
        type: DataTypes.DATE,
      },
      activated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      emailVerifyToken: {
        type: DataTypes.STRING,
      },
      emailVerifyExpires: {
        type: DataTypes.DATE,
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
    }
  );

  // Use a hook to hash the password before saving the user to the database
  User.beforeCreate(async (user) => {
    if (user.changed("password")) {
      user.password = await bcrypt.hash(user.password, 12);
      user.confirmPassword = undefined;
    }
  });

  // Instance method to compare passwords
  User.prototype.correctPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      // console.log(changedTimestamp, JWTTimestamp);
      return JWTTimestamp < changedTimestamp;
    }
    // False means not changed
    return false;
  };

  // To generate token to verify password
  User.prototype.createAccountVerifyToken = function () {
    const verifyToken = crypto.randomBytes(32).toString("hex");

    this.emailVerifyToken = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");

    console.log({ verifyToken }, this.emailVerifyToken);

    this.emailVerifyExpires = Date.now() + 40 * 120 * 120 * 1000;

    return verifyToken;
  };

  return User;
};
