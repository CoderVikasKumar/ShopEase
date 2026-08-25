const Product = require("../models/Product");

// =========================
// GET ALL PRODUCTS
// =========================

const getAllProducts = async (
  req,
  res
) => {
  try {
    const products =
      await Product.find()
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
      message:
        "Unable to load products.",
    });
  }
};


// =========================
// CREATE PRODUCT
// =========================

const createProduct = async (
  req,
  res
) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      brand,
      stock,
      rating,
      reviews,
      featured,
      isActive,
    } = req.body;

    if (
      !name ||
      price === undefined ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, price and category are required.",
      });
    }

    const product =
      await Product.create({
        name: name.trim(),

        description:
          description || "",

        price: Number(price),

        originalPrice:
          Number(
            originalPrice || 0
          ),

        image:
          image || "",

        category:
          category.trim(),

        brand:
          brand || "",

        stock:
          Number(stock || 0),

        rating:
          Number(rating || 0),

        reviews:
          Number(reviews || 0),

        featured:
          Boolean(featured),

        isActive:
          isActive !== false,
      });

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully.",

      product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create product.",
    });
  }
};


// =========================
// UPDATE PRODUCT
// =========================

const updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.productId
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    const fields = [
      "name",
      "description",
      "price",
      "originalPrice",
      "image",
      "category",
      "brand",
      "stock",
      "rating",
      "reviews",
      "featured",
      "isActive",
    ];

    fields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        product[field] =
          req.body[field];
      }
    });

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully.",

      product,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update product.",
    });
  }
};


// =========================
// DELETE PRODUCT
// =========================

const deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findByIdAndDelete(
        req.params.productId
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete product.",
    });
  }
};


module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};