import crypto from "crypto";
import Razorpay from "razorpay";
import users from "../auth.js";
import { sendPaymentConfirmationEmail } from "../../utils/mailer.js";


function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const PLAN_PRICES = {
  Bronze: 199,
  Silver: 499,
  Gold: 799,
};

export const createOrder = async (req, res) => {
  const { plan } = req.body;

  if (!PLAN_PRICES[plan]) {
    return res.status(400).json({ message: "Invalid plan selected" });
  }

  const amountInPaise = PLAN_PRICES[plan] * 100;

  try {
   const razorpay = getRazorpayInstance();
const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json({ result: order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    plan,
  } = req.body;

  if (!PLAN_PRICES[plan]) {
    return res.status(400).json({ message: "Invalid plan selected" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  try {
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    user.plan = plan;
    user.planExpiry = expiry;
    user.paymentHistory.push({
      plan,
      amount: PLAN_PRICES[plan],
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    await user.save();

    try {
      await sendPaymentConfirmationEmail({
        to: user.email,
        userName: user.name,
        plan,
        amount: PLAN_PRICES[plan],
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        date: new Date().toLocaleString("en-IN"),
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return res.status(200).json({ result: user });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};