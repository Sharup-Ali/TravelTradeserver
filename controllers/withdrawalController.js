const WithdrawalModel = require('../models/withdrawalModel');

const withdrawalController = {
  createWithdrawal: async (req, res) => {
    try {
      const { travelerEmail, amount, bankDetails } = req.body;
      
      if (!travelerEmail || !amount || !bankDetails) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const withdrawal = await WithdrawalModel.createWithdrawal({
        travelerEmail,
        amount,
        bankDetails
      });

      res.status(201).json(withdrawal);
    } catch (error) {
      console.error('Create withdrawal error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  getWithdrawalsByTraveler: async (req, res) => {
    try {
      const { travelerEmail } = req.params;
      const withdrawals = await WithdrawalModel.getWithdrawalsByTraveler(travelerEmail);
      res.status(200).json(withdrawals);
    } catch (error) {
      console.error('Get withdrawals error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  getAllWithdrawals: async (req, res) => {
    try {
      const withdrawals = await WithdrawalModel.getAllWithdrawals();
      res.status(200).json(withdrawals);
    } catch (error) {
      console.error('Get all withdrawals error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  updateWithdrawalStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await WithdrawalModel.updateWithdrawalStatus(id, status);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Update withdrawal status error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = withdrawalController;