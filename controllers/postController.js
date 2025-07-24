const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const getAllPosts = async (req, res) => {
  const { category_id, q } = req.query; // Lấy category_id và query (q) từ query parameters

  let sql = `
    SELECT 
      p.*, 
      u.name AS author_name, 
      c.name AS category_name
    FROM 
      posts p
    LEFT JOIN 
      users u ON p.author_id = u.id
    LEFT JOIN 
      categories c ON p.category_id = c.id
  `;
  const params = [];
  const conditions = [];

  if (category_id && category_id !== "all") {
    conditions.push("p.category_id = ?");
    params.push(category_id);
  }

  if (q) {
    conditions.push("(p.title LIKE ? OR p.content LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY p.createdAt DESC"; // Sắp xếp theo ngày tạo mới nhất

  try {
    const [posts] = await pool.query(sql, params);
    res.status(200).json({
      message: "Lấy danh sách bài viết thành công.",
      data: posts,
    });
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy bài viết.", error: error.message });
  }
};

const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, u.name AS author_name
            FROM posts p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Bài viết không tìm thấy." });
    }
    res
      .status(200)
      .json({ message: "Lấy chi tiết bài viết thành công.", data: rows[0] });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy bài viết.", error: error.message });
  }
};

const createPost = async (req, res) => {
  const { title, content, category_id } = req.body;
  const author_id = req.user.id;
  const image = req.file ? req.file.filename : null;

  if (!title || !content || !category_id) {
    return res
      .status(400)
      .json({ message: "Tiêu đề, nội dung và danh mục là bắt buộc." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO posts (title, content, image, category_id, author_id) VALUES (?, ?, ?, ?, ?)",
      [title, content, image, category_id, author_id]
    );
    res.status(201).json({
      message: "Bài viết đã được tạo thành công.",
      postId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi tạo bài viết.", error: error.message });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, category_id } = req.body;
  const image = req.file ? req.file.filename : null;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!title || !content || !category_id) {
    return res
      .status(400)
      .json({ message: "Tiêu đề, nội dung và danh mục là bắt buộc." });
  }

  try {
    const [post] = await pool.query(
      "SELECT author_id, image FROM posts WHERE id = ?",
      [id]
    );
    if (post.length === 0) {
      return res.status(404).json({ message: "Bài viết không tìm thấy." });
    }

    // Chỉ tác giả hoặc admin mới được sửa bài viết
    if (post[0].author_id !== userId && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa bài viết này." });
    }

    let updateQuery =
      "UPDATE posts SET title = ?, content = ?, category_id = ?";
    let queryParams = [title, content, category_id];

    if (image) {
      updateQuery += ", image = ?";
      queryParams.push(image);
      // Xóa ảnh cũ nếu có
      if (post[0].image) {
        const oldImagePath = path.join(__dirname, "../uploads", post[0].image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Lỗi khi xóa ảnh cũ:", err);
        });
      }
    }
    updateQuery += " WHERE id = ?";
    queryParams.push(id);

    await pool.query(updateQuery, queryParams);
    res.status(200).json({ message: "Bài viết đã được cập nhật thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi máy chủ khi cập nhật bài viết.",
      error: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const [post] = await pool.query(
      "SELECT author_id, image FROM posts WHERE id = ?",
      [id]
    );
    if (post.length === 0) {
      return res.status(404).json({ message: "Bài viết không tìm thấy." });
    }

    // Chỉ tác giả hoặc admin mới được xóa bài viết
    if (post[0].author_id !== userId && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa bài viết này." });
    }

    // Xóa ảnh liên quan nếu có
    if (post[0].image) {
      const imagePath = path.join(__dirname, "../uploads", post[0].image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Lỗi khi xóa ảnh bài viết:", err);
      });
    }

    await pool.query("DELETE FROM posts WHERE id = ?", [id]);
    res.status(200).json({ message: "Bài viết đã được xóa thành công." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi xóa bài viết.", error: error.message });
  }
};

const searchPosts = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res
      .status(400)
      .json({ message: "Từ khóa tìm kiếm (q) là bắt buộc." });
  }
  const searchTerm = `%${q}%`;
  try {
    const [posts] = await pool.query(
      `SELECT p.*, c.name AS category_name, u.name AS author_name
            FROM posts p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.title LIKE ? OR p.content LIKE ?
            ORDER BY p.createdAt DESC`,
      [searchTerm, searchTerm]
    );
    res
      .status(200)
      .json({ message: "Tìm kiếm bài viết thành công.", data: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi máy chủ khi tìm kiếm bài viết.",
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
};
