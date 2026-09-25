const User = require("../models/User");
const bcrypt = require("bcryptjs");

// =========================================================
// GET ALL USERS
// =========================================================

const getAllUsers = async (
  req,
  res
) => {
  try {
    const users =
      await User.find()
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,

      count:
        users.length,

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

// =========================================================
// UPDATE USER ROLE
// =========================================================

const updateUserRole = async (
  req,
  res
) => {
  try {
    const { role } =
      req.body;

    // -------------------------------------------------------
    // VALIDATE ROLE
    // -------------------------------------------------------

    if (
      !["user", "admin"].includes(
        role
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid role. Use user or admin.",
      });
    }

    // -------------------------------------------------------
    // FIND USER
    // -------------------------------------------------------

    const user =
      await User.findById(
        req.params.userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "User not found.",
      });
    }

    // -------------------------------------------------------
    // PREVENT SELF DEMOTION
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // UPDATE ROLE
    // -------------------------------------------------------

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

        createdAt:
          user.createdAt,
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

// =========================================================
// RESET USER PASSWORD
// =========================================================
// Admin can set a NEW password.
// The old password is NEVER returned.
// =========================================================

const resetUserPassword =
  async (
    req,
    res
  ) => {
    try {
      const {
        password,
      } = req.body;

      const userId =
        String(
          req.params.userId ||
            ""
        ).trim();

      // -----------------------------------------------------
      // VALIDATE USER ID
      // -----------------------------------------------------

      if (!userId) {
        return res.status(400).json({
          success: false,

          message:
            "User ID is required.",
        });
      }

      // -----------------------------------------------------
      // VALIDATE PASSWORD
      // -----------------------------------------------------

      if (
        typeof password !==
          "string" ||
        !password.trim()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "New password is required.",
        });
      }

      const newPassword =
        password.trim();

      // Keep password policy simple and practical.
      if (
        newPassword.length < 6
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Password must be at least 6 characters.",
        });
      }

      if (
        newPassword.length > 100
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Password is too long.",
        });
      }

      // -----------------------------------------------------
      // FIND USER
      // -----------------------------------------------------

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          success: false,

          message:
            "User not found.",
        });
      }

      // -----------------------------------------------------
      // HASH NEW PASSWORD
      // -----------------------------------------------------
      //
      // We hash before updating the database.
      // This update intentionally avoids user.save()
      // so a possible pre-save password hook does not
      // accidentally hash the already-hashed password twice.
      //
      // -----------------------------------------------------

      const saltRounds = 12;

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          saltRounds
        );

      // -----------------------------------------------------
      // UPDATE PASSWORD
      // -----------------------------------------------------

      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            password:
              hashedPassword,
          },
        }
      );

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      return res.status(200).json({
        success: true,

        message:
          "User password reset successfully.",

        user: {
          id: user._id,

          name: user.name,

          email: user.email,

          phone: user.phone,

          city: user.city,

          role: user.role,

          createdAt:
            user.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "Reset user password error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to reset user password.",
      });
    }
  };

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getAllUsers,
  updateUserRole,
  resetUserPassword,
};