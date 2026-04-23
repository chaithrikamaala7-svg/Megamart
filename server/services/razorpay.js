const crypto = require("crypto");
const Razorpay = require("razorpay");

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

const ensureConfig = () => {
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
};

const createOrder = async (amountInRupees) => {
  ensureConfig();
  const amount = Math.round(Number(amountInRupees) * 100);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid amount for payment order");
  }

  const options = {
    amount,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    payment_capture: 1,
  };

  return razorpay.orders.create(options);
};

const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  ensureConfig();
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto.createHmac("sha256", keySecret).update(body.toString()).digest("hex");

  return expectedSignature === razorpaySignature;
};

const fetchPayment = async (paymentId) => {
  ensureConfig();
  if (!paymentId) {
    throw new Error("Payment ID is required");
  }
  return razorpay.payments.fetch(paymentId);
};

const getPublicKey = () => keyId;

module.exports = {
  createOrder,
  verifyPayment,
  fetchPayment,
  getPublicKey,
};
