const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const withdrawalController = require('../controllers/withdrawalController');


// Payment initiation
router.post('/initiate', paymentController.initiatePayment);

// Payment callback URLs - handle both GET and POST
router.get('/success/:orderId', paymentController.handleSuccess);
router.post('/success/:orderId', paymentController.handleSuccess);

router.get('/fail/:orderId', paymentController.handleFailure);
router.post('/fail/:orderId', paymentController.handleFailure);

router.get('/cancel/:orderId', paymentController.handleCancel);
router.post('/cancel/:orderId', paymentController.handleCancel);

// IPN handler - typically POST only
router.post('/ipn', paymentController.handleIPN);

// Other payment routes
router.get('/history/:senderEmail', paymentController.getPaymentHistory);
router.get('/earnings/:travelerEmail', paymentController.getEarnings);
router.get('/all', paymentController.getAllPayments);
router.post('/create', paymentController.createPayment);

// Withdrawal routes
router.post('/withdrawals', withdrawalController.createWithdrawal);
router.get('/withdrawals/:travelerEmail', withdrawalController.getWithdrawalsByTraveler);
router.get('/withdrawals/admin/all', withdrawalController.getAllWithdrawals);
router.patch('/withdrawals/:id/status', withdrawalController.updateWithdrawalStatus);

module.exports = router;