const express = require("express");
const router = express.Router();
const parcelPickupController = require("../controllers/parcelPickupController");

// Create pickup instructions
router.post("/parcel-pickup", parcelPickupController.createInstruction);

// Get instructions by bid ID
router.get("/parcel-pickup/:bidId", parcelPickupController.getInstructionsByBid);

// Get instructions for traveler
router.get("/parcel-pickup/traveler/:travelerEmail", parcelPickupController.getInstructionsForTraveler);

module.exports = router;