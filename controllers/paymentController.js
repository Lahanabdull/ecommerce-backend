const razorpay = require("../config/razorpay");
const crypto = require("crypto");

/* ================= CREATE ORDER ================= */

exports.createOrder = async (req, res) => {

  try {

    const { amount } = req.body;

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Order creation failed" });

  }

};


/* ================= VERIFY PAYMENT ================= */

exports.verifyPayment = (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {

    res.json({
      success: true,
      message: "Payment verified successfully"
    });

  } else {

    res.status(400).json({
      success: false,
      message: "Payment verification failed"
    });

  }

};
