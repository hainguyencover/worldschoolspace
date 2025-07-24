const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu là bắt buộc." });
  }

  try {
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email đã được đăng ký." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [email, hashedPassword, name]
    );
    res.status(201).json({ message: "Đăng ký thành công." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi đăng ký.", error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu là bắt buộc." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Đăng nhập thành công.",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi đăng nhập.", error: error.message });
  }
};

module.exports = {
  register,
  login,
};
