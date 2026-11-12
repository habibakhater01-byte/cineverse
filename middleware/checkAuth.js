const Session = require("../models/Session");

async function checkAuth(req, res, next) {
  try {
    const user = await Session.validateSession(req.cookies?.sid);
    if (!user) {
      return res.status(401).json({ status: "fail", error: "Authentication required" });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ status: "fail", error: "You are not allowed to do this" });
    }
    next();
  };
}

module.exports = { checkAuth, authorize };