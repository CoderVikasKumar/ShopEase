import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [selectedSize, setSelectedSize] =
    useState("Default");

  const [selectedColor, setSelectedColor] =
    useState("Default");

  const [added, setAdded] =
    useState(false);

  // =========================
  // LOAD PRODUCT FROM MONGODB
  // =========================

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      if (!id) {
        if (mounted) {
          setError("Product ID is missing.");
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https:///api/products/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load product."
          );
        }

        const dbProduct = data?.product;

        if (!dbProduct) {
          throw new Error(
            "Product not found."
          );
        }

        // =========================
        // ALWAYS USE MONGODB _id
        // =========================

        const mongoId = String(
          dbProduct._id
        );

        const price = Number(
          dbProduct.price || 0
        );

        const oldPrice = Number(
          dbProduct.originalPrice || 0
        );

        const discount =
          oldPrice > price
            ? Math.round(
                ((oldPrice - price) /
                  oldPrice) *
                  100
              )
            : 0;

        const sizes =
          Array.isArray(
            dbProduct.sizes
          ) &&
          dbProduct.sizes.length > 0
            ? dbProduct.sizes.map(
                (size) => String(size)
              )
            : ["Default"];

        const colors =
          Array.isArray(
            dbProduct.colors
          ) &&
          dbProduct.colors.length > 0
            ? dbProduct.colors.map(
                (color) =>
                  String(color)
              )
            : ["Default"];

        const normalizedProduct = {
          id: mongoId,

          name:
            dbProduct.name ||
            "Product",

          description:
            dbProduct.description ||
            "",

          category:
            dbProduct.category ||
            "Other",

          brand:
            dbProduct.brand ||
            "ShopEase",

          price,

          oldPrice,

          discount,

          rating:
            Number(
              dbProduct.rating || 0
            ),

          reviews:
            Number(
              dbProduct.reviews || 0
            ),

          image:
            dbProduct.image || "",

          stock:
            Number(
              dbProduct.stock || 0
            ),

          sizes,

          colors,

          featured:
            Boolean(
              dbProduct.featured
            ),

          isActive:
            dbProduct.isActive !==
            false,
        };

        if (mounted) {
          setProduct(
            normalizedProduct
          );

          setSelectedImage(
            normalizedProduct.image
          );

          setQuantity(1);

          setSelectedSize(
            normalizedProduct.sizes[0] ||
              "Default"
          );

          setSelectedColor(
            normalizedProduct.colors[0] ||
              "Default"
          );
        }
      } catch (err) {
        console.error(
          "Product details error:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Unable to load product."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  // =========================
  // QUANTITY
  // =========================

  const increaseQuantity = () => {
    if (!product) {
      return;
    }

    if (
      Number(product.stock || 0) <= 0
    ) {
      return;
    }

    setQuantity((prev) =>
      Math.min(
        prev + 1,
        Number(product.stock)
      )
    );
  };

  const decreaseQuantity = () => {
    setQuantity((prev) =>
      prev > 1 ? prev - 1 : 1
    );
  };

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = () => {
    console.log(
      "PRODUCT DETAILS ADD TO CART CLICKED"
    );

    if (!product) {
      console.error(
        "Product is not loaded."
      );

      return;
    }

    const productId = String(
      product.id || ""
    ).trim();

    console.log(
      "MONGODB PRODUCT ID:",
      productId
    );

    if (!productId) {
      console.error(
        "Missing MongoDB product ID."
      );

      setError(
        "Product ID is missing."
      );

      return;
    }

    const stock = Number(
      product.stock || 0
    );

    if (stock <= 0) {
      setError(
        "This product is out of stock."
      );

      return;
    }

    if (
      quantity < 1 ||
      quantity > stock
    ) {
      alert(
        `Only ${stock} item(s) available.`
      );

      return;
    }

    // =========================
    // IMPORTANT
    // REAL MONGODB ID
    // =========================

    const cartProduct = {
      id: productId,

      name:
        product.name,

      price:
        Number(
          product.price || 0
        ),

      image:
        product.image || "",

      size:
        selectedSize ||
        "Default",

      color:
        selectedColor ||
        "Default",

      category:
        product.category ||
        "Other",

      brand:
        product.brand ||
        "ShopEase",

      stock,
    };

    console.log(
      "PRODUCT DETAILS ADD TO CART:",
      cartProduct
    );

    addToCart(
      cartProduct,
      quantity
    );

    setAdded(true);
    setError("");

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  // =========================
  // WISHLIST
  // =========================

  const handleWishlist = () => {
    if (!product) {
      return;
    }

    toggleWishlist({
      id: String(
        product.id
      ),

      name:
        product.name,

      price:
        Number(
          product.price || 0
        ),

      oldPrice:
        Number(
          product.oldPrice || 0
        ),

      image:
        product.image || "",

      category:
        product.category ||
        "Other",

      brand:
        product.brand ||
        "ShopEase",

      rating:
        Number(
          product.rating || 0
        ),

      reviews:
        Number(
          product.reviews || 0
        ),

      stock:
        Number(
          product.stock || 0
        ),
    });
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-loading">

          <i className="bi bi-arrow-repeat"></i>

          <h2>
            Loading Product
          </h2>

          <p>
            Please wait while we load
            the product details.
          </p>

        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-error">

          <i className="bi bi-box-seam"></i>

          <h2>
            Product Not Found
          </h2>

          <p>
            {error ||
              "This product is no longer available."}
          </p>

          <Link
            to="/products"
            className="back-products-btn"
          >
            <i className="bi bi-arrow-left"></i>
            Back to Products
          </Link>

        </div>
      </main>
    );
  }

  // =========================
  // DERIVED STATE
  // =========================

  const inWishlist =
    isInWishlist(
      product.id
    );

  const stock = Number(
    product.stock || 0
  );

  const outOfStock =
    stock <= 0;

  return (
    <main className="product-details-page">

      {/* =========================
          BACK + BREADCRUMB
      ========================= */}

      <div className="product-back-row">

        <button
          type="button"
          className="back-products-btn"
          onClick={() =>
            navigate("/products")
          }
        >
          <i className="bi bi-arrow-left"></i>
          Back to Products
        </button>

        <div className="breadcrumb">

          <Link to="/">
            Home
          </Link>

          <i className="bi bi-chevron-right"></i>

          <Link to="/products">
            Products
          </Link>

          <i className="bi bi-chevron-right"></i>

          <span>
            {product.name}
          </span>

        </div>

      </div>

      {/* =========================
          PRODUCT DETAILS
      ========================= */}

      <section className="product-details-container">

        {/* =========================
            GALLERY
        ========================= */}

        <div className="product-gallery">

          <div className="thumbnail-list">

            {product.image && (
              <button
                type="button"
                className={`thumbnail ${
                  selectedImage ===
                  product.image
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedImage(
                    product.image
                  )
                }
              >
                <img
                  src={
                    product.image
                  }
                  alt={
                    product.name
                  }
                  onError={(e) => {
                    e.currentTarget.onerror =
                      null;

                    e.currentTarget.src =
                      "https://via.placeholder.com/120x120?text=Product";
                  }}
                />
              </button>
            )}

          </div>

          <div className="main-product-image">

            {product.discount >
              0 && (
              <span className="details-discount">
                {product.discount}% OFF
              </span>
            )}

            <button
              type="button"
              className={`details-wishlist ${
                inWishlist
                  ? "active"
                  : ""
              }`}
              aria-label={
                inWishlist
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              onClick={
                handleWishlist
              }
            >
              <i
                className={
                  inWishlist
                    ? "bi bi-heart-fill"
                    : "bi bi-heart"
                }
              ></i>
            </button>

            {selectedImage ? (
              <img
                src={
                  selectedImage
                }
                alt={
                  product.name
                }
                onError={(e) => {
                  e.currentTarget.onerror =
                    null;

                  e.currentTarget.src =
                    "https://via.placeholder.com/700x700?text=Product";
                }}
              />
            ) : (
              <div className="product-detail-image-fallback">
                Product Image
              </div>
            )}

          </div>

        </div>

        {/* =========================
            PRODUCT INFO
        ========================= */}

        <div className="product-details-info">

          <span className="details-category">
            {product.category}
          </span>

          <h1>
            {product.name}
          </h1>

          {/* RATING */}

          <div className="details-rating">

            <span>
              <i className="bi bi-star-fill"></i>
              {" "}
              {Number(
                product.rating || 0
              ).toFixed(1)}
            </span>

            <span className="rating-divider">
              |
            </span>

            <span>
              {product.reviews} Reviews
            </span>

          </div>

          {/* PRICE */}

          <div className="details-price">

            <strong>
              $
              {Number(
                product.price || 0
              ).toFixed(2)}
            </strong>

            {Number(
              product.oldPrice || 0
            ) >
              Number(
                product.price || 0
              ) && (
              <del>
                $
                {Number(
                  product.oldPrice || 0
                ).toFixed(2)}
              </del>
            )}

            {Number(
              product.oldPrice || 0
            ) >
              Number(
                product.price || 0
              ) && (
              <span>
                Save $
                {(
                  Number(
                    product.oldPrice || 0
                  ) -
                  Number(
                    product.price || 0
                  )
                ).toFixed(2)}
              </span>
            )}

          </div>

          {/* DESCRIPTION */}

          <p className="details-description">
            {product.description ||
              "No product description available."}
          </p>

          {/* BRAND */}

          <div className="product-option">

            <div className="option-heading">

              <strong>
                Brand
              </strong>

              <span>
                {product.brand}
              </span>

            </div>

          </div>

          {/* SIZE */}

          <div className="product-option">

            <div className="option-heading">

              <strong>
                Size
              </strong>

              <span>
                Selected:{" "}
                {selectedSize}
              </span>

            </div>

            <div className="size-options">

              {product.sizes.map(
                (size) => (
                  <button
                    type="button"
                    key={size}
                    className={
                      selectedSize ===
                      size
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setSelectedSize(
                        size
                      )
                    }
                  >
                    {size}
                  </button>
                )
              )}

            </div>

          </div>

          {/* COLOR */}

          <div className="product-option">

            <div className="option-heading">

              <strong>
                Color
              </strong>

              <span>
                Selected:{" "}
                {selectedColor}
              </span>

            </div>

            <div className="color-options">

              {product.colors.map(
                (color) => (
                  <button
                    type="button"
                    key={color}
                    className={`color-option ${
                      selectedColor ===
                      color
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedColor(
                        color
                      )
                    }
                  >
                    {color}
                  </button>
                )
              )}

            </div>

          </div>

          {/* STOCK */}

          <div className="product-option">

            <div className="option-heading">

              <strong>
                Availability
              </strong>

              <span
                style={{
                  color:
                    stock > 0
                      ? "#237145"
                      : "#c33b42",
                  fontWeight: 700,
                }}
              >
                {stock > 0
                  ? `${stock} in stock`
                  : "Out of stock"}
              </span>

            </div>

          </div>

          {/* QUANTITY */}

          <div className="quantity-section">

            <span>
              Quantity
            </span>

            <div className="quantity-control">

              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  quantity <= 1
                }
              >
                -
              </button>

              <span>
                {quantity}
              </span>

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
                disabled={
                  outOfStock ||
                  quantity >= stock
                }
              >
                +
              </button>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="details-buttons">

            <button
              type="button"
              className={`details-cart-btn ${
                added
                  ? "cart-added"
                  : ""
              }`}
              onClick={
                handleAddToCart
              }
              disabled={false}
            >

              <i
                className={
                  added
                    ? "bi bi-check-lg"
                    : "bi bi-cart-plus"
                }
              ></i>

              {added
                ? "Added to Cart"
                : outOfStock
                ? "Out of Stock"
                : "Add to Cart"}

            </button>

            <Link
              to="/cart"
              className="details-buy-btn"
            >
              Go to Cart

              <i className="bi bi-arrow-right"></i>
            </Link>

          </div>

          {/* EXTRA INFO */}

          <div className="details-extra-info">

            <div>

              <i className="bi bi-truck"></i>

              <span>
                <strong>
                  Free Shipping
                </strong>

                Delivery on orders
                over $75
              </span>

            </div>

            <div>

              <i className="bi bi-shield-check"></i>

              <span>
                <strong>
                  Secure Payment
                </strong>

                Safe and secure checkout
              </span>

            </div>

            <div>

              <i className="bi bi-arrow-repeat"></i>

              <span>
                <strong>
                  Easy Returns
                </strong>

                30-day hassle-free returns
              </span>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default ProductDetails;