const router = require("express").Router();
const Review = require("../models/Review");
const asyncHandler = require("../middleware/asyncHandler");
const validateBody = require("../middleware/validateBody");
const validateObjectId = require("../middleware/validateObjectId");
const { checkAuth } = require("../middleware/checkAuth");
const { isOwnerOrAdmin } = require("../utils/permissions");
const { reviewUpdateSchema } = require("../validation-schemas/review.schema");

router.patch(
  "/:id",
  checkAuth,
  validateObjectId("id"),
  validateBody(reviewUpdateSchema),
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ status: "fail", error: "Review not found" });
    if (!isOwnerOrAdmin(req.user, review.user)) {
      return res.status(403).json({ status: "fail", error: "You are not allowed to edit this review" });
    }
    Object.assign(review, req.body);
    await review.save();
    res.json({ status: "success", data: review });
  })
);

router.delete(
  "/:id",
  checkAuth,
  validateObjectId("id"),
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ status: "fail", error: "Review not found" });
    if (!isOwnerOrAdmin(req.user, review.user)) {
      return res.status(403).json({ status: "fail", error: "You are not allowed to delete this review" });
    }
    await review.deleteOne();
    res.json({ status: "success", message: "Review deleted" });
  })
);

module.exports = router;