const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} = require("../controllers/authController");

const protect = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

// =========================
// PUBLIC ROUTES
// =========================

// Register
router.post(
  "/register",
  registerUser
);

// Login
router.post(
  "/login",
  loginUser
);


// =========================
// PROTECTED ROUTES
// =========================

// Get current logged-in user
router.get(
  "/me",
  protect,
  getMe
);

// Update current user's profile
router.put(
  "/profile",
  protect,
  updateProfile
);


module.exports = router;