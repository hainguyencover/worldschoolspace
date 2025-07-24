const { body } = require("express-validator");
const Category = require("../models/Category");

exports.categoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 3 })
    .withMessage("Category name must be at least 3 characters")
    .custom(async (name) => {
      const category = await Category.findOne({ name });
      if (category) throw new Error("Category already exists");
      return true;
    }),
];
