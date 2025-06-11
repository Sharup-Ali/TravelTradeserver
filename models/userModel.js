const { connectToDatabase, getObjectId } = require("../config/db");

class UserModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection("tradeTravelUsers");
  }

  static async getAllUsers() {
    const collection = await this.getCollection();
    return collection.find().toArray();
  }

  static async getUserByEmail(email) {
    const collection = await this.getCollection();
    return collection.findOne({ email });
  }

  static async getVerificationByEmail(email) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return user?.verificationData || null;
  }

  static async updateVerificationStatus(email, status) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { email },
      {
        $set: {
          "verificationData.status": status,
          verificationStatus: status,
        },
      }
    );
  }

  static async getUserById(id) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: getObjectId(id) });
  }

  static async createUser(user) {
    const collection = await this.getCollection();
    // Add default balance of 0 for new users
    const userWithDefaults = {
      balance: 0,
      ...user,
      createdAt: new Date(),
    };
    return collection.insertOne(userWithDefaults);
  }

  static async deleteUser(id) {
    const collection = await this.getCollection();
    return collection.deleteOne({ _id: getObjectId(id) });
  }

  static async updateUserRole(email, role) {
    const collection = await this.getCollection();
    return collection.updateOne({ email }, { $set: { role } });
  }

  static async checkAdminStatus(email) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return { admin: user?.role === "admin" };
  }

  static async checkTravelerStatus(email) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return { traveler: user?.role === "traveler" };
  }

  static async checkSenderStatus(email) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return { sender: user?.role === "sender" };
  }

  static async updateUserByEmail(email, updateData) {
    const collection = await this.getCollection();
    return collection.updateOne({ email }, { $set: updateData });
  }

  static async addReview(email, reviewData) {
    const collection = await this.getCollection();
    return collection.updateOne({ email }, { $push: { reviews: reviewData } });
  }

  // New methods for reviews
  static async getReviewsReceived(email) {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return user?.reviews || [];
  }

  static async getReviewsGiven(reviewerEmail) {
    const collection = await this.getCollection();
    // Find all users who have reviews from this reviewer
    const usersWithReviews = await collection
      .find({
        "reviews.reviewerEmail": reviewerEmail,
      })
      .toArray();

    const reviewsGiven = [];

    usersWithReviews.forEach((user) => {
      const userReviews = user.reviews.filter(
        (review) => review.reviewerEmail === reviewerEmail
      );

      userReviews.forEach((review) => {
        reviewsGiven.push({
          ...review,
          reviewedUserEmail: user.email,
          reviewedUserName: user.name,
          reviewedUserPhoto: user.photo,
        });
      });
    });

    return reviewsGiven;
  }

  static async getAllReviewsGivenBySenders() {
    const collection = await this.getCollection();

    // First, get all senders
    const senders = await collection.find({ role: "sender" }).toArray();
    const senderEmails = senders.map((sender) => sender.email);

    // Find all users who have reviews from senders
    const usersWithReviews = await collection
      .find({
        "reviews.reviewerEmail": { $in: senderEmails },
      })
      .toArray();

    const allReviewsBySenders = [];

    usersWithReviews.forEach((user) => {
      const senderReviews = user.reviews.filter((review) =>
        senderEmails.includes(review.reviewerEmail)
      );

      senderReviews.forEach((review) => {
        // Get sender info
        const sender = senders.find((s) => s.email === review.reviewerEmail);

        allReviewsBySenders.push({
          ...review,
          reviewedUserEmail: user.email,
          reviewedUserName: user.name,
          reviewedUserPhoto: user.photo,
          reviewedUserRole: user.role,
          senderName: sender?.name,
          senderPhoto: sender?.photo,
        });
      });
    });

    // Sort by creation date (newest first)
    return allReviewsBySenders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  static async updateAdminBalance(amount) {
    const collection = await this.getCollection();
    const adminEmail = "traveltradesihab@gmail.com";

    return collection.updateOne(
      { email: adminEmail },
      {
        $inc: { balance: amount },
        $setOnInsert: {
          email: adminEmail,
          name: "TravelTrade",
          role: "admin",
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }
}

module.exports = UserModel;
