const router = require("express").Router();
const Actor = require("../models/Actor");
const Movie = require("../models/Movie");
const asyncHandler = require("../middleware/asyncHandler");
const validateBody = require("../middleware/validateBody");
const validateObjectId = require("../middleware/validateObjectId");
const { checkAuth } = require("../middleware/checkAuth");
const { uploadMultiple } = require("../middleware/upload");
const { isOwnerOrAdmin } = require("../utils/permissions");
const { actorSchema, actorUpdateSchema } = require("../validation-schemas/actor.schema");

// GET /api/actors?search=tom   (public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const actors = await Actor.searchByName(req.query.search || req.query.name);
    res.json({ status: "success", results: actors.length, data: actors });
  })
);

// GET /api/actors/:id   (public) -> actor + filmography
router.get(
  "/:id",
  validateObjectId("id"),
  asyncHandler(async (req, res) => {
    const actor = await Actor.findById(req.params.id).populate("movies", "title image year");
    if (!actor) return res.status(404).json({ status: "fail", error: "Actor not found" });
    res.json({ status: "success", data: actor });
  })
);

// POST /api/actors   (logged-in)  multipart, files field: images
router.post(
  "/",
  checkAuth,
  uploadMultiple("images"),
  validateBody(actorSchema),
  asyncHandler(async (req, res) => {
    const images = (req.files || []).map((f) => f.filename);
    const actor = await Actor.create({ ...req.body, images, createdBy: req.user._id });
    res.status(201).json({ status: "success", data: actor });
  })
);

// PATCH (and PUT) /api/actors/:id   (owner or admin)
const updateActor = [
  checkAuth,
  validateObjectId("id"),
  uploadMultiple("images"),
  validateBody(actorUpdateSchema),
  asyncHandler(async (req, res) => {
    const actor = await Actor.findById(req.params.id);
    if (!actor) return res.status(404).json({ status: "fail", error: "Actor not found" });
    if (!isOwnerOrAdmin(req.user, actor.createdBy)) {
      return res.status(403).json({ status: "fail", error: "You are not allowed to edit this actor" });
    }
    Object.assign(actor, req.body);
    if (req.files?.length) actor.images = req.files.map((f) => f.filename);
    await actor.save();
    res.json({ status: "success", data: actor });
  }),
];
router.patch("/:id", ...updateActor);
router.put("/:id", ...updateActor);

// DELETE /api/actors/:id   (owner or admin)
router.delete(
  "/:id",
  checkAuth,
  validateObjectId("id"),
  asyncHandler(async (req, res) => {
    const actor = await Actor.findById(req.params.id);
    if (!actor) return res.status(404).json({ status: "fail", error: "Actor not found" });
    if (!isOwnerOrAdmin(req.user, actor.createdBy)) {
      return res.status(403).json({ status: "fail", error: "You are not allowed to delete this actor" });
    }
    await actor.deleteOne();
    await Movie.updateMany({ actors: actor._id }, { $pull: { actors: actor._id } });
    res.json({ status: "success", message: "Actor deleted" });
  })
);

module.exports = router;