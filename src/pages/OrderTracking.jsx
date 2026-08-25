import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // =========================================================
  // TRACKING STEPS
  // =========================================================

  const steps = [
    "Order Placed",
    "Order Confirmed",
    "Order Packed",
    "Shipped",
    "In Transit",
    "Out for Delivery",
    "Delivered",
  ];

  // =========================================================
  // TRACKING HISTORY ICON
  // =========================================================

  const getHistoryIcon = (title) => {
    switch (title) {
      case "Order Placed":
        return "bi bi-bag-check";

      case "Order Confirmed":
        return "bi bi-check-circle";

      case "Order Packed":
        return "bi bi-box-seam";

      case "Shipped":
        return "bi bi-truck";

      case "In Transit":
        return "bi bi-signpost-2";

      case "Out for Delivery":
        return "bi bi-bicycle";

      case "Delivered":
        return "bi bi-house-check";

      case "Order Cancelled":
        return "bi bi-x-lg";

      default:
        return "bi bi-clock";
    }
  };

  // =========================================================
  // PAYMENT TEXT
  // =========================================================

  const getPaymentText = (method) => {
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
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

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
  // TIME FORMAT
  // =========================================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // CAN CANCEL
  // =========================================================

  const canCancelOrder = (
    orderData = order
  ) => {
    if (!orderData) {
      return false;
    }

    const allowedStatuses = [
      "Processing",
      "Packed",
    ];

    const statusAllowed =
      allowedStatuses.includes(
        orderData.orderStatus
      );

    const paidRazorpayOrder =
      orderData.paymentStatus ===
        "paid" ||
      ["upi", "card"].includes(
        orderData.paymentMethod
      );

    return (
      statusAllowed &&
      !paidRazorpayOrder
    );
  };

  // =========================================================
  // ENSURE CANCELLED HISTORY
  // =========================================================

  const ensureCancelledHistory = (
    orderData
  ) => {
    if (!orderData) {
      return orderData;
    }

    const history = Array.isArray(
      orderData.trackingHistory
    )
      ? [...orderData.trackingHistory]
      : [];

    const hasCancelledEvent =
      history.some(
        (item) =>
          item?.title ===
          "Order Cancelled"
      );

    if (
      orderData.orderStatus ===
        "Cancelled" &&
      !hasCancelledEvent
    ) {
      const cancelledAt =
        orderData.updatedAt ||
        orderData.createdAt ||
        new Date();

      history.push({
        title:
          "Order Cancelled",

        location:
          "ShopEase",

        date:
          formatDate(cancelledAt),

        time:
          formatTime(cancelledAt),

        completed: true,
      });
    }

    return {
      ...orderData,
      trackingHistory:
        history,
    };
  };

  // =========================================================
  // CURRENT TRACKING STEP
  // =========================================================

  const getCurrentIndex = (
    orderData
  ) => {
    if (
      orderData?.orderStatus ===
      "Cancelled"
    ) {
      return -1;
    }

    const history = Array.isArray(
      orderData?.trackingHistory
    )
      ? orderData.trackingHistory
      : [];

    let latestCompleted = -1;

    history.forEach((item) => {
      if (!item?.completed) {
        return;
      }

      const index =
        steps.indexOf(
          item.title
        );

      if (
        index >
        latestCompleted
      ) {
        latestCompleted =
          index;
      }
    });

    if (
      latestCompleted >= 0
    ) {
      return latestCompleted;
    }

    switch (
      orderData?.orderStatus
    ) {
      case "Processing":
        return 0;

      case "Packed":
        return 2;

      case "Shipped":
        return 3;

      case "In Transit":
        return 4;

      case "Out for Delivery":
        return 5;

      case "Delivered":
        return 6;

      default:
        return 0;
    }
  };

  // =========================================================
  // LOAD ORDER
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const fetchOrder = async () => {
      const token =
        localStorage.getItem(
          "shopease_token"
        );

      if (!token) {
        navigate("/login", {
          state: {
            from: `/track-order/${orderId}`,
          },
        });

        return;
      }

      if (!orderId) {
        if (mounted) {
          setError(
            "Order ID is missing."
          );

          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `http://localhost:5000/api/orders/${encodeURIComponent(
              orderId
            )}`,
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

        // =====================================================
        // SESSION EXPIRED
        // =====================================================

        if (
          response.status ===
          401
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
              from: `/track-order/${orderId}`,
            },
          });

          return;
        }

        // =====================================================
        // NOT FOUND
        // =====================================================

        if (
          response.status ===
          404
        ) {
          if (mounted) {
            setError(
              "This order was not found."
            );
          }

          return;
        }

        // =====================================================
        // API ERROR
        // =====================================================

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load order tracking."
          );
        }

        // =====================================================
        // PREPARE ORDER
        // =====================================================

        const loadedOrder =
          ensureCancelledHistory(
            data.order || null
          );

        if (mounted) {
          setOrder(
            loadedOrder
          );
        }
      } catch (err) {
        console.error(
          "Order tracking error:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Unable to load order tracking."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      mounted = false;
    };
  }, [orderId, navigate]);

  // =========================================================
  // CANCEL ORDER
  // =========================================================

  const handleCancelOrder =
    async () => {
      if (!order) {
        return;
      }

      if (
        !canCancelOrder()
      ) {
        alert(
          "This order can no longer be cancelled."
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
            from: `/track-order/${orderId}`,
          },
        });

        return;
      }

      try {
        setCancelling(true);
        setError("");

        const response =
          await fetch(
            `http://localhost:5000/api/orders/${encodeURIComponent(
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
          response.status ===
          401
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
              from: `/track-order/${orderId}`,
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
        // BUILD UPDATED HISTORY
        // =====================================================

        const serverOrder =
          data.order || {};

        const previousHistory =
          Array.isArray(
            order.trackingHistory
          )
            ? order.trackingHistory
            : [];

        let updatedHistory =
          Array.isArray(
            serverOrder.trackingHistory
          )
            ? [
                ...serverOrder.trackingHistory,
              ]
            : [
                ...previousHistory,
              ];

        const hasCancelledEvent =
          updatedHistory.some(
            (item) =>
              item?.title ===
              "Order Cancelled"
          );

        if (
          !hasCancelledEvent
        ) {
          const now =
            new Date();

          updatedHistory.push({
            title:
              "Order Cancelled",

            location:
              "ShopEase",

            date:
              formatDate(now),

            time:
              formatTime(now),

            completed:
              true,
          });
        }

        // =====================================================
        // UPDATE ORDER UI
        // =====================================================

        setOrder({
          ...order,

          ...serverOrder,

          orderStatus:
            serverOrder.status ||
            serverOrder.orderStatus ||
            "Cancelled",

          currentLocation:
            serverOrder.currentLocation ||
            "Order Cancelled",

          trackingNumber:
            serverOrder.trackingNumber ??
            "",

          expectedDelivery:
            serverOrder.expectedDelivery ??
            "",

          trackingHistory:
            updatedHistory,
        });

        alert(
          "Order cancelled successfully."
        );
      } catch (err) {
        console.error(
          "Cancel order error:",
          err
        );

        setError(
          err.message ||
            "Unable to cancel order."
        );
      } finally {
        setCancelling(false);
      }
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="tracking-page">

        <section className="tracking-header">

          <p>
            ORDER TRACKING
          </p>

          <h1>
            Track Your Order
          </h1>

          <span>
            Loading your shipment details...
          </span>

        </section>

        <div className="tracking-loading">

          <i className="bi bi-arrow-repeat"></i>

          <h2>
            Loading Tracking
          </h2>

          <p>
            Please wait while we fetch
            your order details.
          </p>

        </div>

      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (
    error ||
    !order
  ) {
    return (
      <main className="tracking-page">

        <section className="tracking-header">

          <p>
            ORDER TRACKING
          </p>

          <h1>
            Track Your Order
          </h1>

          <span>
            Order ID:{" "}
            {orderId ||
              "Unknown"}
          </span>

        </section>

        <div className="tracking-error">

          <div className="tracking-error-icon">

            <i className="bi bi-box-seam"></i>

          </div>

          <h2>
            Order Not Found
          </h2>

          <p>
            {error ||
              "We could not find this order."}
          </p>

          <Link
            to="/orders"
            className="tracking-back-btn"
          >
            <i className="bi bi-arrow-left"></i>

            Back to Orders
          </Link>

        </div>

      </main>
    );
  }

  // =========================================================
  // CURRENT DATA
  // =========================================================

  const currentIndex =
    getCurrentIndex(
      order
    );

  const paymentText =
    getPaymentText(
      order.paymentMethod
    );

  const status =
    order.orderStatus ||
    "Processing";

  const showCancel =
    canCancelOrder(
      order
    );

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="tracking-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="tracking-header">

        <p>
          ORDER TRACKING
        </p>

        <h1>
          Track Your Order
        </h1>

        <span>
          Order ID:{" "}
          {order.orderId}
        </span>

      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="tracking-inline-error">

          <i className="bi bi-exclamation-circle"></i>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>

        </div>
      )}

      {/* =====================================================
          INFO GRID
      ===================================================== */}

      <section className="tracking-info-grid">

        {/* LOCATION */}

        <div className="tracking-info-card">

          <span>
            CURRENT LOCATION
          </span>

          <strong>
            <i className="bi bi-geo-alt"></i>

            {order.currentLocation ||
              "Processing at warehouse"}
          </strong>

        </div>

        {/* COURIER */}

        <div className="tracking-info-card">

          <span>
            SHIPMENT PARTNER
          </span>

          <strong>
            <i className="bi bi-truck"></i>

            {order.courier ||
              "Delhivery"}
          </strong>

        </div>

        {/* TRACKING NUMBER */}

        <div className="tracking-info-card">

          <span>
            TRACKING NUMBER
          </span>

          <strong>
            <i className="bi bi-upc-scan"></i>

            {order.trackingNumber ||
              "Not assigned yet"}
          </strong>

        </div>

        {/* EXPECTED DELIVERY */}

        <div className="tracking-info-card">

          <span>
            EXPECTED DELIVERY
          </span>

          <strong>
            <i className="bi bi-calendar-check"></i>

            {order.expectedDelivery ||
              "To be confirmed"}
          </strong>

        </div>

      </section>

      {/* =====================================================
          MAIN TRACKING CARD
      ===================================================== */}

      <section className="tracking-card">

        {/* TITLE */}

        <div className="tracking-card-title">

          <div>

            <p>
              SHIPMENT STATUS
            </p>

            <h2>
              {status}
            </h2>

          </div>

          {status !==
            "Cancelled" && (
            <span className="tracking-live">

              <span></span>

              LIVE STATUS

            </span>
          )}

        </div>

        {/* ===================================================
            META
        =================================================== */}

        <div className="tracking-order-meta">

          <div>

            <span>
              ORDER DATE
            </span>

            <strong>
              {formatDate(
                order.createdAt
              )}
            </strong>

          </div>

          <div>

            <span>
              PAYMENT
            </span>

            <strong>
              {paymentText}
            </strong>

          </div>

          <div>

            <span>
              ORDER TOTAL
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

        {/* ===================================================
            NORMAL PROGRESS
        =================================================== */}

        {status !==
          "Cancelled" && (
          <div className="tracking-progress">

            {steps.map(
              (
                step,
                index
              ) => {

                const completed =
                  index <=
                  currentIndex;

                const active =
                  index ===
                  currentIndex;

                return (
                  <div
                    key={step}
                    className={`tracking-progress-step ${
                      completed
                        ? "completed"
                        : ""
                    } ${
                      active
                        ? "active"
                        : ""
                    }`}
                  >

                    <div className="tracking-circle">

                      <i
                        className={
                          completed
                            ? "bi bi-check-lg"
                            : "bi bi-circle"
                        }
                      ></i>

                    </div>

                    <span>
                      {step}
                    </span>

                  </div>
                );
              }
            )}

          </div>
        )}

        {/* ===================================================
            CANCELLED BANNER
        =================================================== */}

        {status ===
          "Cancelled" && (
          <div className="tracking-cancelled-banner">

            <i className="bi bi-x-circle-fill"></i>

            <div>

              <strong>
                Order Cancelled
              </strong>

              <span>
                This order has been cancelled successfully.
              </span>

            </div>

          </div>
        )}

        {/* ===================================================
            TRACKING HISTORY
        =================================================== */}

        <div className="tracking-history">

          <div className="tracking-history-heading">

            <p>
              SHIPMENT ACTIVITY
            </p>

            <h2>
              Tracking History
            </h2>

          </div>

          {Array.isArray(
            order.trackingHistory
          ) &&
          order.trackingHistory.length >
            0 ? (

            order.trackingHistory.map(
              (
                item,
                index
              ) => {

                const isCancelled =
                  item.title ===
                  "Order Cancelled";

                const iconClass =
                  getHistoryIcon(
                    item.title
                  );

                return (
                  <div
                    key={`${item.title}-${index}`}
                    className={`tracking-history-item ${
                      item.completed
                        ? "completed"
                        : ""
                    } ${
                      isCancelled
                        ? "cancelled"
                        : ""
                    }`}
                  >

                    {/* LEFT */}

                    <div className="tracking-history-line">

                      <div
                        className={`tracking-history-dot ${
                          isCancelled
                            ? "cancelled-dot"
                            : item.completed
                            ? "completed-dot"
                            : "pending-dot"
                        }`}
                      >

                        <i
                          className={
                            item.completed ||
                            isCancelled
                              ? iconClass
                              : "bi bi-clock"
                          }
                        ></i>

                      </div>

                      {index <
                        order
                          .trackingHistory
                          .length -
                          1 && (
                        <span></span>
                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="tracking-history-content">

                      <div>

                        <h3>
                          {item.title}
                        </h3>

                        <p>

                          <i className="bi bi-geo-alt"></i>

                          {item.location ||
                            "Location unavailable"}

                        </p>

                      </div>

                      <div className="tracking-time">

                        <strong>
                          {item.date ||
                            "Pending"}
                        </strong>

                        {item.time && (
                          <span>
                            {item.time}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>
                );
              }
            )

          ) : (

            <div className="tracking-no-history">

              <i className="bi bi-info-circle"></i>

              Tracking history is not
              available yet.

            </div>

          )}

        </div>

        {/* ===================================================
            CUSTOMER INFORMATION
        =================================================== */}

        {order.customer && (
          <div className="tracking-customer-info">

            {/* ADDRESS */}

            <div className="tracking-customer-card">

              <div className="tracking-customer-icon">

                <i className="bi bi-geo-alt-fill"></i>

              </div>

              <div className="tracking-customer-content">

                <span>
                  DELIVERY ADDRESS
                </span>

                <strong>
                  {`${order.customer.firstName || ""} ${
                    order.customer.lastName || ""
                  }`.trim() ||
                    "Customer"}
                </strong>

                <p>
                  {order.customer.address ||
                    "—"}
                </p>

                <p>
                  {[
                    order.customer.city,
                    order.customer.state,
                    order.customer.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>

              </div>

            </div>

            {/* CONTACT */}

            <div className="tracking-customer-card">

              <div className="tracking-customer-icon">

                <i className="bi bi-telephone-fill"></i>

              </div>

              <div className="tracking-customer-content">

                <span>
                  CONTACT
                </span>

                <strong>
                  {order.customer.phone ||
                    "—"}
                </strong>

                <p>
                  {order.customer.email ||
                    "—"}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ===================================================
            CANCEL ORDER
        =================================================== */}

        {showCancel && (
          <div className="tracking-cancel-section">

            <div className="tracking-cancel-content">

              <div className="tracking-cancel-icon">

                <i className="bi bi-x-circle-fill"></i>

              </div>

              <div>

                <span>
                  CANCEL ORDER
                </span>

                <strong>
                  Need to cancel this order?
                </strong>

                <p>
                  You can cancel this order
                  before it is shipped.
                </p>

              </div>

            </div>

            <button
              type="button"
              className="tracking-cancel-btn"
              disabled={cancelling}
              onClick={
                handleCancelOrder
              }
            >

              <i
                className={
                  cancelling
                    ? "bi bi-arrow-repeat"
                    : "bi bi-x-circle"
                }
              ></i>

              {cancelling
                ? "Cancelling..."
                : "Cancel Order"}

            </button>

          </div>
        )}

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="tracking-actions">

          <Link
            to="/orders"
            className="tracking-back-btn"
          >
            <i className="bi bi-arrow-left"></i>

            Back to Orders
          </Link>

          <Link
            to="/products"
            className="tracking-shop-btn"
          >
            Continue Shopping

            <i className="bi bi-arrow-right"></i>
          </Link>

        </div>

      </section>

    </main>
  );
}

export default OrderTracking;