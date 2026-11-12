const mongoose = require("mongoose");

module.exports = (paramName = "id") => (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params[paramName])) {
    return res.status(400).json({ status: "fail", message: `Invalid ${paramName}` });
  }
  next();
};