const UserModel = require("../models/userModel");

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const result = await UserModel.getAllUsers();
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  getUserByEmail: async (req, res) => {
    try {
      const email = req.params.email;
      const result = await UserModel.getUserByEmail(email);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createUser: async (req, res) => {
    try {
      const user = req.body;
      const existingUser = await UserModel.getUserByEmail(user.email);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await UserModel.createUser(user);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await UserModel.deleteUser(id);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const userEmail = req.params.email;
      const { role } = req.body;
      const result = await UserModel.updateUserRole(userEmail, role);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  checkAdminStatus: async (req, res) => {
    try {
      const email = req.params.email;
      const result = await UserModel.checkAdminStatus(email);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  checkTravelerStatus: async (req, res) => {
    try {
      const email = req.params.email;
      const result = await UserModel.checkTravelerStatus(email);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  checkSenderStatus: async (req, res) => {
    try {
      const email = req.params.email;
      const result = await UserModel.checkSenderStatus(email);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const email = req.params.email;
      const updateData = req.body;
      const result = await UserModel.updateUserByEmail(email, updateData);
      if (result.modifiedCount === 1) {
        res
          .status(200)
          .json({ success: true, message: "User updated successfully" });
      } else {
        res.status(404).json({
          success: false,
          message: "User not found or no changes made",
        });
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  getAllVerifications: async (req, res) => {
    try {
      const users = await UserModel.getAllUsers();
      const verifications = users.filter(
        (user) => user.verificationData?.status === "pending"
      );

      res.status(200).json(verifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verification data" });
    }
  },

  updateVerificationstatus: async (req, res) => {
    try {
      const email = req.params.email;
      const { status } = req.body;
      const result = await UserModel.updateVerificationStatus(email, status);
      if (result.modifiedCount === 1) {
        res
          .status(200)
          .json({ success: true, message: "User updated successfully" });
      } else {
        res.status(404).json({
          success: false,
          message: "User not found or no changes made",
        });
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  getVerificationByEmail: async (req, res) => {
    try {
      const email = req.params.email;
      const user = await UserModel.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.verificationData) {
        return res
          .status(404)
          .json({ message: "Verification data not found for this user" });
      }

      res.status(200).json(user.verificationData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verification data" });
    }
  },

  addReview: async (req, res) => {
    try {
      const email = req.params.email; 
      const reviewData = req.body; 
      const result = await UserModel.addReview(email, reviewData);
      if (result.modifiedCount === 1) {
        res
          .status(200)
          .json({ success: true, message: "Review added successfully" });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  // New controller methods for reviews
  getReviewsReceived: async (req, res) => {
    try {
      const email = req.params.email;
      const reviews = await UserModel.getReviewsReceived(email);
      
      if (reviews.length === 0) {
        return res.status(200).json({ 
          message: "No reviews found for this user", 
          reviews: [] 
        });
      }
      
      res.status(200).json({ 
        message: "Reviews fetched successfully", 
        reviews 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews received" });
    }
  },

  getReviewsGiven: async (req, res) => {
    try {
      const email = req.params.email;
      const reviewsGiven = await UserModel.getReviewsGiven(email);
      
      if (reviewsGiven.length === 0) {
        return res.status(200).json({ 
          message: "No reviews given by this user", 
          reviews: [] 
        });
      }
      
      res.status(200).json({ 
        message: "Reviews given fetched successfully", 
        reviews: reviewsGiven 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews given" });
    }
  },

  getAllReviewsGivenBySenders: async (req, res) => {
    try {
      const allReviewsBySenders = await UserModel.getAllReviewsGivenBySenders();
      
      if (allReviewsBySenders.length === 0) {
        return res.status(200).json({ 
          message: "No reviews given by senders found", 
          reviews: [] 
        });
      }
      
      res.status(200).json({ 
        message: "All reviews by senders fetched successfully", 
        reviews: allReviewsBySenders,
        total: allReviewsBySenders.length 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews given by senders" });
    }
  },
};

module.exports = userController;