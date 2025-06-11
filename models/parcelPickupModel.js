const { connectToDatabase, getObjectId } = require("../config/db");

class ParcelPickupModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("tradeTravelPickupInstructions");
  }

  static async createInstruction(instruction) {
    const collection = await this.getCollection();
    return collection.insertOne({
      ...instruction,
      createdAt: new Date(),
    });
  }

  static async getInstructionsByBid(bidId) {
    const collection = await this.getCollection();
    return collection.findOne({ bidId });
  }

  static async getInstructionsForTraveler(travelerEmail) {
    const collection = await this.getCollection();
    return collection.find({ travelerEmail }).toArray();
  }
}

module.exports = ParcelPickupModel;