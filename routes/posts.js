// routes.posts.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.get("/", postController.getAllPosts);
router.get("/search", postController.searchPosts);
router.get("/:id", postController.getPostById);
router.post(
  "/",
  verifyToken,
  postController.upload.single("image"),
  postController.createPost
);
router.put(
  "/:id",
  verifyToken,
  postController.upload.single("image"),
  postController.updatePost
);
router.delete("/:id", verifyToken, postController.deletePost);

module.exports = router;
