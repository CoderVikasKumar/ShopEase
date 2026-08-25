import { useState } from "react";

import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

import {
  useWishlist,
} from "../context/WishlistContext";

function Wishlist() {
  const {
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const {
    addToCart,
  } = useCart();

  const [
    addedProductId,
    setAddedProductId,
  ] = useState(null);

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = (
    product
  ) => {
    addToCart(
      {
        id: product.id,

        name:
          product.name,

        price:
          Number(
            product.price || 0
          ),

        image:
          product.image || "",

        size:
          product.size ||
          "Default",

        color:
          product.color ||
          "Default",
      },
      1
    );

    setAddedProductId(
      String(product.id)
    );

    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  // =========================
  // CLEAR WISHLIST
  // =========================

  const handleClearWishlist =
    () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to clear your wishlist?"
        );

      if (!confirmed) {
        return;
      }

      clearWishlist();
    };

  // =========================
  // EMPTY STATE
  // =========================

  if (
    wishlistItems.length === 0
  ) {
    return (
      <main className="wishlist-page">

        <section className="wishlist-header">

          <p>
            YOUR FAVORITES
          </p>

          <h1>
            My Wishlist
          </h1>

          <span>
            Save your favorite
            products here.
          </span>

        </section>


        <div className="wishlist-empty">

          <div className="wishlist-empty-icon">

            <i className="bi bi-heart"></i>

          </div>


          <h2>
            Your Wishlist is Empty
          </h2>


          <p>
            You haven't added any
            products to your
            wishlist yet.
          </p>


          <Link
            to="/products"
            className="wishlist-shop-btn"
          >
            EXPLORE PRODUCTS

            <i className="bi bi-arrow-right"></i>

          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="wishlist-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="wishlist-header">

        <div>

          <p>
            YOUR FAVORITES
          </p>

          <h1>
            My Wishlist
          </h1>

          <span>
            {wishlistItems.length}{" "}
            product
            {wishlistItems.length !==
            1
              ? "s"
              : ""}{" "}
            saved in your
            wishlist.
          </span>

        </div>


        <button
          type="button"
          className="wishlist-clear-btn"
          onClick={
            handleClearWishlist
          }
        >
          <i className="bi bi-trash"></i>

          Clear Wishlist
        </button>

      </section>


      {/* =========================
          WISHLIST GRID
      ========================= */}

      <section className="wishlist-grid">

        {wishlistItems.map(
          (product) => {

            const productId =
              String(product.id);

            const price =
              Number(
                product.price || 0
              );

            const oldPrice =
              Number(
                product.oldPrice || 0
              );

            const isAdded =
              addedProductId ===
              productId;

            return (
              <article
                className="wishlist-card"
                key={productId}
              >

                {/* =========================
                    IMAGE
                ========================= */}

                <div className="wishlist-image">

                  <Link
                    to={`/product/${productId}`}
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
                          e.currentTarget.src =
                            "https://via.placeholder.com/500x500?text=Product";
                        }}
                      />
                    ) : (
                      <div className="wishlist-image-fallback">
                        Product Image
                      </div>
                    )}

                  </Link>


                  {/* REMOVE */}

                  <button
                    type="button"
                    className="wishlist-remove-btn"
                    aria-label="Remove from wishlist"
                    onClick={() =>
                      removeFromWishlist(
                        productId
                      )
                    }
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>

                </div>


                {/* =========================
                    INFO
                ========================= */}

                <div className="wishlist-info">

                  <span className="wishlist-category">
                    {product.category ||
                      "Other"}
                  </span>


                  <h2>

                    <Link
                      to={`/product/${productId}`}
                    >
                      {product.name}
                    </Link>

                  </h2>


                  {/* RATING */}

                  {Number(
                    product.rating || 0
                  ) > 0 && (
                    <div className="wishlist-rating">

                      <i className="bi bi-star-fill"></i>

                      <span>
                        {Number(
                          product.rating
                        ).toFixed(1)}
                      </span>

                      <small>
                        (
                        {Number(
                          product.reviews ||
                            0
                        )}
                        )
                      </small>

                    </div>
                  )}


                  {/* PRICE */}

                  <div className="wishlist-price">

                    <strong>
                      $
                      {price.toFixed(
                        2
                      )}
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


                  {/* ADD TO CART */}

                  <button
                    type="button"
                    className={`wishlist-cart-btn ${
                      isAdded
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
                        isAdded
                          ? "bi bi-check-lg"
                          : "bi bi-cart-plus"
                      }
                    ></i>

                    {isAdded
                      ? "Added to Cart"
                      : "Add to Cart"}

                  </button>

                </div>

              </article>
            );
          }
        )}

      </section>


      {/* =========================
          BOTTOM
      ========================= */}

      <div className="wishlist-bottom">

        <Link
          to="/products"
          className="continue-shopping-btn"
        >
          <i className="bi bi-arrow-left"></i>

          Continue Shopping
        </Link>

      </div>

    </main>
  );
}

export default Wishlist;