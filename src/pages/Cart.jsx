import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
  } = useCart();

  // =========================
  // SHIPPING
  // =========================

  const shipping =
    cartSubtotal >= 75 ||
    cartSubtotal === 0
      ? 0
      : 8;

  const total =
    cartSubtotal + shipping;

  // =========================
  // EMPTY CART
  // =========================

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">

        <div className="empty-cart">

          <div className="empty-cart-icon">
            <i className="bi bi-cart-x"></i>
          </div>

          <h1>
            Your Cart is Empty
          </h1>

          <p>
            Looks like you haven't
            added anything to your
            cart yet.
          </p>

          <Link
            to="/products"
            className="continue-shopping-btn"
          >
            CONTINUE SHOPPING

            <i className="bi bi-arrow-right"></i>
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="cart-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="cart-header">

        <p>
          YOUR SHOPPING BAG
        </p>

        <h1>
          Shopping Cart
        </h1>

        <span>
          {cartItems.length}{" "}
          {cartItems.length === 1
            ? "item"
            : "items"}{" "}
          in your cart
        </span>

      </section>


      {/* =========================
          CART LAYOUT
      ========================= */}

      <section className="cart-layout">

        {/* =========================
            CART ITEMS
        ========================= */}

        <div className="cart-items">

          <div className="cart-items-header">

            <span>
              PRODUCT
            </span>

            <span>
              PRICE
            </span>

            <span>
              QUANTITY
            </span>

            <span>
              TOTAL
            </span>

          </div>


          {cartItems.map((item) => {

            const itemSize =
              item.size ||
              "Default";

            const itemColor =
              item.color ||
              "Default";

            const itemQuantity =
              Number(
                item.quantity || 1
              );

            const itemPrice =
              Number(
                item.price || 0
              );

            const itemTotal =
              itemPrice *
              itemQuantity;

            return (
              <div
                className="cart-item"
                key={`${item.id}-${itemSize}-${itemColor}`}
              >

                {/* PRODUCT */}

                <div className="cart-product">

                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/150?text=Product"
                    }
                    alt={
                      item.name
                    }
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/150?text=Product";
                    }}
                  />

                  <div>

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      Size:{" "}
                      {itemSize}
                    </p>

                    <p>
                      Color:{" "}
                      {itemColor}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(
                          item.id,
                          itemSize,
                          itemColor
                        )
                      }
                    >
                      <i className="bi bi-trash3"></i>

                      Remove
                    </button>

                  </div>

                </div>


                {/* PRICE */}

                <div className="cart-price">

                  $
                  {itemPrice.toFixed(
                    2
                  )}

                </div>


                {/* QUANTITY */}

                <div className="cart-quantity">

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        itemSize,
                        itemColor,
                        itemQuantity - 1
                      )
                    }
                    disabled={
                      itemQuantity <= 1
                    }
                  >
                    -
                  </button>

                  <span>
                    {itemQuantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        itemSize,
                        itemColor,
                        itemQuantity + 1
                      )
                    }
                  >
                    +
                  </button>

                </div>


                {/* TOTAL */}

                <div className="cart-total">

                  $
                  {itemTotal.toFixed(
                    2
                  )}

                </div>

              </div>
            );
          })}


          {/* CONTINUE SHOPPING */}

          <div className="continue-shopping">

            <Link to="/products">

              <i className="bi bi-arrow-left"></i>

              Continue Shopping

            </Link>

          </div>

        </div>


        {/* =========================
            ORDER SUMMARY
        ========================= */}

        <aside className="cart-summary">

          <h2>
            Order Summary
          </h2>


          <div className="summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              $
              {cartSubtotal.toFixed(
                2
              )}
            </strong>

          </div>


          <div className="summary-row">

            <span>
              Shipping
            </span>

            <strong>
              {shipping === 0
                ? "FREE"
                : `$${shipping.toFixed(
                    2
                  )}`}
            </strong>

          </div>


          {/* FREE SHIPPING MESSAGE */}

          <div className="free-shipping-message">

            <i className="bi bi-truck"></i>

            {cartSubtotal >= 75
              ? "You qualify for FREE shipping!"
              : `Add $${(
                  75 - cartSubtotal
                ).toFixed(
                  2
                )} more for FREE shipping`}

          </div>


          <div className="summary-divider"></div>


          <div className="summary-total">

            <span>
              Total
            </span>

            <strong>
              $
              {total.toFixed(2)}
            </strong>

          </div>


          <Link
            to="/checkout"
            className="checkout-btn"
          >
            PROCEED TO CHECKOUT

            <i className="bi bi-arrow-right"></i>

          </Link>


          <div className="secure-checkout">

            <i className="bi bi-shield-check"></i>

            Secure Checkout

          </div>

        </aside>

      </section>

    </main>
  );
}

export default Cart;