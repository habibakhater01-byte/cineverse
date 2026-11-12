const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    director: { type: String, required: true, trim: true },
    genres: { type: [String], default: [] },
    trailerLink: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: null }, // poster file name inside /uploads
    actors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Actor" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

movieSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "movie",
});

movieSchema.statics.searchMovies = function ({ search, actor } = {}) {
  const filter = {};
  if (search) filter.title = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (actor) filter.actors = actor; // actor id
  return this.find(filter).populate("actors", "name images").sort({ createdAt: -1 });
};

movieSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await mongoose.model("Review").deleteMany({ movie: doc._id });
});

module.exports = mongoose.model("Movie", movieSchema);