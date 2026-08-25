const express = require("express");

const {
  getAllUsers,
  updateUserRole,
} = require(
  "../controllers/AdminUserController"
);

const protect = require(
  "../middleware/authMiddleware"
);

const adminMiddleware = require(
  "../middleware/adminMiddleware"
);

const router = express.Router();


// =========================
// GET ALL USERS
// =========================

router.get(
  "/users",
  protect,
  adminMiddleware,
  getAllUsers
);


// =========================
// UPDATE USER ROLE
// =========================

router.put(
  "/users/:userId/role",
  protect,
  adminMiddleware,
  updateUserRole
);


module.exports = router;