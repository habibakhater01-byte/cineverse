const { z } = require("zod");

const reviewSchema = z.object({
  number: z.coerce
    .number({ message: "Rating is required" })
    .int("Rating must be a whole number")
    .min(0, "Rating must be 0 to 10")
    .max(10, "Rating must be 0 to 10"),
  comment: z.string().trim().max(2000).optional(),
});

const reviewUpdateSchema = reviewSchema.partial();

module.exports = { reviewSchema, reviewUpdateSchema };