const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const categoryRoutes = require("./routes/categories");
const commentRoutes = require("./routes/comments");

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
  res.send("WorldSchoools.Space API is running!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Đã xảy ra lỗi máy chủ nội bộ.", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
