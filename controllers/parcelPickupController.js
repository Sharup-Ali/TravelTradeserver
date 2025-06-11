const ParcelPickupModel = require("../models/parcelPickupModel");
const BidModel = require("../models/bidModel");

const parcelPickupController = {
  createInstruction: async (req, res) => {
    try {
      const instruction = req.body;
      const result = await ParcelPickupModel.createInstruction(instruction);
      
      // Update bid status to parcel_Pickup
      await BidModel.updateBidStatus(instruction.bidId, "parcel_Pickup");
      
      res.status(201).json({
        success: true,
        instructionId: result.insertedId,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create instruction" });
    }
  },

  getInstructionsByBid: async (req, res) => {
    try {
      const bidId = req.params.bidId;
      const instruction = await ParcelPickupModel.getInstructionsByBid(bidId);
      if (!instruction) {
        return res.status(404).json({ error: "No instructions found" });
      }
      res.status(200).json(instruction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch instructions" });
    }
  },

  getInstructionsForTraveler: async (req, res) => {
    try {
      const travelerEmail = req.params.travelerEmail;
      const instructions = await ParcelPickupModel.getInstructionsForTraveler(travelerEmail);
      res.status(200).json(instructions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch instructions" });
    }
  },
};

module.exports = parcelPickupController;