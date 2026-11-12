const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) =>
    cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase()),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) =>
    /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only image files are allowed")),
});

module.exports = {
  uploadSingle: (field = "image") => upload.single(field),
  uploadMultiple: (field = "images", max = 5) => upload.array(field, max),
};