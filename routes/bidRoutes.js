const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");

// Create bid on a travel post
router.post("/bids", bidController.createBid);

// Get all bids for a traveler post
router.get("/bids/allRequests/:travelerEmail", bidController.getBidsInTravelerPosts);

// Get all bids for a post
router.get("/bids/post/:postId", bidController.getBidsByPost);

// Update bid status
router.patch("/bids/:bidId/updateStatus", bidController.updateBidStatus);

// Get user's bids (both sent and received)
router.get("/bids/my/:email", bidController.getUserBids);

module.exports = router;