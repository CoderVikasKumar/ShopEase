import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../context/CartContext";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartSubtotal,
    clearCart,
  } = useCart();

  // =========================================================
  // PAYMENT METHOD
  // =========================================================

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  // =========================================================
  // DELIVERY FORM
  // =========================================================

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });

  // =========================================================
  // ORDER STATE
  // =========================================================

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [orderError, setOrderError] =
    useState("");

  // =========================================================
  // TOTALS
  // =========================================================

  const shipping =
    cartSubtotal >= 75 ||
    cartSubtotal === 0
      ? 0
      : 8;

  const total =
    cartSubtotal + shipping;

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    let finalValue = value;

    if (name === "phone") {
      finalValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    if (name === "pincode") {
      finalValue = value
        .replace(/\D/g, "")
        .slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    setOrderError("");
  };

  // =========================================================
  // DELIVERY VALIDATION
  // =========================================================

  const validateDelivery = () => {
    const fields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    const hasEmpty = fields.some(
      (field) =>
        !formData[field]?.trim()
    );

    if (hasEmpty) {
      setOrderError(
        "Please complete all delivery details."
      );

      return false;
    }

    // Correct email regex
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      setOrderError(
        "Please enter a valid email address."
      );

      return false;
    }

    if (
      formData.phone.length !== 10
    ) {
      setOrderError(
        "Please enter a valid 10-digit phone number."
      );

      return false;
    }

    if (
      formData.pincode.length !== 6
    ) {
      setOrderError(
        "Please enter a valid 6-digit PIN code."
      );

      return false;
    }

    return true;
  };

  // =========================================================
  // EXPECTED DELIVERY
  // =========================================================

  const getExpectedDelivery = () => {
    const deliveryDate =
      new Date();

    deliveryDate.setDate(
      deliveryDate.getDate() + 6
    );

    return deliveryDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // ORDER ITEMS
  // =========================================================

  const getOrderItems = () => {
    return cartItems.map(
      (item) => ({
        id: String(
          item.id
        ).trim(),

        name:
          item.name || "Product",

        // Kept for UI/backward compatibility.
        // Final secure price will be validated
        // by backend from MongoDB.
        price:
          Number(
            item.price || 0
          ),

        quantity:
          Number(
            item.quantity || 1
          ),

        image:
          item.image || "",

        size:
          item.size ||
          "Default",

        color:
          item.color ||
          "Default",
      })
    );
  };

  // =========================================================
  // RAZORPAY CREATE ITEMS
  // =========================================================
  // Only ID + quantity are required for secure
  // server-side price calculation.

  const getPaymentItems = () => {
    return cartItems.map(
      (item) => ({
        id: String(
          item.id
        ).trim(),

        quantity:
          Number(
            item.quantity || 1
          ),
      })
    );
  };

  // =========================================================
  // CUSTOMER DATA
  // =========================================================

  const getCustomerData = () => {
    return {
      firstName:
        formData.firstName.trim(),

      lastName:
        formData.lastName.trim(),

      email:
        formData.email
          .trim()
          .toLowerCase(),

      phone:
        formData.phone.trim(),

      address:
        formData.address.trim(),

      city:
        formData.city.trim(),

      state:
        formData.state.trim(),

      pincode:
        formData.pincode.trim(),
    };
  };

  // =========================================================
  // CLEAR SESSION
  // =========================================================

  const clearUserSession = () => {
    localStorage.removeItem(
      "shopease_token"
    );

    localStorage.removeItem(
      "shopease_current_user"
    );

    localStorage.removeItem(
      "shopease_remember_me"
    );
  };

  // =========================================================
  // COD ORDER
  // =========================================================

  const handleCodOrder = async () => {
    try {
      const token =
        localStorage.getItem(
          "shopease_token"
        );

      if (!token) {
        navigate("/login", {
          state: {
            from: "/checkout",
          },
        });

        return;
      }

      const orderPayload = {
        items:
          getOrderItems(),

        subtotal:
          Number(
            cartSubtotal.toFixed(2)
          ),

        shipping:
          Number(
            shipping.toFixed(2)
          ),

        total:
          Number(
            total.toFixed(2)
          ),

        paymentMethod:
          "cod",

        paymentStatus:
          "pending",

        customer:
          getCustomerData(),

        expectedDelivery:
          getExpectedDelivery(),
      };

      const response =
        await fetch(
          "http://localhost:5000/api/orders",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                orderPayload
              ),
          }
        );

      const data =
        await response.json();

      if (
        response.status === 401
      ) {
        clearUserSession();

        navigate("/login", {
          state: {
            from: "/checkout",
          },
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to place COD order."
        );
      }

      clearCart();

      setPlacingOrder(false);

      alert(
        data?.order?.orderId
          ? `Order ${data.order.orderId} placed successfully!`
          : "Order placed successfully!"
      );

      navigate("/orders");
    } catch (error) {
      console.error(
        "COD order error:",
        error
      );

      setOrderError(
        error.message ||
          "Unable to place COD order."
      );

      setPlacingOrder(false);
    }
  };

  // =========================================================
  // RAZORPAY PAYMENT
  // =========================================================

  const handleRazorpayPayment =
    async () => {
      try {
        console.log(
          "RAZORPAY PAYMENT STARTED"
        );

        const token =
          localStorage.getItem(
            "shopease_token"
          );

        if (!token) {
          navigate("/login", {
            state: {
              from: "/checkout",
            },
          });

          return;
        }

        if (
          typeof window ===
            "undefined" ||
          !window.Razorpay
        ) {
          throw new Error(
            "Razorpay Checkout is not loaded. Please refresh the page."
          );
        }

        // =====================================================
        // CREATE RAZORPAY ORDER
        // =====================================================

        const paymentItems =
          getPaymentItems();

        const createPayload = {
          // Current backend compatibility.
          // Later backend will calculate its own total
          // from paymentItems + MongoDB.
          amount:
            Number(
              total.toFixed(2)
            ),

          // Secure source-of-truth inputs.
          items:
            paymentItems,

          shipping:
            Number(
              shipping.toFixed(2)
            ),
        };

        console.log(
          "RAZORPAY CREATE PAYLOAD:",
          createPayload
        );

        const createResponse =
          await fetch(
            "http://localhost:5000/api/orders/payment/create",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  createPayload
                ),
            }
          );

        const createData =
          await createResponse.json();

        console.log(
          "RAZORPAY CREATE RESPONSE:",
          createData
        );

        if (
          createResponse.status ===
          401
        ) {
          clearUserSession();

          navigate("/login", {
            state: {
              from: "/checkout",
            },
          });

          return;
        }

        if (!createResponse.ok) {
          throw new Error(
            createData.message ||
              "Unable to create Razorpay order."
          );
        }

        const razorpayOrder =
          createData?.razorpayOrder;

        if (
          !razorpayOrder?.id
        ) {
          throw new Error(
            "Razorpay order ID was not received."
          );
        }

        // =====================================================
        // PAYMENT METHOD
        // =====================================================

        const normalizedPaymentMethod =
          paymentMethod === "card"
            ? "card"
            : paymentMethod === "upi"
            ? "upi"
            : null;

        if (
          !normalizedPaymentMethod
        ) {
          throw new Error(
            "Please select Card or UPI."
          );
        }

        // =====================================================
        // RAZORPAY OPTIONS
        // =====================================================

        const options = {
          key:
            createData.key,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency,

          name:
            "ShopEase",

          description:
            "ShopEase Order Payment",

          order_id:
            razorpayOrder.id,

          prefill: {
            name:
              `${formData.firstName} ${formData.lastName}`.trim(),

            email:
              formData.email
                .trim()
                .toLowerCase(),

            contact:
              formData.phone.trim(),
          },

          notes: {
            address:
              formData.address.trim(),

            city:
              formData.city.trim(),
          },

          theme: {
            color:
              "#ff5a1f",
          },

          handler:
            async (
              paymentResponse
            ) => {
              try {
                console.log(
                  "RAZORPAY PAYMENT RESPONSE:",
                  paymentResponse
                );

                // =================================================
                // VERIFY PAYMENT
                // =================================================

                const verifyPayload = {
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                  paymentMethod:
                    normalizedPaymentMethod,

                  items:
                    getOrderItems(),

                  subtotal:
                    Number(
                      cartSubtotal.toFixed(
                        2
                      )
                    ),

                  shipping:
                    Number(
                      shipping.toFixed(
                        2
                      )
                    ),

                  total:
                    Number(
                      total.toFixed(
                        2
                      )
                    ),

                  customer:
                    getCustomerData(),

                  expectedDelivery:
                    getExpectedDelivery(),
                };

                console.log(
                  "RAZORPAY VERIFY PAYLOAD:",
                  verifyPayload
                );

                const verifyResponse =
                  await fetch(
                    "http://localhost:5000/api/orders/payment/verify",
                    {
                      method:
                        "POST",

                      headers: {
                        "Content-Type":
                          "application/json",

                        Authorization:
                          `Bearer ${token}`,
                      },

                      body:
                        JSON.stringify(
                          verifyPayload
                        ),
                    }
                  );

                const verifyData =
                  await verifyResponse.json();

                console.log(
                  "RAZORPAY VERIFY RESPONSE:",
                  verifyData
                );

                if (
                  verifyResponse.status ===
                  401
                ) {
                  clearUserSession();

                  navigate(
                    "/login"
                  );

                  return;
                }

                if (
                  !verifyResponse.ok
                ) {
                  throw new Error(
                    verifyData.message ||
                      "Payment verification failed."
                  );
                }

                // =================================================
                // SUCCESS
                // =================================================

                clearCart();

                setPlacingOrder(
                  false
                );

                alert(
                  verifyData?.order
                    ?.orderId
                    ? `Payment successful! Order ${verifyData.order.orderId} created.`
                    : "Payment successful! Order created."
                );

                navigate(
                  "/orders"
                );
              } catch (error) {
                console.error(
                  "Payment verification error:",
                  error
                );

                setOrderError(
                  error.message ||
                    "Payment verification failed."
                );

                setPlacingOrder(
                  false
                );
              }
            },

          modal: {
            ondismiss:
              () => {
                console.log(
                  "RAZORPAY MODAL CLOSED"
                );

                setPlacingOrder(
                  false
                );

                setOrderError(
                  "Payment was cancelled."
                );
              },
          },
        };

        console.log(
          "OPENING RAZORPAY:",
          options
        );

        // =====================================================
        // OPEN RAZORPAY
        // =====================================================

        const razorpay =
          new window.Razorpay(
            options
          );

        razorpay.on(
          "payment.failed",
          (response) => {
            console.error(
              "Razorpay payment failed:",
              response
            );

            setOrderError(
              response?.error
                ?.description ||
                "Payment failed."
            );

            setPlacingOrder(
              false
            );
          }
        );

        razorpay.open();
      } catch (error) {
        console.error(
          "Razorpay payment error:",
          error
        );

        setOrderError(
          error.message ||
            "Unable to start Razorpay payment."
        );

        setPlacingOrder(false);
      }
    };

  // =========================================================
  // MAIN SUBMIT
  // =========================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      console.log(
        "CHECKOUT SUBMIT CLICKED"
      );

      console.log(
        "SELECTED PAYMENT METHOD:",
        paymentMethod
      );

      setOrderError("");

      if (
        cartItems.length === 0
      ) {
        setOrderError(
          "Your cart is empty."
        );

        return;
      }

      if (
        !validateDelivery()
      ) {
        console.log(
          "DELIVERY VALIDATION FAILED"
        );

        return;
      }

      try {
        setPlacingOrder(true);

        // =====================================================
        // COD
        // =====================================================

        if (
          paymentMethod ===
          "cod"
        ) {
          await handleCodOrder();

          return;
        }

        // =====================================================
        // CARD / UPI
        // =====================================================

        console.log(
          "STARTING RAZORPAY:",
          paymentMethod
        );

        await handleRazorpayPayment();
      } catch (error) {
        console.error(
          "Checkout error:",
          error
        );

        setOrderError(
          error.message ||
            "Unable to process checkout."
        );

        setPlacingOrder(
          false
        );
      }
    };

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (
    cartItems.length === 0
  ) {
    return (
      <main className="checkout-page">

        <section className="checkout-header">

          <p>
            SECURE CHECKOUT
          </p>

          <h1>
            Checkout
          </h1>

          <span>
            Your cart is currently empty.
          </span>

        </section>

        <div className="empty-checkout">

          <div className="empty-cart-icon">
            <i className="bi bi-bag-x"></i>
          </div>

          <h2>
            No Products to Checkout
          </h2>

          <p>
            Add products to your cart
            before proceeding to checkout.
          </p>

          <Link
            to="/products"
            className="continue-shopping-btn"
          >
            SHOP PRODUCTS

            <i className="bi bi-arrow-right"></i>
          </Link>

        </div>

      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="checkout-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="checkout-header">

        <p>
          SECURE CHECKOUT
        </p>

        <h1>
          Checkout
        </h1>

        <span>
          Complete your order securely
          and safely.
        </span>

      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {orderError && (
        <div className="checkout-error">

          <i className="bi bi-exclamation-circle"></i>

          <span>
            {orderError}
          </span>

        </div>
      )}

      {/* =====================================================
          CHECKOUT FORM
      ===================================================== */}

      <form
        className="checkout-layout"
        onSubmit={handleSubmit}
      >

        <div className="checkout-left">

          {/* =================================================
              DELIVERY
          ================================================= */}

          <section className="checkout-card">

            <div className="checkout-card-heading">

              <div>

                <span>
                  01
                </span>

                <div>

                  <h2>
                    Delivery Address
                  </h2>

                  <p>
                    Where should we deliver
                    your order?
                  </p>

                </div>

              </div>

              <i className="bi bi-geo-alt"></i>

            </div>

            <div className="checkout-form-grid">

              <div className="checkout-input">

                <label>
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  value={
                    formData.firstName
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    placingOrder
                  }
                  required
                />

              </div>

              <div className="checkout-input">

                <label>
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={
                    formData.lastName
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    placingOrder
                  }
                  required
                />

              </div>

              <div className="checkout-input">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    placingOrder
                  }
                  required
                />

              </div>

              <div className="checkout-input">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter 10-digit phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  inputMode="numeric"
                  maxLength="10"
                  disabled={
                    placingOrder
                  }
                  required
                />

              </div>

              <div className="checkout-input full-width">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  rows="3"
                  placeholder="House no, street, area"
                  value={
                    formData.address
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    placingOrder
                  }
                  required
                />

              </div>

              <div className="checkout-input">

                <label>
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={
                    formData.city
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    placingOrder
                  }
                  required
                />

              </div>

              <div className="checkout-input">

                <label>
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  value={
                    formData.state
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    placingOrder
                  }
                  required
                />

              </div>

              <div className="checkout-input">

                <label>
                  PIN Code
                </label>

                <input
                  type="text"
                  name="pincode"
                  placeholder="Enter 6-digit PIN"
                  value={
                    formData.pincode
                  }
                  onChange={
                    handleChange
                  }
                  maxLength="6"
                  inputMode="numeric"
                  disabled={
                    placingOrder
                  }
                  required
                />

              </div>

            </div>

          </section>

          {/* =================================================
              PAYMENT
          ================================================= */}

          <section className="checkout-card">

            <div className="checkout-card-heading">

              <div>

                <span>
                  02
                </span>

                <div>

                  <h2>
                    Payment Method
                  </h2>

                  <p>
                    Select your preferred
                    payment option.
                  </p>

                </div>

              </div>

              <i className="bi bi-credit-card"></i>

            </div>

            <div className="payment-options">

              {/* COD */}

              <label
                className={`payment-option ${
                  paymentMethod ===
                  "cod"
                    ? "active"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={
                    paymentMethod ===
                    "cod"
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  disabled={
                    placingOrder
                  }
                />

                <div className="payment-icon">

                  <i className="bi bi-cash-stack"></i>

                </div>

                <div>

                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order arrives.
                  </span>

                </div>

              </label>

              {/* CARD */}

              <label
                className={`payment-option ${
                  paymentMethod ===
                  "card"
                    ? "active"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={
                    paymentMethod ===
                    "card"
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  disabled={
                    placingOrder
                  }
                />

                <div className="payment-icon">

                  <i className="bi bi-credit-card"></i>

                </div>

                <div>

                  <strong>
                    Credit / Debit Card
                  </strong>

                  <span>
                    Pay securely with Razorpay.
                  </span>

                </div>

              </label>

              {/* UPI */}

              <label
                className={`payment-option ${
                  paymentMethod ===
                  "upi"
                    ? "active"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={
                    paymentMethod ===
                    "upi"
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  disabled={
                    placingOrder
                  }
                />

                <div className="payment-icon">

                  <i className="bi bi-phone"></i>

                </div>

                <div>

                  <strong>
                    UPI
                  </strong>

                  <span>
                    Pay securely with Razorpay.
                  </span>

                </div>

              </label>

            </div>

            {/* RAZORPAY INFO */}

            {paymentMethod !==
              "cod" && (
              <div className="payment-details-box">

                <h3>
                  Secure Razorpay Payment
                </h3>

                <p>
                  After clicking the
                  payment button,
                  Razorpay will open
                  securely.
                </p>

                <div className="payment-security-note">

                  <i className="bi bi-shield-check"></i>

                  <span>
                    Your card, UPI or other
                    payment details are
                    handled by Razorpay.
                  </span>

                </div>

              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="payment-submit-btn"
              disabled={
                placingOrder
              }
            >

              {placingOrder
                ? "PROCESSING..."
                : paymentMethod ===
                  "cod"
                ? "PLACE COD ORDER"
                : "PAY WITH RAZORPAY"}

              <i className="bi bi-arrow-right"></i>

            </button>

          </section>

        </div>

        {/* ===================================================
            ORDER SUMMARY
        =================================================== */}

        <aside className="checkout-summary">

          <h2>
            Order Summary
          </h2>

          <div className="checkout-products">

            {cartItems.map(
              (item) => (
                <div
                  className="checkout-product"
                  key={`${item.id}-${item.size}-${item.color}`}
                >

                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/80?text=Product"
                    }
                    alt={
                      item.name
                    }
                  />

                  <div>

                    <h3>
                      {item.name}
                    </h3>

                    <span>
                      Qty:{" "}
                      {item.quantity}
                    </span>

                  </div>

                  <strong>
                    $
                    {(
                      Number(
                        item.price || 0
                      ) *
                      Number(
                        item.quantity || 0
                      )
                    ).toFixed(2)}
                  </strong>

                </div>
              )
            )}

          </div>

          <div className="summary-divider"></div>

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

          <div className="summary-divider"></div>

          <div className="checkout-total">

            <span>
              Total
            </span>

            <strong>
              $
              {total.toFixed(2)}
            </strong>

          </div>

          <button
            type="submit"
            className="place-order-btn"
            disabled={
              placingOrder
            }
          >

            {placingOrder
              ? "PROCESSING..."
              : paymentMethod ===
                "cod"
              ? "PLACE COD ORDER"
              : "PAY WITH RAZORPAY"}

            <i
              className={
                placingOrder
                  ? "bi bi-arrow-repeat"
                  : "bi bi-arrow-right"
              }
            ></i>

          </button>

          <div className="checkout-security">

            <i className="bi bi-shield-check"></i>

            <span>
              Your information is protected
              by secure payment processing.
            </span>

          </div>

          <Link
            to="/cart"
            className="back-cart-link"
          >

            <i className="bi bi-arrow-left"></i>

            Back to Cart

          </Link>

        </aside>

      </form>

    </main>
  );
}

export default Checkout;