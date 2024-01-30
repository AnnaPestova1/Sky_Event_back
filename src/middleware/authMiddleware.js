const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const authMiddleware = (req, res, next) => {
  //check header
  const authHeader = req.headers.authorization;
  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ") ||
    authHeader.split(" ")[1] === "null"
  ) {
    throw new UnauthenticatedError("Authentication invalid");
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //attach the user to the data routes
    req.user = { userId: payload.userId, name: payload.name };
    next();
  } catch (error) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthenticatedError("Authentication invalid");
    }
  }
};

module.exports = authMiddleware;
