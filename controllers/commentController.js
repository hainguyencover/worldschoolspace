const pool = require("../config/db");

const createComment = async (req, res) => {
  const { content, postId } = req.body;
  const userId = req.user.id;

  if (!content || !postId) {
    return res
      .status(400)
      .json({ message: "Nội dung bình luận và ID bài viết là bắt buộc." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)",
      [content, postId, userId]
    );
    res.status(201).json({
      message: "Bình luận đã được gửi thành công. Đang chờ duyệt.",
      commentId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi máy chủ khi tạo bình luận.",
      error: error.message,
    });
  }
};

const getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;
  try {
    const [comments] = await pool.query(
      `SELECT c.*, u.name AS user_name, u.email AS user_email
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ? AND c.approved = TRUE
            ORDER BY c.createdAt DESC`,
      [postId]
    );
    res
      .status(200)
      .json({ message: "Lấy danh sách bình luận thành công.", data: comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi máy chủ khi lấy bình luận.",
      error: error.message,
    });
  }
};

const approveComment = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "UPDATE comments SET approved = TRUE WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bình luận không tìm thấy." });
    }
    res.status(200).json({ message: "Bình luận đã được duyệt thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi máy chủ khi duyệt bình luận.",
      error: error.message,
    });
  }
};

const getPendingComments = async (req, res) => {
  try {
    const [comments] = await pool.query(
      `SELECT c.*, u.name AS user_name, p.title AS post_title
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN posts p ON c.post_id = p.id
            WHERE c.approved = FALSE
            ORDER BY c.createdAt DESC`
    );
    res.status(200).json({
      message: "Lấy danh sách bình luận chờ duyệt thành công.",
      data: comments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi máy chủ khi lấy bình luận chờ duyệt.",
      error: error.message,
    });
  }
};

module.exports = {
  createComment,
  getCommentsByPostId,
  approveComment,
  getPendingComments,
};
