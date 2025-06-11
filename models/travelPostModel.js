const { connectToDatabase, getObjectId } = require("../config/db");

class TravelPostModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("tradeTravelPosts");
  }

  static async createPost(post) {
    const collection = await this.getCollection();
    const newPost = {
      ...post,
      status: "post_approval_pending",
      createdAt: new Date(),
    };
    return collection.insertOne(newPost);
  }

  static async getPostsByTraveler(email) {
    const collection = await this.getCollection();
    return collection.find({ email: email }).toArray();
  }

  static async getPostById(id) {
    const collection = await this.getCollection();
    const { ObjectId } = require("mongodb");
    return collection.findOne({ _id: new ObjectId(id) });
  }

  static async getApprovedPosts(departure, arrival) {
    const collection = await this.getCollection();
    return collection
      .find({
        departureCity: departure,
        arrivalCity: arrival,
        status: "approved",
      })
      .toArray();
  }

  static async getPendingPosts() {
    const collection = await this.getCollection();
    return collection.find({ status: "post_approval_pending" }).toArray();
  }

  static async setPostStatus(postId, status) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(postId) },
      { $set: { status } }
    );
  }

  static async getAllPublicPosts() {
    const collection = await this.getCollection();
    return collection
      .find(
        { status: "approved" },
        {
          projection: {
            _id: 1,
            departureCity: 1,
            departureAirport: 1,
            departureDateTime: 1,
            arrivalCity: 1,
            arrivalAirport: 1,
            arrivalDateTime: 1,
            airline: 1,
            flightNumber: 1,
            maxWeight: 1,
            restrictions: 1,
            deliveryOptions: 1,
            contactMethod: 1,
            responseTime: 1,
            email: 1,
            status: 1,
            createdAt: 1,
          },
        }
      )
      .toArray();
  }
}

module.exports = TravelPostModel;
