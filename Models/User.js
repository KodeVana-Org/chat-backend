const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    // jobTitle
    jobTitle: {
      type: String,
      trim: true,
    },
    // bio
    bio: {
      type: String,
      trim: true,
    },
    // country
    country: {
      type: String,
    },
    // Avatar
    avatar: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Name is required"],
      validate: {
        validator: function (email) {
          return validator.isEmail(email);
        },
        message: (props) => `Email (${props.value}) is invalid!`,
      },
      unique: true,
    },
    password: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
    verified: {
      type: Boolean, // true, false
      default: false,
    },
    otp: {
      type: String,
    },
    otp_expiry_time: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Offline",
    },
    socketId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// PRE SAVE HOOK
userSchema.pre("save", async function (next) {
  // Hash the password if it's modified
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password.toString(), 12);
    console.log(this.password.toString(), "FROM PRE SAVE HOOK (Password)");
  }

  // Hash the OTP if it's modified
  if (this.isModified("otp") && this.otp) {
    this.otp = await bcrypt.hash(this.otp.toString(), 12);
    console.log(this.otp.toString(), "FROM PRE SAVE HOOK (OTP)");
  }

  next();
});

// METHOD
userSchema.methods.correctOTP = async function (candidateOTP, userOTP) {
  return await bcrypt.compare(candidateOTP, userOTP);
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }

  // FALSE MEANS NOT CHANGED
  return false;
};

const User = new mongoose.model("User", userSchema);
module.exports = User;
