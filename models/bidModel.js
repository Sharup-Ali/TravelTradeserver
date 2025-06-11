const { connectToDatabase, getObjectId } = require("../config/db");

class BidModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("tradeTravelBids");
  }

  static async getBidsInTravelerPosts(travelerEmail) {
    const collection = await this.getCollection();
    return collection.find({ travelerEmail }).toArray();
  }

  static async createBid(bid) {
    const collection = await this.getCollection();
    return collection.insertOne({
      ...bid,
      status: "travellerPending",
      createdAt: new Date(),
    });
  }

  static async getBidsByPost(postId) {
    const collection = await this.getCollection();
    return collection.findOne({ postId });
  }

  static async updateBidStatus(bidId, status) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(bidId) },
      { $set: { status } }
    );
  }
  

  static async getUserBids(email) {
    const collection = await this.getCollection();
    return collection
      .find({
        $or: [{ senderEmail: email }, { travelerEmail: email }],
      })
      .toArray();
  }
}

module.exports = BidModel;