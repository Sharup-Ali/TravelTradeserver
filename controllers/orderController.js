const OrderModel = require('../models/orderModel');

const orderController = {
  createOrder: async (req, res) => {
    try {
      const order = req.body;
      const result = await OrderModel.createOrder(order);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { orderId, status } = req.body;
      const result = await OrderModel.updateOrderStatus(orderId, status);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserOrders: async (req, res) => {
    try {
      const email = req.params.email;
      const result = await OrderModel.getOrdersByUser(email);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = orderController;