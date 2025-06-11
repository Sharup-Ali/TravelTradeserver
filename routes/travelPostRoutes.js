const express = require("express");
const router = express.Router();
const travelPostController = require("../controllers/travelPostController");

router.post("/travelPost", travelPostController.createPost);
router.get("/travelPost/my-posts/:email", travelPostController.getMyPosts);
router.get("/travelPost/post/:postId", travelPostController.getPostById);
router.get("/travelPost/search", travelPostController.searchPosts);
router.get("/travelPost/all-public", travelPostController.getAllPublicPosts);
router.get("/travelPost/pending", travelPostController.getPendingPosts);
router.put("/travelPost/status", travelPostController.updatePostStatus);

module.exports = router;
