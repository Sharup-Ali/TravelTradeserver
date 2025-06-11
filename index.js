const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require('body-parser');

const userRoutes = require("./routes/userRoutes");
const travelPostRoutes = require("./routes/travelPostRoutes");
const bidsRoutes = require("./routes/bidRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const parcelPickupRoutes = require("./routes/parcelPickupRoutes");

const { connectToDatabase } = require("./config/db");

const app = express();
const port = process.env.PORT || 9000;

// Middleware
const corsOptions = {
  origin: ["http://localhost:5173"],
  credential: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to database
connectToDatabase().catch(console.error);

// Routes
app.use("/", userRoutes);
app.use("/", travelPostRoutes);
app.use("/", bidsRoutes);
app.use("/", paymentRoutes);
app.use("/", parcelPickupRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Hello from TravelTrade Server...");
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
