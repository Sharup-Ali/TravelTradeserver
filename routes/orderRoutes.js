const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.put('/status', orderController.updateStatus);
router.get('/:email', orderController.getUserOrders);

module.exports = router;