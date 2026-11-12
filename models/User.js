const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true, select: false },
    image: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    otpHash: { type: String, select: false },
    otpExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.generateOtp = function () {
  const otp = String(crypto.randomInt(100000, 1000000));
  this.otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  return otp;
};

userSchema.methods.verifyOtp = function (otp) {
  if (!this.otpHash || !this.otpExpires || this.otpExpires < new Date()) return false;
  return this.otpHash === crypto.createHash("sha256").update(String(otp)).digest("hex");
};

userSchema.methods.clearOtp = function () {
  this.otpHash = undefined;
  this.otpExpires = undefined;
};

module.exports = mongoose.model("User", userSchema);