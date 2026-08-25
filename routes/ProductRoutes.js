const express = require("express");

const {
  getProducts,
  getProductById,
} = require("../controllers/ProductController");

const router = express.Router();

// =========================
// GET ALL ACTIVE PRODUCTS
// =========================

router.get("/", getProducts);

// =========================
// GET SINGLE ACTIVE PRODUCT
// =========================

router.get("/:id", getProductById);

module.exports = router;