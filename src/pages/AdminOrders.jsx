import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState("");

  // =========================================================
  // ORDER STATUSES
  // =========================================================

  const statuses = [
    "Processing",
    "Packed",
    "Shipped",
    "In Transit",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem(
      "shopease_token"
    );
  };

  // =========================================================
  // LOAD ALL ORDERS
  // =========================================================

  const loadOrders = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "http://localhost:5000/api/admin/orders",
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

      // =========================
      // SESSION EXPIRED
      // =========================

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

        navigate("/login");
        return;
      }

      // =========================
      // NOT ADMIN
      // =========================

      if (
        response.status ===
        403
      ) {
        setError(
          "Admin access required."
        );

        return;
      }

      // =========================
      // API ERROR
      // =========================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load orders."
        );
      }

      setOrders(
        Array.isArray(
          data.orders
        )
          ? data.orders
          : []
      );
    } catch (err) {
      console.error(
        "Admin orders error:",
        err
      );

      setError(
        err.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadOrders();
  }, []);

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  const updateStatus =
    async (
      orderId,
      status
    ) => {
      const token =
        getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setUpdatingId(
          orderId
        );

        setError("");

        const response =
          await fetch(
            `http://localhost:5000/api/admin/orders/${orderId}/status`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                status,
              }),
            }
          );

        const data =
          await response.json();

        // =========================
        // SESSION EXPIRED
        // =========================

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

          navigate("/login");
          return;
        }

        // =========================
        // NOT ADMIN
        // =========================

        if (
          response.status ===
          403
        ) {
          setError(
            "Admin access required."
          );

          return;
        }

        // =========================
        // API ERROR
        // =========================

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to update order."
          );
        }

        // =========================
        // UPDATE LOCAL ORDER
        // =========================

        setOrders(
          (prev) =>
            prev.map(
              (order) => {
                if (
                  order.orderId !==
                  orderId
                ) {
                  return order;
                }

                return {
                  ...order,

                  orderStatus:
                    data.order
                      ?.orderStatus ||
                    status,

                  trackingHistory:
                    data.order
                      ?.trackingHistory ||
                    order.trackingHistory,

                  currentLocation:
                    data.order
                      ?.currentLocation ||
                    order.currentLocation,

                  expectedDelivery:
                    data.order
                      ?.expectedDelivery ||
                    order.expectedDelivery,
                };
              }
            )
        );
      } catch (err) {
        console.error(
          "Status update error:",
          err
        );

        setError(
          err.message ||
            "Unable to update order."
        );
      } finally {
        setUpdatingId("");
      }
    };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (
    date
  ) => {
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
  // PAYMENT METHOD
  // =========================================================

  const paymentName = (
    method
  ) => {
    if (
      method === "cod"
    ) {
      return "Cash on Delivery";
    }

    if (
      method === "upi"
    ) {
      return "UPI";
    }

    if (
      method === "card"
    ) {
      return "Card";
    }

    return (
      method ||
      "Unknown"
    );
  };

  // =========================================================
  // PAYMENT STATUS
  // =========================================================

  const paymentStatusName =
    (status) => {
      if (!status) {
        return "Unknown";
      }

      const value =
        String(
          status
        ).toLowerCase();

      if (
        value === "paid"
      ) {
        return "Paid";
      }

      if (
        value === "pending"
      ) {
        return "Pending";
      }

      if (
        value === "failed"
      ) {
        return "Failed";
      }

      return status;
    };

  // =========================================================
  // CUSTOMER NAME
  // =========================================================

  const getCustomerName =
    (order) => {
      const userName =
        order?.user?.name;

      if (
        userName &&
        String(
          userName
        ).trim()
      ) {
        return String(
          userName
        ).trim();
      }

      const firstName =
        order?.customer
          ?.firstName || "";

      const lastName =
        order?.customer
          ?.lastName || "";

      const fullName =
        `${firstName} ${lastName}`
          .trim();

      return (
        fullName ||
        "Customer"
      );
    };

  // =========================================================
  // CUSTOMER EMAIL
  // =========================================================

  const getCustomerEmail =
    (order) => {
      return (
        order?.user?.email ||
        order?.customer?.email ||
        "—"
      );
    };

  // =========================================================
  // CUSTOMER PHONE
  // =========================================================

  const getCustomerPhone =
    (order) => {
      return (
        order?.customer?.phone ||
        order?.user?.phone ||
        "—"
      );
    };

  // =========================================================
  // CUSTOMER CITY
  // =========================================================

  const getCustomerCity =
    (order) => {
      return (
        order?.customer?.city ||
        order?.user?.city ||
        "—"
      );
    };

  // =========================================================
  // TOTAL
  // =========================================================

  const getOrderTotal = (
    order
  ) => {
    const total =
      Number(
        order?.total || 0
      );

    return total.toFixed(
      2
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-orders-page">

        <section className="admin-orders-header">

          <div>

            <p>
              ADMIN PANEL
            </p>

            <h1>
              Order Management
            </h1>

            <span>
              Loading orders...
            </span>

          </div>

        </section>

        <div className="admin-loading">

          <i className="bi bi-arrow-repeat"></i>

          <h2>
            Loading Orders
          </h2>

          <p>
            Please wait...
          </p>

        </div>

      </main>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <main className="admin-orders-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="admin-orders-header">

        <div>

          <p>
            ADMIN PANEL
          </p>

          <h1>
            Order Management
          </h1>

          <span>
            Manage customer orders and
            shipment status.
          </span>

        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={
            loadOrders
          }
        >
          <i className="bi bi-arrow-repeat"></i>

          Refresh
        </button>

      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-error">

          <i className="bi bi-exclamation-circle"></i>

          <span>
            {error}
          </span>

        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="admin-order-stats">

        {/* TOTAL */}

        <div className="admin-stat-card">

          <i className="bi bi-box-seam"></i>

          <div>

            <strong>
              {orders.length}
            </strong>

            <span>
              Total Orders
            </span>

          </div>

        </div>

        {/* PROCESSING */}

        <div className="admin-stat-card">

          <i className="bi bi-clock-history"></i>

          <div>

            <strong>
              {
                orders.filter(
                  (order) =>
                    order.orderStatus ===
                    "Processing"
                ).length
              }
            </strong>

            <span>
              Processing
            </span>

          </div>

        </div>

        {/* SHIPMENT */}

        <div className="admin-stat-card">

          <i className="bi bi-truck"></i>

          <div>

            <strong>
              {
                orders.filter(
                  (order) =>
                    [
                      "Shipped",
                      "In Transit",
                      "Out for Delivery",
                    ].includes(
                      order.orderStatus
                    )
                ).length
              }
            </strong>

            <span>
              In Shipment
            </span>

          </div>

        </div>

        {/* DELIVERED */}

        <div className="admin-stat-card">

          <i className="bi bi-check-circle"></i>

          <div>

            <strong>
              {
                orders.filter(
                  (order) =>
                    order.orderStatus ===
                    "Delivered"
                ).length
              }
            </strong>

            <span>
              Delivered
            </span>

          </div>

        </div>

      </section>

      {/* =====================================================
          ORDERS
      ===================================================== */}

      <section className="admin-orders-list">

        {orders.length ===
        0 ? (

          <div className="admin-empty">

            <i className="bi bi-box-seam"></i>

            <h2>
              No Orders Found
            </h2>

            <p>
              There are no customer orders
              in the database yet.
            </p>

          </div>

        ) : (

          orders.map(
            (order) => {

              const currentStatus =
                order.orderStatus ||
                "Processing";

              const isUpdating =
                updatingId ===
                order.orderId;

              return (
                <article
                  className="admin-order-card"
                  key={
                    order.orderId
                  }
                >

                  {/* =================================================
                      TOP
                  ================================================= */}

                  <div className="admin-order-top">

                    <div>

                      <span>
                        ORDER ID
                      </span>

                      <h2>
                        {
                          order.orderId
                        }
                      </h2>

                    </div>

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
                        CUSTOMER
                      </span>

                      <strong>
                        {getCustomerName(
                          order
                        )}
                      </strong>

                    </div>

                    <div>

                      <span>
                        TOTAL
                      </span>

                      <strong>
                        $
                        {getOrderTotal(
                          order
                        )}
                      </strong>

                    </div>

                  </div>

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <div className="admin-order-content">

                    {/* CUSTOMER */}

                    <div className="admin-customer-box">

                      <h3>
                        Customer
                      </h3>

                      <p>

                        <i className="bi bi-person"></i>

                        {getCustomerName(
                          order
                        )}

                      </p>

                      <p>

                        <i className="bi bi-envelope"></i>

                        {getCustomerEmail(
                          order
                        )}

                      </p>

                      <p>

                        <i className="bi bi-telephone"></i>

                        {getCustomerPhone(
                          order
                        )}

                      </p>

                      <p>

                        <i className="bi bi-geo-alt"></i>

                        {getCustomerCity(
                          order
                        )}

                      </p>

                    </div>

                    {/* SHIPPING */}

                    <div className="admin-shipping-box">

                      <h3>
                        Shipment
                      </h3>

                      <p>

                        <span>
                          Courier
                        </span>

                        <strong>
                          {
                            order.courier ||
                            "Delhivery"
                          }
                        </strong>

                      </p>

                      <p>

                        <span>
                          Tracking
                        </span>

                        <strong>
                          {
                            order.trackingNumber ||
                            "Pending"
                          }
                        </strong>

                      </p>

                      <p>

                        <span>
                          Location
                        </span>

                        <strong>
                          {
                            order.currentLocation ||
                            "—"
                          }
                        </strong>

                      </p>

                      <p>

                        <span>
                          Payment
                        </span>

                        <strong>
                          {paymentName(
                            order.paymentMethod
                          )}
                        </strong>

                      </p>

                      <p>

                        <span>
                          Payment Status
                        </span>

                        <strong>
                          {paymentStatusName(
                            order.paymentStatus
                          )}
                        </strong>

                      </p>

                    </div>

                    {/* STATUS */}

                    <div className="admin-status-box">

                      <h3>
                        Order Status
                      </h3>

                      <select
                        value={
                          currentStatus
                        }
                        disabled={
                          isUpdating
                        }
                        onChange={(e) =>
                          updateStatus(
                            order.orderId,
                            e.target.value
                          )
                        }
                      >

                        {statuses.map(
                          (
                            status
                          ) => (
                            <option
                              key={
                                status
                              }
                              value={
                                status
                              }
                            >
                              {
                                status
                              }
                            </option>
                          )
                        )}

                      </select>

                      {isUpdating && (
                        <small>
                          Updating...
                        </small>
                      )}

                      <Link
                        to={`/track-order/${order.orderId}`}
                        className="admin-track-btn"
                      >

                        <i className="bi bi-truck"></i>

                        View Tracking

                      </Link>

                    </div>

                  </div>

                  {/* =================================================
                      ITEMS
                  ================================================= */}

                  <div className="admin-order-items">

                    <h3>
                      Products
                    </h3>

                    <div>

                      {Array.isArray(
                        order.items
                      ) &&
                        order.items.map(
                          (
                            item,
                            index
                          ) => {

                            const itemTotal =
                              Number(
                                item?.price ||
                                  0
                              ) *
                              Number(
                                item?.quantity ||
                                  0
                              );

                            return (
                              <div
                                className="admin-order-item"
                                key={`${order.orderId}-${index}`}
                              >

                                <img
                                  src={
                                    item?.image ||
                                    "https://via.placeholder.com/80?text=Product"
                                  }
                                  alt={
                                    item?.name ||
                                    "Product"
                                  }
                                  onError={(
                                    e
                                  ) => {
                                    e.currentTarget.onerror =
                                      null;

                                    e.currentTarget.src =
                                      "https://via.placeholder.com/80?text=Product";
                                  }}
                                />

                                <div>

                                  <strong>
                                    {
                                      item?.name ||
                                      "Product"
                                    }
                                  </strong>

                                  <span>
                                    Qty:{" "}
                                    {
                                      item?.quantity ||
                                      0
                                    }
                                  </span>

                                </div>

                                <strong>
                                  $
                                  {itemTotal.toFixed(
                                    2
                                  )}
                                </strong>

                              </div>
                            );
                          }
                        )}

                    </div>

                  </div>

                </article>
              );
            }
          )

        )}

      </section>

    </main>
  );
}

export default AdminOrders;