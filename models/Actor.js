const mongoose = require("mongoose");

const actorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: "" },
    birthDate: { type: Date },
    nationality: { type: String, default: "" },
    images: { type: [String], default: [] }, // file names inside /uploads
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

actorSchema.virtual("movies", {
  ref: "Movie",
  localField: "_id",
  foreignField: "actors",
});

actorSchema.statics.searchByName = function (term) {
  const safe = String(term || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return this.find(safe ? { name: new RegExp(safe, "i") } : {}).sort({ name: 1 });
};

module.exports = mongoose.model("Actor", actorSchema);