const isOwnerOrAdmin = (user, ownerId) =>
  user.role === "admin" || String(ownerId) === String(user._id);

module.exports = { isOwnerOrAdmin };