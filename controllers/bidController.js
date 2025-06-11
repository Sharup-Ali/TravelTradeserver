const BidModel = require("../models/bidModel");

const bidController = {
  createBid: async (req, res) => {
    try {
      const bid = req.body;
      const result = await BidModel.createBid(bid);
      res.status(201).json({
        success: true,
        bidId: result.insertedId,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create bid" });
    }
  },

  getBidsInTravelerPosts: async (req, res) => {
    try {
      const travelerEmail = req.params.travelerEmail;
      const bids = await BidModel.getBidsInTravelerPosts(travelerEmail);
      res.status(200).json(bids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  },

  getBidsByPost: async (req, res) => {
    try {
      const postId = req.params.postId;
      const bid = await BidModel.getBidsByPost(postId);
      if (!bid) {
        return res.status(404).json({ error: "No bid found for this post" });
      }
      res.status(200).json(bid);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bid" });
    }
  },

  updateBidStatus: async (req, res) => {
    try {
      const bidId = req.params.bidId;
      const { status } = req.body;
      await BidModel.updateBidStatus(bidId, status);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update bid status" });
    }
  },

  getUserBids: async (req, res) => {
    try {
      const email = req.params.email;
      const bids = await BidModel.getUserBids(email);
      res.status(200).json(bids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user bids" });
    }
  },
};

module.exports = bidController;