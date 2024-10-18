const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");

const {
  generateverificationToken,
} = require("../utlis/generateverificationToken");
const {
  generateTokenAndSetCookie,
} = require("../utlis/generateTokenAndSetCookie");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} = require("../mailtrap/emails");

const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/user.model");

/**
 *  @desc    Register New User
 *  @route   /api/auth/signup
 *  @method  POST
 *  @access  public
 */
module.exports.signup = asyncHandler(async (req, res) => {
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password, username } = req.body;

  const userAlreadyExists = await User.findOne({ email });
  const userNameAlreadyExists = await User.findOne({ username });
  // 

  if (userAlreadyExists) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }
  if (userNameAlreadyExists) {
    return res.status(400).json({
      success: false,
      message: "Username already exists. Please choose a unique one",
    });
  }

  const hashedPassword = await bcryptjs.hash(password, 10);
  const verificationToken = generateverificationToken();

  const user = new User({
    email,
    password: hashedPassword,
    username,
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    isVerified: true,
  });
  await user.save();

  // jwt
  generateTokenAndSetCookie(res, user._id, user.isAdmin);

  //send verification token "email"
  await sendVerificationEmail(user.email, verificationToken);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      ...user._doc,
      password: undefined,
    },
  });
});

/**
 *  @desc    verify-email
 *  @route   /api/auth/verify-email
 *  @method  POST
 *  @access  public
 */
module.exports.verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const user = await User.findOne({
    verificationToken: code,
    verificationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification code",
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  // const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;

  await sendWelcomeEmail(user.email, user.username); //profileUrl

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    user: {
      ...user._doc,
      password: undefined,
    },
  });
});

/**
 *  @desc    Login User
 *  @route   /api/auth/login
 *  @method  POST
 *  @access  public
 */
module.exports.login = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findOne({ email: req.body.email }).populate({path:"connections"});

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid credentials" });
  }
//   for (let path in User.schema.paths) {
//     if (
//       User.schema.paths[path].instance === "ObjectID" &&
//       User.schema.paths[path].options.ref
//     ) {
//       await user.populate(path); // Dynamically populate all reference fields
//     }
//   }
  const isPasswordValid = await bcryptjs.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid credentials" });
  }

  generateTokenAndSetCookie(res, user._id, user.isAdmin);

  user.lastLogin = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user: {
      ...user._doc,
      password: undefined,
    },
  });
});

/**
 *  @desc    logout User
 *  @route   /api/auth/logout
 *  @method  POST
 */
module.exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

/**
 *  @desc    forgotPassword
 *  @route   /api/auth/forgotPassword
 *  @method  POST
 */
module.exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = resetTokenExpiresAt;

  await user.save();

  // send email
  await sendPasswordResetEmail(
    user.email,
    `${process.env.CLIENT_URL}/reset-password/${resetToken}`
  );

  res
    .status(200)
    .json({ success: true, message: "Password reset link sent to your email" });
});

module.exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired reset token" });
  }

  // update password
  const hashedPassword = await bcryptjs.hash(password, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  await sendResetSuccessEmail(user.email);

  res.status(200).json({ success: true, message: "Password reset successful" });
});

/**
 *  @desc    protectRoute
 *  @route   /api/auth/check-auth
 *  @method  Get
 */
module.exports.protectRoute = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }
  res.status(200).json({ success: true, user });
});
