const Product = require("../models/Product");

// =========================
// GET ALL ACTIVE PRODUCTS
// =========================

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load products.",
    });
  }
};

// =========================
// GET SINGLE PRODUCT
// =========================

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get product by id error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load product.",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
};