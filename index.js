const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "pages"))); // /home.html, /js/auth.js, /css/index.css ...

// routes
app.use("/", require("./routes/pages.routes"));
app.use("/auth", require("./routes/auth.routes"));
app.use("/api/movies", require("./routes/movie.routes"));
app.use("/api/actors", require("./routes/actor.routes"));
app.use("/api/reviews", require("./routes/review.routes"));

// 404
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/auth")) {
    return res.status(404).json({ status: "fail", error: "Not found" });
  }
  res.status(404).sendFile(path.join(__dirname, "pages", "404.html"));
});

// error handler
app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ status: "fail", error: "Invalid id" });
  }
  if (err.name === "MulterError" || err.message === "Only image files are allowed") {
    return res.status(400).json({ status: "fail", error: err.message });
  }
  console.error(err);
  res.status(500).json({ status: "fail", error: "Something went wrong" });
});

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}/home.html`)))
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });