const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  createRazorpayOrder,
  verifyRazorpayPayment,
  cancelMyOrder,
} = require("../controllers/OrderController");

const protect = require(
  "../middleware/authMiddleware"
);

const router =
  express.Router();

// =========================================================
// NORMAL ORDER ROUTES
// =========================================================

// Create normal COD order
router.post(
  "/",
  protect,
  createOrder
);

// Get logged-in user's orders
router.get(
  "/my-orders",
  protect,
  getMyOrders
);

// =========================================================
// CANCEL ORDER
// =========================================================

// Cancel user's own order
router.put(
  "/:orderId/cancel",
  protect,
  cancelMyOrder
);

// =========================================================
// RAZORPAY ROUTES
// =========================================================

// Create Razorpay payment order
router.post(
  "/payment/create",
  protect,
  createRazorpayOrder
);

// Verify Razorpay payment
router.post(
  "/payment/verify",
  protect,
  verifyRazorpayPayment
);

// =========================================================
// SINGLE ORDER
// =========================================================

// Get single order
// Keep this AFTER specific routes like /payment/*
// and /:orderId/cancel.
router.get(
  "/:orderId",
  protect,
  getOrderById
);

module.exports = router;