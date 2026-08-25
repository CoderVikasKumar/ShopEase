import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

// =========================================================
// VALID MONGODB OBJECT ID
// =========================================================

const isValidMongoId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(
    String(id || "").trim()
  );
};

// =========================================================
// PRODUCT CARD
// =========================================================

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const [added, setAdded] =
    useState(false);

  const [resolvedProduct, setResolvedProduct] =
    useState(product || null);

  const [loadingProduct, setLoadingProduct] =
    useState(false);

  // =======================================================
  // RESOLVE PRODUCT FROM MONGODB
  // =======================================================

  useEffect(() => {
    let mounted = true;

    const resolveProduct = async () => {
      if (!product) {
        return;
      }

      const propId = String(
        product?._id ||
        product?.id ||
        ""
      ).trim();

      // Already valid and has stock
      if (
        isValidMongoId(propId) &&
        product.stock !== undefined
      ) {
        if (mounted) {
          setResolvedProduct({
            ...product,
            id: propId,
          });
        }

        return;
      }

      try {
        setLoadingProduct(true);

        const response =
          await fetch(
            "http://localhost:5000/api/products"
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to resolve product."
          );
        }

        const products =
          Array.isArray(
            data.products
          )
            ? data.products
            : [];

        // =================================================
        // FIND REAL PRODUCT
        // =================================================

        let realProduct = null;

        // 1. Try MongoDB ID
        if (
          isValidMongoId(propId)
        ) {
          realProduct =
            products.find(
              (item) =>
                String(
                  item._id
                ) === propId
            );
        }

        // 2. Try product name
        if (!realProduct) {
          realProduct =
            products.find(
              (item) =>
                String(
                  item.name || ""
                ).trim()
                  .toLowerCase() ===
                String(
                  product.name || ""
                ).trim()
                  .toLowerCase()
            );
        }

        if (!realProduct) {
          console.error(
            "MongoDB product not found:",
            product
          );

          return;
        }

        const normalized = {
          ...realProduct,

          id: String(
            realProduct._id
          ),

          price:
            Number(
              realProduct.price || 0
            ),

          originalPrice:
            Number(
              realProduct.originalPrice ||
                0
            ),

          oldPrice:
            Number(
              realProduct.originalPrice ||
                0
            ),

          stock:
            Number(
              realProduct.stock || 0
            ),

          rating:
            Number(
              realProduct.rating || 0
            ),

          reviews:
            Number(
              realProduct.reviews || 0
            ),

          image:
            realProduct.image || "",

          category:
            realProduct.category ||
            "Other",

          brand:
            realProduct.brand ||
            "ShopEase",
        };

        if (mounted) {
          setResolvedProduct(
            normalized
          );
        }
      } catch (error) {
        console.error(
          "Product resolve error:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingProduct(false);
        }
      }
    };

    resolveProduct();

    return () => {
      mounted = false;
    };
  }, [product]);

  // =======================================================
  // FINAL PRODUCT
  // =======================================================

  const finalProduct =
    resolvedProduct || product;

  const productId =
    String(
      finalProduct?._id ||
        finalProduct?.id ||
        ""
    ).trim();

  const validProductId =
    isValidMongoId(
      productId
    );

  const stock =
    Number(
      finalProduct?.stock ?? 0
    );

  const price =
    Number(
      finalProduct?.price || 0
    );

  const oldPrice =
    Number(
      finalProduct?.oldPrice ??
        finalProduct?.originalPrice ??
        0
    );

  const rating =
    Number(
      finalProduct?.rating || 0
    );

  const reviews =
    Number(
      finalProduct?.reviews || 0
    );

  const wishlistActive =
    validProductId
      ? isInWishlist(
          productId
        )
      : false;

  const discount = useMemo(() => {
    if (
      oldPrice > price
    ) {
      return Math.round(
        ((oldPrice - price) /
          oldPrice) *
          100
      );
    }

    return Number(
      finalProduct?.discount || 0
    );
  }, [
    oldPrice,
    price,
    finalProduct,
  ]);

  // =======================================================
  // ADD TO CART
  // =======================================================

  const handleAddToCart = () => {
    console.log(
      "PRODUCT CARD CLICK:",
      {
        id: productId,
        name:
          finalProduct?.name,
        stock,
      }
    );

    if (
      !validProductId
    ) {
      alert(
        "Product ID not available. Please refresh the page."
      );

      return;
    }

    if (stock <= 0) {
      alert(
        "This product is out of stock."
      );

      return;
    }

    const cartProduct = {
      id: productId,

      name:
        finalProduct?.name ||
        "Product",

      price,

      image:
        finalProduct?.image ||
        "",

      size:
        finalProduct?.size ||
        "Default",

      color:
        finalProduct?.color ||
        "Default",

      category:
        finalProduct?.category ||
        "Other",

      brand:
        finalProduct?.brand ||
        "ShopEase",

      stock,
    };

    console.log(
      "FINAL CART PRODUCT:",
      cartProduct
    );

    const result =
      addToCart(
        cartProduct,
        1
      );

    if (
      result === false
    ) {
      return;
    }

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  // =======================================================
  // WISHLIST
  // =======================================================

  const handleWishlist = () => {
    if (
      !validProductId
    ) {
      return;
    }

    toggleWishlist({
      ...finalProduct,

      id: productId,

      name:
        finalProduct?.name ||
        "Product",

      price,

      oldPrice,

      image:
        finalProduct?.image ||
        "",

      category:
        finalProduct?.category ||
        "Other",

      brand:
        finalProduct?.brand ||
        "ShopEase",

      rating,

      reviews,

      stock,
    });
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="product-card">

      {/* =========================
          IMAGE
      ========================= */}

      <div className="product-image-box">

        <Link
          to={
            validProductId
              ? `/product/${productId}`
              : "/products"
          }
        >
          {finalProduct?.image ? (
            <img
              src={
                finalProduct.image
              }
              alt={
                finalProduct?.name ||
                "Product"
              }
              onError={(e) => {
                e.currentTarget.onerror =
                  null;

                e.currentTarget.src =
                  "https://via.placeholder.com/500x500?text=Product";
              }}
            />
          ) : (
            <div className="product-image-fallback">
              Product Image
            </div>
          )}
        </Link>

        {/* DISCOUNT */}

        {discount > 0 && (
          <span className="product-discount">
            {discount}% OFF
          </span>
        )}

        {/* WISHLIST */}

        <button
          type="button"
          className={`wishlist-button ${
            wishlistActive
              ? "wishlist-active"
              : ""
          }`}
          aria-label="Wishlist"
          onClick={
            handleWishlist
          }
        >
          <i
            className={
              wishlistActive
                ? "bi bi-heart-fill"
                : "bi bi-heart"
            }
          ></i>
        </button>

      </div>

      {/* =========================
          INFO
      ========================= */}

      <div className="product-info">

        <span className="product-category">
          {
            finalProduct?.category ||
            "Other"
          }
        </span>

        <h3>
          <Link
            to={
              validProductId
                ? `/product/${productId}`
                : "/products"
            }
          >
            {
              finalProduct?.name ||
              "Product"
            }
          </Link>
        </h3>

        {/* RATING */}

        <div className="product-rating">

          <span>
            <i className="bi bi-star-fill"></i>

            {" "}

            {rating.toFixed(1)}
          </span>

          <small>
            ({reviews})
          </small>

        </div>

        {/* PRICE */}

        <div className="product-price">

          <strong>
            $
            {price.toFixed(2)}
          </strong>

          {oldPrice >
            price && (
            <del>
              $
              {oldPrice.toFixed(
                2
              )}
            </del>
          )}

        </div>

        {/* STOCK */}

        {loadingProduct ? (
          <small
            style={{
              display:
                "block",
              marginBottom:
                "8px",
            }}
          >
            Checking stock...
          </small>
        ) : (
          <small
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              color:
                stock > 0
                  ? "#237145"
                  : "#c33b42",
              fontWeight:
                700,
            }}
          >
            {stock > 0
              ? `${stock} in stock`
              : "Out of Stock"}
          </small>
        )}

        {/* ADD TO CART */}

        <button
          type="button"
          className={`add-cart-btn ${
            added
              ? "added"
              : ""
          }`}
          disabled={
            loadingProduct ||
            !validProductId ||
            stock <= 0
          }
          onClick={
            handleAddToCart
          }
        >
          <i
            className={
              added
                ? "bi bi-check-lg"
                : "bi bi-cart-plus"
            }
          ></i>

          {added
            ? "Added"
            : stock <= 0
            ? "Out of Stock"
            : "Add to Cart"}
        </button>

      </div>

    </div>
  );
}

export default ProductCard;