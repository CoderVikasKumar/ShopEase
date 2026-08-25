const express = require("express");

const {
  getAllOrders,
  updateOrderStatus,
} = require(
  "../controllers/AdminOrderController"
);

const protect = require(
  "../middleware/authMiddleware"
);

const adminMiddleware = require(
  "../middleware/adminMiddleware"
);

const router = express.Router();

// =========================
// GET ALL ORDERS
// =========================

router.get(
  "/orders",
  protect,
  adminMiddleware,
  getAllOrders
);

// =========================
// UPDATE ORDER STATUS
// =========================

router.put(
  "/orders/:orderId/status",
  protect,
  adminMiddleware,
  updateOrderStatus
);

module.exports = router;