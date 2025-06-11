const { connectToDatabase, getObjectId } = require('../config/db');

class WithdrawalModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection('tradeTravelWithdrawals');
  }

  static async createWithdrawal(withdrawalData) {
    const collection = await this.getCollection();
    return collection.insertOne({
      ...withdrawalData,
      status: 'pending',
      createdAt: new Date()
    });
  }

  static async getWithdrawalsByTraveler(travelerEmail) {
    const collection = await this.getCollection();
    return collection.find({ travelerEmail }).toArray();
  }

  static async getAllWithdrawals() {
    const collection = await this.getCollection();
    return collection.find().toArray();
  }

  static async updateWithdrawalStatus(id, status) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(id) },
      { $set: { status } }
    );
  }
}

module.exports = WithdrawalModel;