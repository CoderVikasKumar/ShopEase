const User = require("../models/User");

// =========================
// GET ALL USERS
// =========================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get all users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load users.",
    });
  }
};


// =========================
// UPDATE USER ROLE
// =========================

const updateUserRole = async (
  req,
  res
) => {
  try {
    const { role } = req.body;

    // Only these roles are allowed
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Use user or admin.",
      });
    }

    // Find target user
    const user = await User.findById(
      req.params.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    // Prevent admin from removing
    // their own admin access
    if (
      String(user._id) ===
        String(req.user._id) &&
      role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot remove your own admin access.",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "User role updated successfully.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Update user role error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update user role.",
    });
  }
};


module.exports = {
  getAllUsers,
  updateUserRole,
};