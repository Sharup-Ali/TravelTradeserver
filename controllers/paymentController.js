require("dotenv").config();
const PaymentModel = require("../models/paymentModel");
const BidModel = require("../models/bidModel");
const UserModel = require("../models/userModel");
const axios = require("axios");

const paymentController = {
  initiatePayment: async (req, res) => {
    try {
      const { orderId, amount, email, travelerEmail } = req.body;

      if (!orderId || !amount || !email || !travelerEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const transactionId = `TRADE_${Date.now()}_${orderId}`;
      const backendUrl = process.env.BACKEND_URL || "http://localhost:9000";

      const paymentData = new URLSearchParams({
        store_id: process.env.SSLCOMMERZ_STORE_ID,
        store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
        total_amount: amount.toString(),
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${backendUrl}/success/${orderId}`,
        fail_url: `${backendUrl}/fail/${orderId}`,
        cancel_url: `${backendUrl}/cancel/${orderId}`,
        ipn_url: `${backendUrl}/ipn`,
        cus_name: "TradeTravel Customer",
        cus_email: email,
        cus_phone: "01700000000",
        cus_add1: "TradeTravel Payment",
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        shipping_method: "NO",
        product_name: "Parcel Delivery Service",
        product_category: "Service",
        product_profile: "general",
        value_a: orderId,
        value_b: travelerEmail,
        value_c: email,
        value_d: amount,
      });

      const response = await axios.post(
        "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
        paymentData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.data.status !== "SUCCESS") {
        throw new Error(
          response.data.failedreason || "Payment initiation failed"
        );
      }

      // Create pending payment record
      await PaymentModel.createPayment({
        travelerEmail,
        senderEmail: email,
        orderId,
        paymentIntentId: transactionId,
        amount,
        status: "pending",
        paymentMethod: "sslcommerz",
      });

      res.json({
        success: true,
        paymentUrl: response.data.GatewayPageURL,
        transactionId,
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  handleSuccess: async (req, res) => {
    try {
      const { orderId } = req.params; // Changed from bookingId to orderId to match route

      // Extract transaction ID from both query and body parameters
      let tran_id, amount;

      if (req.method === "GET") {
        tran_id = req.query.tran_id;
        amount = req.query.amount;
      } else if (req.method === "POST") {
        tran_id = req.body.tran_id;
        amount = req.body.amount;
      }

      console.log("Payment success data:", {
        method: req.method,
        orderId, // Changed from bookingId
        tran_id,
        amount,
        query: req.query,
        body: req.body,
      });

      if (!tran_id || !amount) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/payment-result?payment=failed&error=missing_parameters&order_id=${orderId}`
        );
      }

      // Verify payment with SSLCommerz
      const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php?tran_id=${tran_id}&store_id=${
        process.env.SSLCOMMERZ_STORE_ID || "carsw683bc46e1ae21"
      }&store_passwd=${
        process.env.SSLCOMMERZ_STORE_PASSWORD || "carsw683bc46e1ae21@ssl"
      }&format=json`;

      const verifyResponse = await axios.get(verifyUrl);
      const paymentData = verifyResponse.data?.element?.[0];

      if (
        !verifyResponse.data ||
        verifyResponse.data.APIConnect !== "DONE" ||
        !paymentData ||
        paymentData.status !== "VALID" ||
        paymentData.tran_id !== tran_id
      ) {
        await PaymentModel.updatePaymentStatus(tran_id, "failed");

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/payment-result?payment=failed&error=verification_failed&order_id=${orderId}`
        );
      }

      const paymentUpdateResult = await PaymentModel.updatePaymentStatus(
        tran_id,
        "completed",
        paymentData.val_id || null
      );
      console.log("Payment update result:", paymentUpdateResult);

      // Calculate and update platform fees (10%)
      const platformFee = parseFloat(amount) * 0.1;
      const travelerEarnings = parseFloat(amount) - platformFee;

      // Update admin balance
      await UserModel.updateAdminBalance(platformFee);

      // Update bid status to "paymentDone"
      const bidUpdateResult = await BidModel.updateBidStatus(
        orderId,
        "paymentDone",
        travelerEarnings // Pass the actual amount traveler will receive
      );
      console.log("Bid update result:", bidUpdateResult);

      if (!bidUpdateResult.modifiedCount) {
        console.error("Failed to update bid status - no document modified");
      }

      // Redirect to frontend with success message
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=success&tran_id=${tran_id}&amount=${amount}&order_id=${orderId}`
      );
    } catch (error) {
      console.error("Payment success handling error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/payment-result?payment=failed&error=${encodeURIComponent(
          error.message
        )}&order_id=${req.params.orderId}`
      );
    }
  },
  // Fixed handleSuccess method
  // handleSuccess: async (req, res) => {
  //   try {
  //     const { orderId } = req.params;

  //     // Enhanced debugging
  //     console.log("=== Payment Success Handler ===");
  //     console.log("Method:", req.method);
  //     console.log("Headers:", req.headers);
  //     console.log("Request body:", req.body);
  //     console.log("Request query:", req.query);
  //     console.log("Request params:", req.params);
  //     console.log("================================");

  //     // Get transaction ID - SSLCommerz typically sends it as 'tran_id' in POST body or query
  //     let tran_id;

  //     if (req.method === "POST") {
  //       // For direct callback from SSLCommerz
  //       tran_id = req.body.tran_id;
  //     } else {
  //       // For user redirect
  //       tran_id = req.query.tran_id;
  //     }

  //     // Fallback to other possible fields if still not found
  //     if (!tran_id) {
  //       tran_id = req.body.transaction_id || req.query.transaction_id;
  //     }

  //     console.log("Extracted transaction ID:", tran_id);

  //     if (!tran_id) {
  //       console.error("Transaction ID not found in request");
  //       console.error("Available fields in body:", Object.keys(req.body || {}));
  //       console.error(
  //         "Available fields in query:",
  //         Object.keys(req.query || {})
  //       );

  //       return res.status(400).json({
  //         error: "Transaction ID not found",
  //         debug: {
  //           body: req.body,
  //           query: req.query,
  //           method: req.method,
  //         },
  //       });
  //     }

  //     // Get additional payment data from request
  //     const amount = req.body.amount || req.query.amount || req.body.value_d;
  //     const val_id = req.body.val_id || req.query.val_id;
  //     const status = req.body.status || req.query.status;

  //     console.log("Payment data:", { tran_id, amount, val_id, status });

  //     // Verify payment with SSLCommerz
  //     const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php?tran_id=${tran_id}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`;

  //     console.log("Verifying payment with URL:", verifyUrl);

  //     const verifyResponse = await axios.get(verifyUrl);
  //     console.log("Verification response:", verifyResponse.data);

  //     const paymentData = verifyResponse.data?.element?.[0];

  //     if (
  //       !verifyResponse.data ||
  //       verifyResponse.data.APIConnect !== "DONE" ||
  //       !paymentData ||
  //       paymentData.status !== "VALID"
  //     ) {
  //       console.error("Payment verification failed:", {
  //         apiConnect: verifyResponse.data?.APIConnect,
  //         paymentStatus: paymentData?.status,
  //         fullResponse: verifyResponse.data,
  //       });
  //       throw new Error("Payment verification failed");
  //     }

  //     console.log("Payment verified successfully");

  //     // Update payment status
  //     await PaymentModel.updatePaymentStatus(
  //       tran_id,
  //       "completed",
  //       paymentData.val_id || val_id
  //     );

  //     // Update bid status
  //     await BidModel.updateBidStatus(orderId, "paymentDone");

  //     console.log("Database updated successfully");

  //     // For POST requests (direct callback from SSLCommerz), return JSON
  //     if (req.method === "POST") {
  //       return res.json({
  //         success: true,
  //         message: "Payment verified successfully",
  //         orderId,
  //         transactionId: tran_id,
  //       });
  //     }

  //     // For GET requests (user redirect), redirect to frontend
  //     const frontendUrl = `${
  //       process.env.FRONTEND_URL
  //     }/payment-result?payment=success&orderId=${orderId}&transactionId=${tran_id}&amount=${
  //       amount || paymentData.amount
  //     }`;
  //     console.log("Redirecting to:", frontendUrl);

  //     res.redirect(frontendUrl);
  //   } catch (error) {
  //     console.error("Payment success handling error:", error);

  //     if (req.method === "POST") {
  //       return res.status(500).json({
  //         error: error.message,
  //         debug: {
  //           body: req.body,
  //           query: req.query,
  //         },
  //       });
  //     }

  //     res.redirect(
  //       `${process.env.FRONTEND_URL}/payment-result?payment=failed&orderId=${
  //         req.params.orderId
  //       }&error=${encodeURIComponent(error.message)}`
  //     );
  //   }
  // },

  // Handle failed payment
  handleFailure: async (req, res) => {
    try {
      const { orderId } = req.params;
      const tran_id = req.body.tran_id || req.query.tran_id;
      const error = req.body.error || req.query.error;

      console.log(
        "Payment failure - Order ID:",
        orderId,
        "Transaction ID:",
        tran_id
      );

      if (tran_id) {
        await PaymentModel.updatePaymentStatus(tran_id, "failed");
      }

      const errorMessage = error || "Payment failed due to unknown reason";
      res.redirect(
        `${
          process.env.FRONTEND_URL
        }/payment-result?payment=failed&orderId=${orderId}&error=${encodeURIComponent(
          errorMessage
        )}`
      );
    } catch (error) {
      console.error("Payment failure handling error:", error);
      res.redirect(
        `${
          process.env.FRONTEND_URL
        }/payment-result?payment=failed&error=${encodeURIComponent(
          error.message
        )}`
      );
    }
  },

  handleCancel: async (req, res) => {
    try {
      const { orderId } = req.params;
      const tran_id = req.body.tran_id || req.query.tran_id;

      console.log(
        "Payment cancelled - Order ID:",
        orderId,
        "Transaction ID:",
        tran_id
      );

      if (tran_id) {
        await PaymentModel.updatePaymentStatus(tran_id, "cancelled");
      }

      res.redirect(
        `${process.env.FRONTEND_URL}/payment-result?payment=cancelled&orderId=${orderId}`
      );
    } catch (error) {
      console.error("Payment cancellation handling error:", error);
      res.redirect(
        `${process.env.FRONTEND_URL}/payment-result?payment=cancelled&orderId=${orderId}`
      );
    }
  },

  // IPN handler
  handleIPN: async (req, res) => {
    try {
      console.log("IPN received:", req.body);

      const { tran_id, val_id, status, amount } = req.body;

      if (status !== "VALID") {
        console.log("Invalid IPN status:", status);
        return res.status(400).json({ error: "Invalid transaction status" });
      }

      // Verify payment
      const verifyUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`;

      const verifyResponse = await axios.get(verifyUrl);

      if (verifyResponse.data.status !== "VALID") {
        console.log("IPN verification failed:", verifyResponse.data);
        return res.status(400).json({ error: "Payment verification failed" });
      }

      // Update payment status
      await PaymentModel.updatePaymentStatus(tran_id, "completed", val_id);

      console.log("IPN processed successfully for transaction:", tran_id);
      res.json({ success: true, message: "IPN processed successfully" });
    } catch (error) {
      console.error("IPN handling error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  getPaymentHistory: async (req, res) => {
    try {
      const { senderEmail } = req.params;
      const payments = await PaymentModel.getPaymentsBySender(senderEmail);
      res.status(200).json(payments);
    } catch (error) {
      console.error("Get payment history error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  getEarnings: async (req, res) => {
    try {
      const { travelerEmail } = req.params;
      const payments = await PaymentModel.getPaymentsByTraveler(travelerEmail);

      const totalEarnings = payments.reduce((sum, payment) => {
        return sum + parseFloat(payment.amount);
      }, 0);

      res.status(200).json({
        payments,
        totalEarnings,
      });
    } catch (error) {
      console.error("Get earnings error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  getAllPayments: async (req, res) => {
    try {
      const payments = await PaymentModel.getAllPayments();

      const enrichedPayments = await Promise.all(
        payments.map(async (payment) => {
          const bid = await BidModel.getBidsByPost(payment.orderId);
          const traveler = await UserModel.getUserByEmail(
            payment.travelerEmail
          );
          const sender = await UserModel.getUserByEmail(payment.senderEmail);

          return {
            ...payment,
            bidDetails: bid,
            travelerName: traveler ? traveler.name : "Unknown",
            senderName: sender ? sender.name : "Unknown",
          };
        })
      );

      res.status(200).json(enrichedPayments);
    } catch (error) {
      console.error("Get all payments error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  createPayment: async (req, res) => {
    try {
      const paymentData = req.body;
      const result = await PaymentModel.createPayment(paymentData);
      res.status(201).send(result);
    } catch (error) {
      console.error("Create payment error:", error);
      res.status(500).send({ error: error.message });
    }
  },
};

module.exports = paymentController;
