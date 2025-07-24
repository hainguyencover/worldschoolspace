// routes/categories.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById); // Thêm dòng này
router.post("/", verifyToken, isAdmin, categoryController.createCategory);

module.exports = router;
