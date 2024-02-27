const bcrypt = require("bcryptjs");

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
        defaultValue: False,
      },
    },

    {
      freezeTableName: true,
      createdAt: false,
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

  // To generate token to reset password
  User.prototype.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 40 * 120 * 1000;

    return resetToken;
  };

  return User;
};
