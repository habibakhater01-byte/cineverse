const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    number: { type: Number, required: true, min: 0, max: 10 },
    comment: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

reviewSchema.statics.findByMovie = function (movieId) {
  return this.find({ movie: movieId }).populate("user", "username image").sort({ createdAt: -1 });
};

reviewSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId }).populate("movie", "title image year director").sort({ createdAt: -1 });
};

module.exports = mongoose.model("Review", reviewSchema);