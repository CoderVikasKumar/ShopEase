const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// =========================================================
// LOAD ENVIRONMENT VARIABLES
// =========================================================

dotenv.config();

// =========================================================
// DATABASE
// =========================================================

const connectDB = require("./config/db");

// =========================================================
// ROUTES
// =========================================================

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/OrderRoutes");

const adminOrderRoutes = require("./routes/AdminOrderRoutes");
const adminUserRoutes = require("./routes/AdminUserRoutes");
const adminProductRoutes = require("./routes/AdminProductRoutes");

const productRoutes = require("./routes/ProductRoutes");

// =========================================================
// APP
// =========================================================

const app = express();

// =========================================================
// PORT
// =========================================================

const PORT = process.env.PORT || 5000;

// =========================================================
// CORS
// =========================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://shopease-1-mp0w.onrender.com",
    ],
    credentials: true,
  })
);

// =========================================================
// BODY PARSER
// =========================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =========================================================
// DATABASE CONNECTION
// =========================================================

connectDB();

// =========================================================
// PUBLIC AUTH ROUTES
// =========================================================

app.use(
  "/api/auth",
  authRoutes
);

// =========================================================
// PUBLIC ORDER ROUTES
// =========================================================

app.use(
  "/api/orders",
  orderRoutes
);

// =========================================================
// PUBLIC PRODUCT ROUTES
// =========================================================

app.use(
  "/api/products",
  productRoutes
);

// =========================================================
// ADMIN ORDER ROUTES
// =========================================================

app.use(
  "/api/admin",
  adminOrderRoutes
);

// =========================================================
// ADMIN USER ROUTES
// =========================================================

app.use(
  "/api/admin",
  adminUserRoutes
);

// =========================================================
// ADMIN PRODUCT ROUTES
// =========================================================

app.use(
  "/api/admin",
  adminProductRoutes
);

// =========================================================
// RAZORPAY ENV CHECK
// =========================================================

console.log(
  "Razorpay Key ID:",
  process.env.RAZORPAY_KEY_ID
    ? "LOADED ✅"
    : "NOT LOADED ❌"
);

console.log(
  "Razorpay Secret:",
  process.env.RAZORPAY_KEY_SECRET
    ? "LOADED ✅"
    : "NOT LOADED ❌"
);

console.log(
  "Razorpay Currency:",
  process.env.RAZORPAY_CURRENCY || "INR"
);

// =========================================================
// ROOT TEST ROUTE
// =========================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopEase Backend API is running 🚀",
    port: PORT,
  });
});

// =========================================================
// API HEALTH
// =========================================================

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "API is healthy ✅",

      database:
        "MongoDB connected",

      razorpay:
        process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET
          ? "Configured ✅"
          : "Not configured ❌",

      timestamp:
        new Date().toISOString(),
    });
  }
);

// =========================================================
// AUTH TEST
// =========================================================

app.get(
  "/api/auth",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "Auth API is working ✅",
    });
  }
);

// =========================================================
// ORDER API TEST
// =========================================================

app.get(
  "/api/orders",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "Order API is working ✅",
    });
  }
);

// =========================================================
// PUBLIC PRODUCT API TEST
// =========================================================

app.get(
  "/api/products/test",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "Public Product API is working ✅",
    });
  }
);

// =========================================================
// ADMIN API TEST
// =========================================================

app.get(
  "/api/admin",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "Admin API is working ✅",
    });
  }
);

// =========================================================
// ADMIN PRODUCT API TEST
// =========================================================

app.get(
  "/api/admin/products/test",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "Admin Product API is working ✅",
    });
  }
);

// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,

    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =========================================================
// ERROR HANDLER
// =========================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "Server Error:",
      err
    );

    res.status(500).json({
      success: false,

      message:
        "Internal server error",
    });
  }
);

// =========================================================
// START SERVER
// =========================================================

app.listen(
  PORT,
  () => {
    console.log("");

    console.log(
      "================================"
    );

    console.log(
      "      ShopEase Backend Server"
    );

    console.log(
      "================================"
    );

    console.log(
      `Server running on port: ${PORT}`
    );

    console.log(
      `Health: /api/health`
    );

    console.log(
      `Auth: /api/auth`
    );

    console.log(
      `Orders: /api/orders`
    );

    console.log(
      `Products: /api/products`
    );

    console.log(
      `Admin: /api/admin`
    );

    console.log(
      `Admin Users: /api/admin/users`
    );

    console.log(
      `Admin Products: /api/admin/products`
    );

    console.log(
      "================================"
    );

    console.log("");
  }
);
