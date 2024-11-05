const jwt = require("jsonwebtoken");
const { Admin } = require("../models/Admin");

const userAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    if (!authorization || !authorization.startsWith("Bearer")) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(403).json({ message: "Unauthorized User", error: err.message });
      }

      if (!decodedToken || !decodedToken.id) {
        return res.status(401).json({ message: "Invalid Token: User ID not found" });
      }

      try {
        const user = await Admin.findOne({ _id: decodedToken.id });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        req.user = user; // Attach user object to request for further middleware or routes
        next();
      } catch (error) {
        return res.status(500).json({ message: "Database error", error: error.message });
      }
    });
  } catch (error) {
    return res.status(401).json({ message: "Authorization: Invalid Token", error: error.message });
  }
};

module.exports = { userAuth };
