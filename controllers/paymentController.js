const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const { db } = require("../config/firebaseAdmin");

/* ================= CREATE ORDER ================= */

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount"
      });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    console.log("✅ ORDER CREATED:", order.id);

    res.json(order);

  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error);

    res.status(500).json({
      error: "Order creation failed",
      details: error.message
    });
  }
};

/* ================= VERIFY PAYMENT ================= */

exports.verifyPayment = async (req, res) => {
  try {
    console.log("🔥 VERIFY API CALLED");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user,
      items,
      total
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {

      console.log("✅ PAYMENT VERIFIED");

      // ✅ SAVE ORDER TO FIREBASE
      const orderData = {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        user: user || {},
        items: items || [],
        total: total || 0,
        status: "paid",
        createdAt: new Date()
      };

      await db.collection("orders").add(orderData);

      console.log("✅ ORDER SAVED TO FIREBASE");

      return res.json({
        success: true,
        message: "Payment verified & order saved"
      });

    } else {

      console.log("❌ SIGNATURE MISMATCH");

      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

  } catch (error) {

    console.error("❌ VERIFY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during verification"
    });
  }
};