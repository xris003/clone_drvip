module.exports = (sequelize, DataTypes) => {
  const Merchants = sequelize.define("Merchants", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
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
    owner: {
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

  return Merchants;
};

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 12);

//   this.passwordConfirm = undefined;
// });

// userSchema.pre("save", function (next) {
//   if (!this.isModified("password") || this.isNew) return next();

//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

// userSchema.methods.correctPassword = async function (
//   candidatePassword,
//   UserPassword
// ) {
//   return await bcrypt.compare(candidatePassword, UserPassword);
// };

// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );

//     console.log(this.passwordChangedAt, JWTTimestamp);
//     return JWTTimestamp < changedTimestamp;
//   }

//   return false;
// };

// // To generate token to reset password
// userSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString("hex");

//   this.passwordResetToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   console.log({ resetToken }, this.passwordResetToken);

//   this.passwordResetExpires = Date.now() + 40 * 120 * 1000;

//   return resetToken;
// };

// const User = mongoose.model("User", userSchema);

// module.exports = User;
