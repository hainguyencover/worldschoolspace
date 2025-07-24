const { body } = require("express-validator");
const Post = require("../models/Post");

exports.commentValidator = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ min: 5 })
    .withMessage("Comment must be at least 5 characters"),

  body("postId")
    .trim()
    .notEmpty()
    .withMessage("Post ID is required")
    .custom(async (postId) => {
      const post = await Post.findById(postId);
      if (!post) throw new Error("Post not found");
      return true;
    }),
];
