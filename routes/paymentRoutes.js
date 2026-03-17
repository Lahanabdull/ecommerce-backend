const express = require("express");
const router = express.Router();

const { createOrder, verifyPayment } = require("../controllers/paymentController");

/* CREATE ORDER */

router.post("/create-order", createOrder);

/* VERIFY PAYMENT */

router.post("/verify", verifyPayment);

module.exports = router;
