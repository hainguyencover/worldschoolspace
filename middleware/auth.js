// middleware.auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "Không có token được cung cấp." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token không hợp lệ." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Xác thực token thất bại." });
    }
    req.user = decoded;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Yêu cầu quyền quản trị viên." });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
