const router = require("express").Router();
const User = require("../models/User");
const Session = require("../models/Session");
const { sendOtpEmail } = require("../utils/sendEmail");
const asyncHandler = require("../middleware/asyncHandler");
const validateBody = require("../middleware/validateBody");
const { checkAuth } = require("../middleware/checkAuth");
const { uploadSingle } = require("../middleware/upload");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validation-schemas/auth.schema");

const COOKIE_NAME = "sid";

const publicUser = (u) => ({
  _id: u._id,
  id: u._id,
  username: u.username,
  email: u.email,
  image: u.image,
  role: u.role,
});

async function startSession(res, userId) {
  const { token, expiresAt } = await Session.createSession(userId);
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", expires: expiresAt });
}

// POST /auth/register   (multipart: username, email, password, password_confirmation, optional image)
router.post(
  "/register",
  uploadSingle("image"),
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const errors = {};
    if (await User.exists({ email })) errors.email = { errors: ["Email already in use"] };
    if (await User.exists({ username })) errors.username = { errors: ["Username already taken"] };
    if (Object.keys(errors).length) {
      return res.status(409).json({ status: "fail", error: "Validation failed", errors });
    }

    const isFirstUser = (await User.countDocuments()) === 0; // first user becomes admin
    const user = await User.create({
      username,
      email,
      password,
      image: req.file ? req.file.filename : null,
      role: isFirstUser ? "admin" : "user",
    });

    await startSession(res, user._id);
    res.status(201).json({ status: "success", data: { user: publicUser(user) } });
  })
);

// POST /auth/login   (json: email, password)
router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ status: "fail", error: "Invalid email or password" });
    }
    await startSession(res, user._id);
    res.json({ status: "success", data: { user: publicUser(user) } });
  })
);

// POST /auth/logout
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    if (req.cookies?.sid) await Session.destroySession(req.cookies.sid);
    res.clearCookie(COOKIE_NAME);
    res.json({ status: "success", message: "Logged out" });
  })
);

// GET /auth/me
router.get("/me", checkAuth, (req, res) => {
  res.json({ status: "success", data: { user: publicUser(req.user) } });
});

// POST /auth/forgot-password   (json: email)
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ status: "fail", error: "User with this email not found" });
    }
    const otp = user.generateOtp();
    await user.save();
    try {
      await sendOtpEmail(user.email, otp);
    } catch (err) {
      console.error("Failed to send OTP email:", err.message);
      console.log(`[DEV] OTP for ${user.email}: ${otp}`); // fallback for testing
    }
    res.json({ status: "success", message: "OTP sent to your email" });
  })
);

// POST /auth/reset-password   (json: email, otp, new_password, new_password_confirmation)
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email, otp, new_password } = req.body;
    const user = await User.findOne({ email }).select("+otpHash +otpExpires");
    if (!user || !user.verifyOtp(otp)) {
      return res.status(400).json({
        status: "fail",
        error: "Invalid or expired OTP",
        errors: { otp: { errors: ["Invalid or expired OTP"] } },
      });
    }
    user.password = new_password;
    user.clearOtp();
    await user.save();
    await Session.deleteMany({ user: user._id }); // log out everywhere
    res.json({ status: "success", message: "Password updated" });
  })
);

module.exports = router;