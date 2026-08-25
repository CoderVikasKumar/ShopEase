const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// =========================
// REGISTER USER
// =========================

const registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      city,
    } = req.body;

    // Validation
    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // Check existing account
    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // Create user
    const user =
      await User.create({
        name: name.trim(),

        email: normalizedEmail,

        password:
          hashedPassword,

        phone:
          phone
            ? phone.trim()
            : "",

        city:
          city
            ? city.trim()
            : "",
      });

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully.",

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
      "Register error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating account.",
    });
  }
};


// =========================
// LOGIN USER
// =========================

const loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Validation
    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // Find user
    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // Check password
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // JWT
    const token =
      jwt.sign(
        {
          userId:
            user._id.toString(),
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }
      );

    return res.status(200).json({
      success: true,

      message:
        "Login successful.",

      token,

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
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during login.",
    });
  }
};


// =========================
// GET CURRENT USER
// =========================

const getMe = async (
  req,
  res
) => {
  try {
    return res.status(200).json({
      success: true,

      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone:
          req.user.phone || "",
        city:
          req.user.city || "",
        role:
          req.user.role || "user",
        createdAt:
          req.user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load profile.",
    });
  }
};


// =========================
// UPDATE PROFILE
// =========================

const updateProfile =
  async (
    req,
    res
  ) => {
    try {
      const {
        name,
        email,
        phone,
        city,
      } = req.body;

      // Validation
      if (
        !name ||
        !email
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name and email are required.",
        });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      // Check duplicate email
      const existingUser =
        await User.findOne({
          email:
            normalizedEmail,

          _id: {
            $ne:
              req.user._id,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "This email is already in use.",
        });
      }

      // Find current user
      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      // Update fields
      user.name =
        name.trim();

      user.email =
        normalizedEmail;

      user.phone =
        phone
          ? phone.trim()
          : "";

      user.city =
        city
          ? city.trim()
          : "";

      // Save MongoDB
      await user.save();

      return res.status(200).json({
        success: true,

        message:
          "Profile updated successfully.",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone:
            user.phone || "",
          city:
            user.city || "",
          role:
            user.role || "user",
          createdAt:
            user.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update profile.",
      });
    }
  };


// =========================
// EXPORT
// =========================

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
};