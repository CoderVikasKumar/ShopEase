import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../context/CartContext";

const API_BASE_URL =
  "https://shopease-backend-txtm.onrender.com";

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

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
    const normalized = {
      firstName:
        String(
          formData.firstName || ""
        ).trim(),

      lastName:
        String(
          formData.lastName || ""
        ).trim(),

      email:
        String(
          formData.email || ""
        ).trim().toLowerCase(),

      phone:
        String(
          formData.phone || ""
        ).replace(/\D/g, ""),

      address:
        String(
          formData.address || ""
        ).trim(),

      city:
        String(
          formData.city || ""
        ).trim(),

      state:
        String(
          formData.state || ""
        ).trim(),

      pincode:
        String(
          formData.pincode || ""
        ).replace(/\D/g, ""),
    };

    console.log(
      "DELIVERY FORM DATA:",
      normalized
    );

    const requiredFields = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      state: "State",
      pincode: "PIN Code",
    };

    for (
      const [field, label]
      of Object.entries(
        requiredFields
      )
    ) {
      if (!normalized[field]) {
        console.error(
          "DELIVERY VALIDATION FAILED:",
          field
        );

        setOrderError(
          `${label} is required.`
        );

        return null;
      }
    }

    // Correct email regex
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalized.email
      )
    ) {
      console.error(
        "DELIVERY VALIDATION FAILED: email"
      );

      setOrderError(
        "Please enter a valid email address."
      );

      return null;
    }

    // Phone
    if (
      !/^\d{10}$/.test(
        normalized.phone
      )
    ) {
      console.error(
        "DELIVERY VALIDATION FAILED: phone"
      );

      setOrderError(
        "Please enter a valid 10-digit phone number."
      );

      return null;
    }

    // PIN
    if (
      !/^\d{6}$/.test(
        normalized.pincode
      )
    ) {
      console.error(
        "DELIVERY VALIDATION FAILED: pincode"
      );

      setOrderError(
        "Please enter a valid 6-digit PIN code."
      );

      return null;
    }

    setFormData(normalized);
    setOrderError("");

    console.log(
      "DELIVERY VALIDATION PASSED ✅"
    );

    return normalized;
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
          item.name ||
          "Product",

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
  // RAZORPAY ITEMS
  // =========================================================

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

  const getCustomerData = (
    data = formData
  ) => {
    return {
      firstName:
        String(
          data.firstName || ""
        ).trim(),

      lastName:
        String(
          data.lastName || ""
        ).trim(),

      email:
        String(
          data.email || ""
        ).trim().toLowerCase(),

      phone:
        String(
          data.phone || ""
        ).trim(),

      address:
        String(
          data.address || ""
        ).trim(),

      city:
        String(
          data.city || ""
        ).trim(),

      state:
        String(
          data.state || ""
        ).trim(),

      pincode:
        String(
          data.pincode || ""
        ).trim(),
    };
  };

  // =========================================================
  // SESSION
  // =========================================================

  const getToken = () => {
    return localStorage.getItem(
      "shopease_token"
    );
  };

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
  // LOAD RAZORPAY
  // =========================================================

  const ensureRazorpayLoaded =
    () => {
      if (
        typeof window !==
          "undefined" &&
        typeof window.Razorpay ===
          "function"
      ) {
        return Promise.resolve(
          true
        );
      }

      return new Promise(
        (
          resolve,
          reject
        ) => {
          const existingScript =
            document.querySelector(
              `script[src="${RAZORPAY_SCRIPT_URL}"]`
            );

          if (
            existingScript
          ) {
            const timer =
              window.setTimeout(
                () => {
                  reject(
                    new Error(
                      "Razorpay Checkout load timeout."
                    )
                  );
                },
                12000
              );

            existingScript.addEventListener(
              "load",
              () => {
                window.clearTimeout(
                  timer
                );

                if (
                  typeof window.Razorpay ===
                  "function"
                ) {
                  resolve(true);
                } else {
                  reject(
                    new Error(
                      "Razorpay loaded but is unavailable."
                    )
                  );
                }
              },
              {
                once: true,
              }
            );

            existingScript.addEventListener(
              "error",
              () => {
                window.clearTimeout(
                  timer
                );

                reject(
                  new Error(
                    "Unable to load Razorpay Checkout."
                  )
                );
              },
              {
                once: true,
              }
            );

            return;
          }

          const script =
            document.createElement(
              "script"
            );

          script.src =
            RAZORPAY_SCRIPT_URL;

          script.async = true;

          script.onload = () => {
            if (
              typeof window.Razorpay ===
              "function"
            ) {
              resolve(true);
            } else {
              reject(
                new Error(
                  "Razorpay loaded but is unavailable."
                )
              );
            }
          };

          script.onerror = () => {
            reject(
              new Error(
                "Unable to load Razorpay Checkout."
              )
            );
          };

          document.body.appendChild(
            script
          );
        }
      );
    };

  // =========================================================
  // JSON REQUEST HELPER
  // =========================================================

  const requestJson = async (
    url,
    options
  ) => {
    const response =
      await fetch(
        url,
        options
      );

    const text =
      await response.text();

    let data = {};

    try {
      data = text
        ? JSON.parse(text)
        : {};
    } catch {
      data = {
        message:
          text ||
          "Invalid server response.",
      };
    }

    return {
      response,
      data,
    };
  };

  // =========================================================
  // COD ORDER
  // =========================================================

  const handleCodOrder =
    async (
      deliveryData
    ) => {
      const token =
        getToken();

      if (!token) {
        navigate(
          "/login",
          {
            state: {
              from: "/checkout",
            },
          }
        );

        return;
      }

      const orderPayload = {
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

        paymentMethod:
          "cod",

        paymentStatus:
          "pending",

        customer:
          getCustomerData(
            deliveryData
          ),

        expectedDelivery:
          getExpectedDelivery(),
      };

      console.log(
        "COD ORDER PAYLOAD:",
        orderPayload
      );

      const {
        response,
        data,
      } =
        await requestJson(
          `${API_BASE_URL}/api/orders`,
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

      console.log(
        "COD ORDER RESPONSE:",
        data
      );

      if (
        response.status ===
        401
      ) {
        clearUserSession();

        navigate(
          "/login",
          {
            state: {
              from:
                "/checkout",
            },
          }
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to place COD order."
        );
      }

      clearCart();

      window.alert(
        data?.order?.orderId
          ? `Order ${data.order.orderId} placed successfully!`
          : "Order placed successfully!"
      );

      navigate(
        "/orders"
      );
    };

  // =========================================================
  // RAZORPAY PAYMENT
  // =========================================================

  const handleRazorpayPayment =
    async (
      deliveryData
    ) => {
      const token =
        getToken();

      if (!token) {
        navigate(
          "/login",
          {
            state: {
              from:
                "/checkout",
            },
          }
        );

        return;
      }

      await ensureRazorpayLoaded();

      const method =
        paymentMethod ===
        "card"
          ? "card"
          : paymentMethod ===
            "upi"
          ? "upi"
          : null;

      if (!method) {
        throw new Error(
          "Please select Card or UPI."
        );
      }

      const createPayload = {
        amount:
          Number(
            total.toFixed(
              2
            )
          ),

        items:
          getPaymentItems(),

        shipping:
          Number(
            shipping.toFixed(
              2
            )
          ),
      };

      console.log(
        "RAZORPAY CREATE PAYLOAD:",
        createPayload
      );

      const {
        response:
          createResponse,
        data:
          createData,
      } =
        await requestJson(
          `${API_BASE_URL}/api/orders/payment/create`,
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

      console.log(
        "RAZORPAY CREATE RESPONSE:",
        createData
      );

      if (
        createResponse.status ===
        401
      ) {
        clearUserSession();

        navigate(
          "/login",
          {
            state: {
              from:
                "/checkout",
            },
          }
        );

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

      const customer =
        getCustomerData(
          deliveryData
        );

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
            `${customer.firstName} ${customer.lastName}`.trim(),

          email:
            customer.email,

          contact:
            customer.phone,
        },

        notes: {
          address:
            customer.address,

          city:
            customer.city,
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

              if (
                !paymentResponse?.razorpay_order_id ||
                !paymentResponse?.razorpay_payment_id ||
                !paymentResponse?.razorpay_signature
              ) {
                throw new Error(
                  "Incomplete Razorpay payment response."
                );
              }

              const verifyPayload =
                {
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                  paymentMethod:
                    method,

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

                  customer,

                  expectedDelivery:
                    getExpectedDelivery(),
                };

              console.log(
                "RAZORPAY VERIFY PAYLOAD:",
                verifyPayload
              );

              const {
                response:
                  verifyResponse,
                data:
                  verifyData,
              } =
                await requestJson(
                  `${API_BASE_URL}/api/orders/payment/verify`,
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
                  "/login",
                  {
                    state: {
                      from:
                        "/checkout",
                    },
                  }
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

              clearCart();

              window.alert(
                verifyData?.order
                  ?.orderId
                  ? `Payment successful! Order ${verifyData.order.orderId} created.`
                  : "Payment successful! Order created."
              );

              navigate(
                "/orders"
              );
            } catch (
              error
            ) {
              console.error(
                "Payment verification error:",
                error
              );

              setOrderError(
                error.message ||
                  "Payment verification failed."
              );
            } finally {
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
        {
          orderId:
            razorpayOrder.id,
          amount:
            razorpayOrder.amount,
          currency:
            razorpayOrder.currency,
        }
      );

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
    };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      // Prevent double-click / duplicate orders
      if (placingOrder) {
        return;
      }

      console.log(
        "CHECKOUT SUBMIT CLICKED"
      );

      console.log(
        "SELECTED PAYMENT METHOD:",
        paymentMethod
      );

      console.log(
        "CHECKOUT FORM DATA:",
        formData
      );

      setOrderError("");

      if (
        !Array.isArray(
          cartItems
        ) ||
        cartItems.length ===
          0
      ) {
        setOrderError(
          "Your cart is empty."
        );

        return;
      }

      const deliveryData =
        validateDelivery();

      if (!deliveryData) {
        console.log(
          "DELIVERY VALIDATION FAILED"
        );

        return;
      }

      try {
        setPlacingOrder(
          true
        );

        if (
          paymentMethod ===
          "cod"
        ) {
          await handleCodOrder(
            deliveryData
          );

          return;
        }

        console.log(
          "STARTING RAZORPAY:",
          paymentMethod
        );

        await handleRazorpayPayment(
          deliveryData
        );
      } catch (
        error
      ) {
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
    cartItems.length ===
    0
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

      {orderError && (
        <div className="checkout-error">

          <i className="bi bi-exclamation-circle"></i>

          <span>
            {orderError}
          </span>

        </div>
      )}

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
                  autoComplete="given-name"
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
                  autoComplete="family-name"
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
                  autoComplete="email"
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
                  autoComplete="tel"
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
                  autoComplete="street-address"
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
                  autoComplete="address-level2"
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
                  autoComplete="address-level1"
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
                  autoComplete="postal-code"
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

            {paymentMethod !==
              "cod" && (
              <div className="payment-details-box">

                <h3>
                  Secure Razorpay Payment
                </h3>

                <p>
                  Razorpay will open after
                  your delivery details are
                  validated.
                </p>

                <div className="payment-security-note">

                  <i className="bi bi-shield-check"></i>

                  <span>
                    Payment details are handled
                    securely by Razorpay.
                  </span>

                </div>

              </div>
            )}

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
                    ₹
                    {(
                      Number(
                        item.price ||
                          0
                      ) *
                      Number(
                        item.quantity ||
                          0
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
              ₹
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
                : `₹${shipping.toFixed(
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
              ₹
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