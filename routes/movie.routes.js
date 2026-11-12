const router = require("express").Router();
const Movie = require("../models/Movie");
const Review = require("../models/Review");
const asyncHandler = require("../middleware/asyncHandler");
const validateBody = require("../middleware/validateBody");
const validateObjectId = require("../middleware/validateObjectId");
const { checkAuth } = require("../middleware/checkAuth");
const { uploadSingle } = require("../middleware/upload");
const { isOwnerOrAdmin } = require("../utils/permissions");
const { movieSchema, movieUpdateSchema } = require("../validation-schemas/movie.schema");
const { reviewSchema } = require("../validation-schemas/review.schema");

// GET /api/movies?search=inter&actor=<actorId>   (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const movies = await Movie.searchMovies({ search: req.query.search, actor: req.query.actor });
    res.json({ status: "success", results: movies.length, data: movies });
  })
);

// GET /api/movies/:id   (public) -> movie + actors + reviews (with their authors)
router.get(
  "/:id",
  validateObjectId("id"),
  asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id)
      .populate("actors", "name images")
      .populate({
        path: "reviews",
        options: { sort: { createdAt: -1 } },
        populate: { path: "user", select: "username image" },
      });
    if (!movie) return res.status(404).json({ status: "fail", error: "Movie not found" });
    res.json({ status: "success", data: movie });
  })
);

// POST /api/movies   (any logged-in user)  multipart
router.post(
  "/",
  checkAuth,
  uploadSingle("image"),
  validateBody(movieSchema),
  asyncHandler(async (req, res) => {
    const movie = await Movie.create({
      ...req.body,
      image: req.file ? req.file.filename : null,
      createdBy: req.user._id,
    });
    res.status(201).json({ status: "success", data: movie });
  })
);

// PATCH /api/movies/:id   (owner or admin)  multipart
router.patch(
  "/:id",
  checkAuth,
  validateObjectId("id"),
  uploadSingle("image"),
  validateBody(movieUpdateSchema),
  asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ status: "fail", error: "Movie not found" });
    if (!isOwnerOrAdmin(req.user, movie.createdBy)) {
      return res.status(403).json({ status: "fail", error: "You are not allowed to edit this movie" });
    }
    Object.assign(movie, req.body);
    if (req.file) movie.image = req.file.filename;
    await movie.save();
    res.json({ status: "success", data: movie });
  })
);

// DELETE /api/movies/:id   (owner or admin) -> its reviews are deleted too
router.delete(
  "/:id",
  checkAuth,
  validateObjectId("id"),
  asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ status: "fail", error: "Movie not found" });
    if (!isOwnerOrAdmin(req.user, movie.createdBy)) {
      return res.status(403).json({ status: "fail", error: "You are not allowed to delete this movie" });
    }
    await Movie.findOneAndDelete({ _id: movie._id });
    res.json({ status: "success", message: "Movie deleted" });
  })
);

// POST /api/movies/:movieId/reviews   (logged-in)  json: { number, comment }
router.post(
  "/:movieId/reviews",
  checkAuth,
  validateObjectId("movieId"),
  validateBody(reviewSchema),
  asyncHandler(async (req, res) => {
    const { movieId } = req.params;
    if (!(await Movie.exists({ _id: movieId }))) {
      return res.status(404).json({ status: "fail", error: "Movie not found" });
    }
    if (await Review.exists({ movie: movieId, user: req.user._id })) {
      return res.status(409).json({ status: "fail", error: "You already reviewed this movie" });
    }
    const review = await Review.create({ ...req.body, movie: movieId, user: req.user._id });
    res.status(201).json({ status: "success", data: review });
  })
);

module.exports = router;