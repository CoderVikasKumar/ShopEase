const express = require("express");

const {
  getAdminDashboard,
} = require("../controllers/AdminDashboardController");

const protect = require(
  "../middleware/authMiddleware"
);

const adminMiddleware = require(
  "../middleware/adminMiddleware"
);

const router =
  express.Router();

// =========================================================
// ADMIN DASHBOARD
// =========================================================

router.get(
  "/",
  protect,
  adminMiddleware,
  getAdminDashboard
);

module.exports = router;