const { connectToDatabase, getObjectId } = require('../config/db');

class OrderModel {
  static async getCollection() {
    const db = await connectToDatabase();
    return db.collection('orders');
  }

  static async createOrder(order) {
    const collection = await this.getCollection();
    return collection.insertOne(order);
  }

  static async updateOrderStatus(orderId, status) {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: getObjectId(orderId) },
      { $set: { status } }
    );
  }

  static async getOrdersByUser(email) {
    const collection = await this.getCollection();
    return collection.find({ 
      $or: [{ senderEmail: email }, { travelerEmail: email }] 
    }).toArray();
  }
}

module.exports = OrderModel;