const pool = require("../config/db");
const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC"
    );
    res.status(200).json({
      message: "Lấy danh sách danh mục thành công.",
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy danh mục.", error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params; // Lấy ID từ tham số URL
  try {
    const [category] = await pool.query(
      "SELECT * FROM categories WHERE id = ?",
      [id]
    );
    if (category.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }
    res.status(200).json({
      message: "Lấy thông tin danh mục thành công.",
      data: category[0], // Trả về đối tượng danh mục đầu tiên tìm thấy
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy danh mục.", error: error.message });
  }
};

const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Tên danh mục là bắt buộc." });
  }

  try {
    const [existingCategory] = await pool.query(
      "SELECT id FROM categories WHERE name = ?",
      [name]
    );
    if (existingCategory.length > 0) {
      return res.status(409).json({ message: "Danh mục đã tồn tại." });
    }

    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );
    res.status(201).json({
      message: "Danh mục đã được tạo thành công.",
      categoryId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi tạo danh mục.", error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
};
