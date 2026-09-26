import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

// =========================================================
// HELPER: VALID MONGODB OBJECT ID
// =========================================================

const isValidMongoId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(
    String(id || "")
  );
};

// =========================================================
// PRODUCTS
// =========================================================

function Products() {
  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  // =========================
  // STATE
  // =========================

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All Categories");

  const [sort, setSort] =
    useState("Sort By");

  const [addedProductId, setAddedProductId] =
    useState(null);

  // =========================
  // LOAD PRODUCTS
  // =========================

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https:///api/products"
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load products."
          );
        }

        const dbProducts =
          Array.isArray(data.products)
            ? data.products
            : [];

        const normalizedProducts =
          dbProducts
            .map((product) => {
              // =========================
              // REAL MONGODB ID
              // =========================

              const mongoId =
                String(
                  product?._id || ""
                ).trim();

              // Ignore invalid MongoDB IDs
              if (
                !isValidMongoId(
                  mongoId
                )
              ) {
                console.warn(
                  "Skipping product with invalid MongoDB ID:",
                  product
                );

                return null;
              }

              const price =
                Number(
                  product.price || 0
                );

              const oldPrice =
                Number(
                  product.originalPrice ||
                    0
                );

              const discount =
                oldPrice > price
                  ? Math.round(
                      ((oldPrice -
                        price) /
                        oldPrice) *
                        100
                    )
                  : 0;

              return {
                id: mongoId,

                name:
                  product.name ||
                  "Product",

                description:
                  product.description ||
                  "",

                category:
                  product.category ||
                  "Other",

                brand:
                  product.brand ||
                  "ShopEase",

                price,

                oldPrice,

                discount,

                rating:
                  Number(
                    product.rating || 0
                  ),

                reviews:
                  Number(
                    product.reviews || 0
                  ),

                image:
                  product.image || "",

                stock:
                  Number(
                    product.stock || 0
                  ),

                featured:
                  Boolean(
                    product.featured
                  ),

                isActive:
                  product.isActive !==
                  false,
              };
            })
            .filter(Boolean);

        if (mounted) {
          setProducts(
            normalizedProducts
          );
        }
      } catch (err) {
        console.error(
          "Products loading error:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Unable to load products."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================
  // CATEGORIES
  // =========================

  const categories =
    useMemo(() => {
      const uniqueCategories =
        [
          ...new Set(
            products
              .map(
                (product) =>
                  product.category
              )
              .filter(Boolean)
          ),
        ];

      return [
        "All Categories",
        ...uniqueCategories,
      ];
    }, [products]);

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = (
    product
  ) => {
    console.log(
      "PRODUCTS PAGE ADD TO CART CLICKED:",
      product
    );

    if (!product) {
      return;
    }

    const productId =
      String(
        product.id || ""
      ).trim();

    // =========================
    // ID VALIDATION
    // =========================

    if (
      !isValidMongoId(
        productId
      )
    ) {
      console.error(
        "INVALID PRODUCT ID:",
        productId
      );

      alert(
        "This product has an invalid ID. Please refresh the page."
      );

      return;
    }

    // =========================
    // STOCK
    // =========================

    const stock =
      Number(
        product.stock || 0
      );

    if (stock <= 0) {
      return;
    }

    // =========================
    // CART PRODUCT
    // =========================

    const cartProduct = {
      id: productId,

      name:
        product.name ||
        "Product",

      price:
        Number(
          product.price || 0
        ),

      image:
        product.image || "",

      size:
        "Default",

      color:
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
      "PRODUCTS PAGE CART PRODUCT:",
      cartProduct
    );

    // =========================
    // ADD
    // =========================

    const added =
      addToCart(
        cartProduct,
        1
      );

    // CartContext returns false
    // when product is rejected.
    if (
      added === false
    ) {
      return;
    }

    setAddedProductId(
      productId
    );

    setTimeout(() => {
      setAddedProductId(
        null
      );
    }, 1500);
  };

  // =========================
  // WISHLIST
  // =========================

  const handleWishlist = (
    product
  ) => {
    if (!product) {
      return;
    }

    const productId =
      String(
        product.id || ""
      ).trim();

    if (
      !isValidMongoId(
        productId
      )
    ) {
      console.error(
        "Invalid wishlist product ID:",
        productId
      );

      return;
    }

    toggleWishlist({
      id: productId,

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
  // FILTER + SORT
  // =========================

  const filteredProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result =
        products.filter(
          (product) => {
            const matchesSearch =
              !query ||
              product.name
                ?.toLowerCase()
                .includes(query) ||
              product.brand
                ?.toLowerCase()
                .includes(query) ||
              product.category
                ?.toLowerCase()
                .includes(query);

            const matchesCategory =
              category ===
                "All Categories" ||
              product.category ===
                category;

            return (
              matchesSearch &&
              matchesCategory
            );
          }
        );

      if (
        sort ===
        "Price Low to High"
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            a.price -
            b.price
        );
      }

      if (
        sort ===
        "Price High to Low"
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            b.price -
            a.price
        );
      }

      if (
        sort === "Rating"
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            b.rating -
            a.rating
        );
      }

      return result;
    }, [
      products,
      search,
      category,
      sort,
    ]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="products-page">

        <section className="products-header">

          <p>
            EXPLORE OUR COLLECTION
          </p>

          <h1>
            All Products
          </h1>

          <span>
            Loading products...
          </span>

        </section>

        <div className="no-products">

          <i className="bi bi-arrow-repeat"></i>

          <h2>
            Loading Products
          </h2>

          <p>
            Please wait...
          </p>

        </div>

      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="products-page">

        <section className="products-header">

          <p>
            EXPLORE OUR COLLECTION
          </p>

          <h1>
            All Products
          </h1>

          <span>
            Find the perfect products
            for your lifestyle.
          </span>

        </section>

        <div className="no-products">

          <i className="bi bi-exclamation-circle"></i>

          <h2>
            Unable to Load Products
          </h2>

          <p>
            {error}
          </p>

        </div>

      </main>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="products-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="products-header">

        <p>
          EXPLORE OUR COLLECTION
        </p>

        <h1>
          All Products
        </h1>

        <span>
          Find the perfect products
          for your lifestyle.
        </span>

      </section>

      {/* =========================
          FILTER TOOLBAR
      ========================= */}

      <section className="products-toolbar">

        {/* SEARCH */}

        <div className="search-box">

          <i className="bi bi-search"></i>

          <input
            type="text"
            placeholder="Search products..."
            value={
              search
            }
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        {/* CATEGORY */}

        <select
          value={
            category
          }
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
        >

          {categories.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}

        </select>

        {/* SORT */}

        <select
          value={sort}
          onChange={(e) =>
            setSort(
              e.target.value
            )
          }
        >

          <option value="Sort By">
            Sort By
          </option>

          <option value="Price Low to High">
            Price Low to High
          </option>

          <option value="Price High to Low">
            Price High to Low
          </option>

          <option value="Rating">
            Highest Rated
          </option>

        </select>

      </section>

      {/* =========================
          RESULT COUNT
      ========================= */}

      <div className="product-result-info">
        Showing{" "}
        {
          filteredProducts.length
        }{" "}
        products
      </div>

      {/* =========================
          EMPTY
      ========================= */}

      {filteredProducts.length ===
      0 ? (

        <div className="no-products">

          <i className="bi bi-search"></i>

          <h2>
            No Products Found
          </h2>

          <p>
            Try another search
            or category.
          </p>

        </div>

      ) : (

        <section className="products-page-grid">

          {filteredProducts.map(
            (product) => {
              const inWishlist =
                isInWishlist(
                  product.id
                );

              const outOfStock =
                Number(
                  product.stock || 0
                ) <= 0;

              return (
                <article
                  className="product-card"
                  key={
                    product.id
                  }
                >

                  {/* IMAGE */}

                  <div className="product-image-box">

                    {product.discount >
                      0 && (
                      <span className="product-discount">
                        {
                          product.discount
                        }
                        % OFF
                      </span>
                    )}

                    {/* WISHLIST */}

                    <button
                      type="button"
                      className={`wishlist-button ${
                        inWishlist
                          ? "active"
                          : ""
                      }`}
                      aria-label={
                        inWishlist
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      onClick={() =>
                        handleWishlist(
                          product
                        )
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

                    {/* IMAGE LINK */}

                    <Link
                      to={`/product/${product.id}`}
                    >

                      {product.image ? (

                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          onError={(
                            e
                          ) => {
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

                  </div>

                  {/* INFO */}

                  <div className="product-info">

                    <span className="product-category">
                      {
                        product.category
                      }
                    </span>

                    <h3>

                      <Link
                        to={`/product/${product.id}`}
                      >
                        {
                          product.name
                        }
                      </Link>

                    </h3>

                    {/* RATING */}

                    <div className="product-rating">

                      <span>

                        <i className="bi bi-star-fill"></i>

                        {" "}

                        {Number(
                          product.rating ||
                            0
                        ).toFixed(
                          1
                        )}

                      </span>

                      <small>
                        (
                        {
                          product.reviews
                        }
                        )
                      </small>

                    </div>

                    {/* PRICE */}

                    <div className="product-price">

                      <strong>
                        $
                        {Number(
                          product.price ||
                            0
                        ).toFixed(
                          2
                        )}
                      </strong>

                      {Number(
                        product.oldPrice ||
                          0
                      ) >
                        Number(
                          product.price ||
                            0
                        ) && (
                        <del>
                          $
                          {Number(
                            product.oldPrice ||
                              0
                          ).toFixed(
                            2
                          )}
                        </del>
                      )}

                    </div>

                    {/* STOCK */}

                    {outOfStock ? (

                      <small className="product-stock-out">
                        Out of Stock
                      </small>

                    ) : (

                      <small className="product-stock-available">
                        {
                          product.stock
                        }{" "}
                        in stock
                      </small>

                    )}

                    {/* ADD TO CART */}

                    <button
                      type="button"
                      disabled={
                        outOfStock
                      }
                      className={`add-cart-btn ${
                        addedProductId ===
                        product.id
                          ? "added"
                          : ""
                      }`}
                      onClick={() =>
                        handleAddToCart(
                          product
                        )
                      }
                    >

                      <i
                        className={
                          addedProductId ===
                          product.id
                            ? "bi bi-check-lg"
                            : "bi bi-cart-plus"
                        }
                      ></i>

                      {addedProductId ===
                      product.id
                        ? "Added"
                        : outOfStock
                        ? "Out of Stock"
                        : "Add to Cart"}

                    </button>

                  </div>

                </article>
              );
            }
          )}

        </section>

      )}

    </main>
  );
}

export default Products;