const TravelPostModel = require("../models/travelPostModel");

const travelPostController = {
  createPost: async (req, res) => {
    try {
      const post = req.body;

      const result = await TravelPostModel.createPost(post);

      res.status(201).json({
        success: true,
        postId: result.insertedId,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  },

  getMyPosts: async (req, res) => {
    try {
      const posts = await TravelPostModel.getPostsByTraveler(req.params.email);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  },

  getPostById: async (req, res) => {
    try {
      const posts = await TravelPostModel.getPostById(req.params.postId);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  },

  searchPosts: async (req, res) => {
    try {
      const { departure, arrival } = req.query;
      const posts = await TravelPostModel.getApprovedPosts(departure, arrival);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  },

  getPendingPosts: async (req, res) => {
    try {
      const posts = await TravelPostModel.getPendingPosts();
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending posts" });
    }
  },

  updatePostStatus: async (req, res) => {
    try {
      const { postId, status } = req.body;
      await TravelPostModel.setPostStatus(postId, status);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Status update failed" });
    }
  },

  getAllPublicPosts: async (req, res) => {
    try {
      const posts = await TravelPostModel.getAllPublicPosts();
      res.status(200).json({
        success: true,
        posts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch public posts",
      });
    }
  },
};

module.exports = travelPostController;
