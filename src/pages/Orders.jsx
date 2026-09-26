import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancellingOrderId, setCancellingOrderId] =
    useState("");

  // =========================================================
  // PAYMENT NAME
  // =========================================================

  const getPaymentName = (method) => {
    if (method === "cod") {
      return "Cash on Delivery";
    }

    if (method === "upi") {
      return "UPI";
    }

    if (method === "card") {
      return "Card";
    }

    return method || "Unknown";
  };

  // =========================================================
  // PAYMENT STATUS
  // =========================================================

  const getPaymentStatus = (status) => {
    if (status === "paid") {
      return "Paid";
    }

    if (status === "pending") {
      return "Pending";
    }

    if (status === "failed") {
      return "Failed";
    }

    return status || "Unknown";
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    return String(
      status || "Processing"
    )
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // =========================================================
  // CAN CANCEL
  // =========================================================

  const canCancelOrder = (order) => {
    return [
      "Processing",
      "Packed",
    ].includes(
      order?.orderStatus
    );
  };

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      const token =
        localStorage.getItem(
          "shopease_token"
        );

      if (!token) {
        navigate("/login", {
          state: {
            from: "/orders",
          },
        });

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "https:///api/orders/my-orders",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "shopease_token"
          );

          localStorage.removeItem(
            "shopease_current_user"
          );

          localStorage.removeItem(
            "shopease_remember_me"
          );

          navigate("/login", {
            state: {
              from: "/orders",
            },
          });

          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load orders."
          );
        }

        if (mounted) {
          setOrders(
            Array.isArray(
              data.orders
            )
              ? data.orders
              : []
          );
        }
      } catch (err) {
        console.error(
          "Orders loading error:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Unable to load your orders."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // =========================================================
  // CANCEL ORDER
  // =========================================================

  const handleCancelOrder =
    async (order) => {
      if (!order?.orderId) {
        return;
      }

      if (
        !canCancelOrder(order)
      ) {
        alert(
          "This order can no longer be cancelled."
        );

        return;
      }

      // =======================================================
      // PAID ORDER CHECK
      // =======================================================

      if (
        order.paymentStatus ===
          "paid" ||
        ["upi", "card"].includes(
          order.paymentMethod
        )
      ) {
        alert(
          "Paid Razorpay orders cannot be cancelled here. Refund processing is required."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to cancel order ${order.orderId}?`
        );

      if (!confirmed) {
        return;
      }

      const token =
        localStorage.getItem(
          "shopease_token"
        );

      if (!token) {
        navigate("/login", {
          state: {
            from: "/orders",
          },
        });

        return;
      }

      try {
        setCancellingOrderId(
          order.orderId
        );

        setError("");

        const response =
          await fetch(
            `https:///api/orders/${encodeURIComponent(
              order.orderId
            )}/cancel`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        // =====================================================
        // SESSION EXPIRED
        // =====================================================

        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "shopease_token"
          );

          localStorage.removeItem(
            "shopease_current_user"
          );

          localStorage.removeItem(
            "shopease_remember_me"
          );

          navigate("/login", {
            state: {
              from: "/orders",
            },
          });

          return;
        }

        // =====================================================
        // API ERROR
        // =====================================================

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to cancel order."
          );
        }

        // =====================================================
        // UPDATE LOCAL STATE
        // =====================================================

        setOrders((prevOrders) =>
          prevOrders.map(
            (item) =>
              item.orderId ===
              order.orderId
                ? {
                    ...item,

                    orderStatus:
                      "Cancelled",

                    currentLocation:
                      "Order Cancelled",

                    trackingHistory:
                      data.order
                        ?.trackingHistory ||
                      item.trackingHistory,
                  }
                : item
          )
        );

        alert(
          "Order cancelled successfully."
        );
      } catch (error) {
        console.error(
          "Cancel order error:",
          error
        );

        setError(
          error.message ||
            "Unable to cancel order."
        );
      } finally {
        setCancellingOrderId("");
      }
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="orders-page">

        <section className="orders-header">

          <p>
            YOUR PURCHASE HISTORY
          </p>

          <h1>
            My Orders
          </h1>

          <span>
            Loading your orders...
          </span>

        </section>

        <div className="orders-loading">

          <i className="bi bi-arrow-repeat"></i>

          <h2>
            Loading Orders
          </h2>

          <p>
            Please wait while we fetch
            your orders.
          </p>

        </div>

      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="orders-page">

        <section className="orders-header">

          <p>
            YOUR PURCHASE HISTORY
          </p>

          <h1>
            My Orders
          </h1>

          <span>
            Track and manage all your
            orders in one place.
          </span>

        </section>

        <div className="orders-error">

          <div className="empty-cart-icon">
            <i className="bi bi-exclamation-circle"></i>
          </div>

          <h2>
            Unable to Load Orders
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="continue-shopping-btn"
            onClick={() =>
              window.location.reload()
            }
          >
            TRY AGAIN

            <i className="bi bi-arrow-repeat"></i>
          </button>

        </div>

      </main>
    );
  }

  // =========================================================
  // EMPTY
  // =========================================================

  if (orders.length === 0) {
    return (
      <main className="orders-page">

        <section className="orders-header">

          <p>
            YOUR PURCHASE HISTORY
          </p>

          <h1>
            My Orders
          </h1>

          <span>
            Track and manage all your
            orders in one place.
          </span>

        </section>

        <div className="no-orders">

          <div className="empty-cart-icon">
            <i className="bi bi-box-seam"></i>
          </div>

          <h2>
            No Orders Yet
          </h2>

          <p>
            You haven't placed any
            orders yet.
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
  // ORDERS PAGE
  // =========================================================

  return (
    <main className="orders-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="orders-header">

        <p>
          YOUR PURCHASE HISTORY
        </p>

        <h1>
          My Orders
        </h1>

        <span>
          Track and manage all your
          orders in one place.
        </span>

      </section>

      {/* =====================================================
          GLOBAL ERROR
      ===================================================== */}

      {error && (
        <div className="orders-error-inline">

          <i className="bi bi-exclamation-circle"></i>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <i className="bi bi-x-lg"></i>
          </button>

        </div>
      )}

      {/* =====================================================
          ORDERS LIST
      ===================================================== */}

      <section className="orders-list">

        {orders.map((order) => {

          const status =
            order.orderStatus ||
            "Processing";

          const paymentStatus =
            getPaymentStatus(
              order.paymentStatus
            );

          const firstItem =
            order.items?.[0];

          const isCancelling =
            cancellingOrderId ===
            order.orderId;

          const showCancelButton =
            canCancelOrder(
              order
            ) &&
            order.paymentStatus !==
              "paid" &&
            !["upi", "card"].includes(
              order.paymentMethod
            );

          return (
            <article
              className="order-card"
              key={
                order.orderId ||
                order._id
              }
            >

              {/* =================================================
                  ORDER HEADER
              ================================================= */}

              <div className="order-top">

                <div className="order-top-left">

                  <span className="order-label">
                    ORDER ID
                  </span>

                  <h2>
                    {order.orderId ||
                      "—"}
                  </h2>

                </div>

                <div className="order-date">

                  <span className="order-label">
                    ORDER DATE
                  </span>

                  <strong>
                    {formatDate(
                      order.createdAt
                    )}
                  </strong>

                </div>

                <div
                  className={`order-status ${getStatusClass(
                    status
                  )}`}
                >
                  {status}
                </div>

              </div>

              {/* =================================================
                  ORDER BODY
              ================================================= */}

              <div className="order-body">

                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div className="order-products">

                  <div className="order-section-title">

                    <i className="bi bi-bag-check"></i>

                    <span>
                      Ordered Products
                    </span>

                  </div>

                  {Array.isArray(
                    order.items
                  ) &&
                    order.items.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          className="order-product"
                          key={`${order.orderId}-${item.productId}-${index}`}
                        >

                          <Link
                            to={`/product/${item.productId}`}
                            className="order-product-image"
                          >

                            <img
                              src={
                                item.image ||
                                "https://via.placeholder.com/120?text=Product"
                              }
                              alt={
                                item.name ||
                                "Product"
                              }
                              onError={(
                                e
                              ) => {
                                e.currentTarget.onerror =
                                  null;

                                e.currentTarget.src =
                                  "https://via.placeholder.com/120?text=Product";
                              }}
                            />

                          </Link>

                          <div className="order-product-info">

                            <h3>

                              <Link
                                to={`/product/${item.productId}`}
                              >
                                {item.name ||
                                  "Product"}
                              </Link>

                            </h3>

                            <div className="order-product-meta">

                              <span>
                                <strong>
                                  Qty:
                                </strong>{" "}
                                {Number(
                                  item.quantity ||
                                    0
                                )}
                              </span>

                              <span>
                                <strong>
                                  Price:
                                </strong>{" "}
                                $
                                {Number(
                                  item.price ||
                                    0
                                ).toFixed(
                                  2
                                )}
                              </span>

                              <span>
                                <strong>
                                  Size:
                                </strong>{" "}
                                {item.size ||
                                  "Default"}
                              </span>

                              <span>
                                <strong>
                                  Color:
                                </strong>{" "}
                                {item.color ||
                                  "Default"}
                              </span>

                            </div>

                          </div>

                          <div className="order-product-total">

                            <span>
                              Item Total
                            </span>

                            <strong>
                              $
                              {(
                                Number(
                                  item.price ||
                                    0
                                ) *
                                Number(
                                  item.quantity ||
                                    0
                                )
                              ).toFixed(
                                2
                              )}
                            </strong>

                          </div>

                        </div>
                      )
                    )}

                </div>

                {/* =================================================
                    ORDER TOTAL
                ================================================= */}

                <div className="order-total">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    $
                    {Number(
                      order.total ||
                        0
                    ).toFixed(2)}
                  </strong>

                </div>

              </div>

              {/* =================================================
                  ORDER INFORMATION GRID
              ================================================= */}

              <div className="order-info-grid">

                {/* PAYMENT */}

                <div className="order-info-box">

                  <div className="order-info-icon">
                    <i className="bi bi-credit-card"></i>
                  </div>

                  <div>

                    <span>
                      Payment Method
                    </span>

                    <strong>
                      {getPaymentName(
                        order.paymentMethod
                      )}
                    </strong>

                  </div>

                </div>

                {/* PAYMENT STATUS */}

                <div className="order-info-box">

                  <div className="order-info-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>

                  <div>

                    <span>
                      Payment Status
                    </span>

                    <strong
                      className={`payment-status ${
                        String(
                          order.paymentStatus ||
                            ""
                        ).toLowerCase()
                      }`}
                    >
                      {paymentStatus}
                    </strong>

                  </div>

                </div>

                {/* COURIER */}

                <div className="order-info-box">

                  <div className="order-info-icon">
                    <i className="bi bi-truck"></i>
                  </div>

                  <div>

                    <span>
                      Courier
                    </span>

                    <strong>
                      {order.courier ||
                        "Delhivery"}
                    </strong>

                  </div>

                </div>

                {/* TRACKING */}

                <div className="order-info-box">

                  <div className="order-info-icon">
                    <i className="bi bi-upc-scan"></i>
                  </div>

                  <div>

                    <span>
                      Tracking Number
                    </span>

                    <strong>
                      {order.trackingNumber ||
                        "Pending"}
                    </strong>

                  </div>

                </div>

                {/* LOCATION */}

                <div className="order-info-box">

                  <div className="order-info-icon">
                    <i className="bi bi-geo-alt"></i>
                  </div>

                  <div>

                    <span>
                      Current Location
                    </span>

                    <strong>
                      {order.currentLocation ||
                        "—"}
                    </strong>

                  </div>

                </div>

                {/* EXPECTED DELIVERY */}

                <div className="order-info-box">

                  <div className="order-info-icon">
                    <i className="bi bi-calendar-check"></i>
                  </div>

                  <div>

                    <span>
                      Expected Delivery
                    </span>

                    <strong>
                      {order.expectedDelivery ||
                        "—"}
                    </strong>

                  </div>

                </div>

              </div>

              {/* =================================================
                  DELIVERY ADDRESS
              ================================================= */}

              {order.customer && (
                <div className="order-address-box">

                  <div className="order-section-title">

                    <i className="bi bi-geo-alt"></i>

                    <span>
                      Delivery Address
                    </span>

                  </div>

                  <p>
                    <strong>
                      {`${order.customer.firstName || ""} ${
                        order.customer.lastName || ""
                      }`.trim()}
                    </strong>
                  </p>

                  <p>
                    {order.customer.address ||
                      ""}
                  </p>

                  <p>
                    {[
                      order.customer.city,
                      order.customer.state,
                      order.customer.pincode,
                    ]
                      .filter(Boolean)
                      .join(
                        ", "
                      )}
                  </p>

                  <p>
                    <i className="bi bi-telephone"></i>{" "}
                    {order.customer.phone ||
                      "—"}
                  </p>

                </div>
              )}

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="order-bottom">

                {firstItem && (
                  <Link
                    to={`/product/${firstItem.productId}`}
                    className="order-action"
                  >
                    <i className="bi bi-box"></i>

                    View Product
                  </Link>
                )}

                <Link
                  to={`/track-order/${order.orderId}`}
                  className="order-action outline"
                >
                  <i className="bi bi-truck"></i>

                  Track Order
                </Link>

                {showCancelButton && (
                  <button
                    type="button"
                    className="order-action cancel"
                    disabled={
                      isCancelling
                    }
                    onClick={() =>
                      handleCancelOrder(
                        order
                      )
                    }
                  >

                    <i
                      className={
                        isCancelling
                          ? "bi bi-arrow-repeat"
                          : "bi bi-x-circle"
                      }
                    ></i>

                    {isCancelling
                      ? "Cancelling..."
                      : "Cancel Order"}

                  </button>
                )}

              </div>

            </article>
          );
        })}

      </section>

      {/* =====================================================
          CONTINUE SHOPPING
      ===================================================== */}

      <div className="orders-shopping">

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

export default Orders;