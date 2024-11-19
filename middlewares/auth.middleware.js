const { User } = require("../models/auth/user.model");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!payload) {
      return res.status(401).json({
        message: "Authorization failed",
      });
    }

    if (payload.exp && payload.exp < Date.now() / 1000) {
      return res.status(401).json({
        message: "Token has expired",
      });
    }

    const user = await User.findByName(payload.name);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    req.user = payload;
    req.role = payload.role;
    next();
  } catch (error) {
    console.error(error?.message);
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = { auth };
