const express = require("express");
const Payment = require("../models/Payment");
const { createOrder, verifyPayment, fetchPayment, getPublicKey } = require("../services/razorpay");

const router = express.Router();

router.get("/public-key", (req, res) => {
  try {
    const key = getPublicKey();
    if (!key) {
      return res.status(500).json({ success: false, error: "Razorpay key is not configured" });
    }
    return res.json({ success: true, key });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    const order = await createOrder(amount);
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {};
    const verified = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!verified) {
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    await Payment.create({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

router.get("/payment/:paymentId", async (req, res) => {
  try {
    const payment = await fetchPayment(req.params.paymentId);
    return res.json({ success: true, payment });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
