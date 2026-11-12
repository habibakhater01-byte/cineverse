const mongoose = require("mongoose");
const crypto = require("crypto");

const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // MongoDB auto-deletes expired sessions
});

const SESSION_DAYS = 7;

sessionSchema.statics.createSession = async function (userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await this.create({ token, user: userId, expiresAt });
  return { token, expiresAt };
};

sessionSchema.statics.validateSession = async function (token) {
  if (!token) return null;
  const session = await this.findOne({ token, expiresAt: { $gt: new Date() } }).populate("user");
  return session ? session.user : null;
};

sessionSchema.statics.destroySession = function (token) {
  return this.deleteOne({ token });
};

module.exports = mongoose.model("Session", sessionSchema);