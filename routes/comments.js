// routes.comments.js
const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.post("/", verifyToken, commentController.createComment);
router.get("/post/:postId", commentController.getCommentsByPostId);
router.put(
  "/:id/approve",
  verifyToken,
  isAdmin,
  commentController.approveComment
);
router.get(
  "/pending",
  verifyToken,
  isAdmin,
  commentController.getPendingComments
);

module.exports = router;
