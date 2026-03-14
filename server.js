const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ================= CORS CONFIGURATION ================= */

app.use(
  cors({
    origin: [
      "https://markandluth.web.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

/* ================= MIDDLEWARE ================= */

app.use(express.json());

/* ================= ROUTES ================= */

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

/* ================= HEALTH CHECK ================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server running"
  });
});

/* ================= ROOT TEST ================= */

app.get("/", (req, res) => {
  res.send("API Running...");
});

/* ================= DATABASE ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err);
  });

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
