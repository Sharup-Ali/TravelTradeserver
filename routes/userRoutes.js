const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/users", userController.getAllUsers);
router.get("/users/:email", userController.getUserByEmail);
router.post("/users", userController.createUser);
router.get("/users/verificationRequest/all", userController.getAllVerifications);
router.delete("/users/:id", userController.deleteUser);
router.put("/users/updateUserRole/:email", userController.updateUserRole);
router.get("/users/admin/:email", userController.checkAdminStatus);
router.get("/users/traveler/:email", userController.checkTravelerStatus);
router.get("/users/sender/:email", userController.checkSenderStatus);
router.put("/users/:email", userController.updateUser);
router.post("/users/review/:email", userController.addReview);
router.put("/users/verificationRequest/verify/:email", userController.updateVerificationstatus);
router.get('/users/:email', userController.getUserByEmail);

// New routes for reviews
router.get("/users/reviews/received/:email", userController.getReviewsReceived);
router.get("/users/reviews/given/:email", userController.getReviewsGiven);
router.get("/users/reviews/all-given-by-senders", userController.getAllReviewsGivenBySenders);

module.exports = router;