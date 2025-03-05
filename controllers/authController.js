const User = require("../Models/User");
const catchAsync = require("../utilities/catchAsync");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const Mailer = require("../services/mailer");
const { promisify } = require("util");

// Sign JWT Token
const signToken = (userId) => jwt.sign({ userId }, process.env.TOKEN_KEY);

// Register New User
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existing_user = await User.findOne({
    email: email,
  });

  let new_user;

  if (existing_user && existing_user.verified === true) {
    // email already in use
    return res.status(400).json({
      status: "error",
      message: "Email already in use",
    });
  } else if (existing_user && existing_user.verified === false) {
    // delete previous record

    await User.findOneAndDelete({ email: email });
  }

  // there is no previous record => create new record
  new_user = await User.create({
    name,
    email,
    password,
  });

  req.userId = new_user._id;

  next();
});

// send OTP
exports.sendOTP = catchAsync(async (req, res, next) => {
  const { userId } = req;

  // generate new OTP
  const new_otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const otp_exipry_time = Date.now() + 10 * 60 * 1000; // 10 Mins after otp is created

  const user = await User.findByIdAndUpdate(
    userId,
    {
      otp_expiry_time: otp_exipry_time,
    },
    { new: true, validateModifiedOnly: true }
  );

  user.otp = new_otp;
  await user.save({});

  // send OTP via mail

  Mailer({ name: user.name, email: user.email, otp: new_otp });

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully!",
  });
});

// Resend OTP
exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Email is Invalid",
    });
  }

  // generate new OTP
  const new_otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const otp_exipry_time = Date.now() + 10 * 60 * 1000; // 10 Mins after otp is created

  user.otp_expiry_time = otp_exipry_time;
  user.otp = new_otp;
  await user.save({});

  // send OTP via mail

  Mailer({ name: user.name, email: user.email, otp: new_otp });

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully!",
  });
});

// verify OTP
exports.verifyOTP = catchAsync(async (req, res, next) => {
  //
  const { email, otp } = req.body;

  console.log(req.body);

  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() }, //! Corrected field name
  });

  console.log(user);

  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Email is Invalid or OTP expired",
    });
  }

  if (user.verified) {
    return res.status(400).json({
      status: "error",
      message: "Email is already verified",
    });
  }

  if (!(await user.correctOTP(otp, user.otp))) {
    return res.status(400).json({
      status: "error",
      message: "OTP is incorrect",
    });
  }

  // OTP is correct

  user.verified = true;
  user.otp = undefined;

  await user.save({
    new: true,
    validateModifiedOnly: true,
  });

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    message: "Email verified successfully!",
    token,
    user_id: user._id,
  });
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  console.log(email, password);

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Both email and password are required",
    });
  }

  const user = await User.findOne({
    email: email,
  }).select("+password");

  if (!user || !user.password) {
    return res.status(400).json({
      status: "error",
      message: "No record found for this email",
    });
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(400).json({
      status: "error",
      message: "Email or password is incorrect",
    });
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    message: "Logged in successfully!",
    token,
    user_id: user._id,
  });
});

// Protect
exports.protect = catchAsync(async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        message: "You are not logged in! Please log in to access application",
      });
    }

    // 2) Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_KEY);

    console.log(decoded);

    // 3) Check if user still exists

    const this_user = await User.findById(decoded.userId);
    if (!this_user) {
      return res.status(401).json({
        message: "The user belonging to this token does no longer exists.",
      });
    }
    // 4) Check if user changed password after the token was issued
    if (this_user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        message: "User recently changed password! Please log in again.",
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = this_user;
    next();
  } catch (error) {
    console.log(error);
    console.log("Protect endpoint failed");
    res.status(400).json({
      status: "error",
      message: "Authentication failed",
    });
  }
});
