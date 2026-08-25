const express = require("express");

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require(
  "../controllers/AdminProductController"
);

const protect = require(
  "../middleware/authMiddleware"
);

const adminMiddleware = require(
  "../middleware/adminMiddleware"
);

const router = express.Router();


// =========================
// GET ALL PRODUCTS
// =========================

router.get(
  "/products",
  protect,
  adminMiddleware,
  getAllProducts
);


// =========================
// CREATE PRODUCT
// =========================

router.post(
  "/products",
  protect,
  adminMiddleware,
  createProduct
);


// =========================
// UPDATE PRODUCT
// =========================

router.put(
  "/products/:productId",
  protect,
  adminMiddleware,
  updateProduct
);


// =========================
// DELETE PRODUCT
// =========================

router.delete(
  "/products/:productId",
  protect,
  adminMiddleware,
  deleteProduct
);


module.exports = router;