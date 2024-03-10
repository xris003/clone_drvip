const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const Merchants = sequelize.define(
    "merchant",
    {
      businessName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      businessEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      businessType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      businessAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      owner: {
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
      walletAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passwordResetToken: {
        type: DataTypes.STRING,
      },
      passwordResetExpiresAt: {
        type: DataTypes.DATE,
      },
    },
    {
      freezeTableName: true,
    }
  );

  // Use a hook to hash the password before saving the user to the database
  Merchants.beforeCreate(async (merchant) => {
    if (merchant.changed("password")) {
      merchant.password = await bcrypt.hash(merchant.password, 12);
      merchant.confirmPassword = undefined;
    }
  });

  // Instance method to compare passwords
  Merchants.prototype.correctPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  return Merchants;
};
