import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // LOAD ORDERS
  // =========================

  useEffect(() => {
    const loadDashboard = async () => {
      const token =
        localStorage.getItem(
          "shopease_token"
        );

      if (!token) {
        navigate("/login");
        return;
      }

      try {
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

        if (response.status === 401) {
          localStorage.removeItem(
            "shopease_token"
          );

          localStorage.removeItem(
            "shopease_current_user"
          );

          navigate("/login");
          return;
        }

        if (response.status === 403) {
          setError(
            "Admin access required."
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load dashboard."
          );
        }

        setOrders(
          Array.isArray(data.orders)
            ? data.orders
            : []
        );
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  // =========================
  // STATS
  // =========================

  const stats = useMemo(() => {
    const totalOrders =
      orders.length;

    const pendingOrders =
      orders.filter(
        (order) =>
          order.orderStatus ===
            "Processing" ||
          order.orderStatus ===
            "Packed"
      ).length;

    const shipmentOrders =
      orders.filter((order) =>
        [
          "Shipped",
          "In Transit",
          "Out for Delivery",
        ].includes(
          order.orderStatus
        )
      ).length;

    const deliveredOrders =
      orders.filter(
        (order) =>
          order.orderStatus ===
          "Delivered"
      ).length;

    const revenue =
      orders
        .filter(
          (order) =>
            order.orderStatus !==
            "Cancelled"
        )
        .reduce(
          (sum, order) =>
            sum +
            Number(
              order.total || 0
            ),
          0
        );

    return {
      totalOrders,
      pendingOrders,
      shipmentOrders,
      deliveredOrders,
      revenue,
    };
  }, [orders]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="admin-dashboard-page">
        <section className="admin-dashboard-header">
          <p>ADMIN PANEL</p>

          <h1>
            Dashboard
          </h1>

          <span>
            Loading dashboard...
          </span>
        </section>

        <div className="admin-loading">
          <i className="bi bi-arrow-repeat"></i>

          <h2>
            Loading Dashboard
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
      <main className="admin-dashboard-page">
        <section className="admin-dashboard-header">
          <p>ADMIN PANEL</p>

          <h1>
            Dashboard
          </h1>

          <span>
            Manage your ShopEase store.
          </span>
        </section>

        <div className="admin-error">
          <i className="bi bi-exclamation-circle"></i>

          <span>
            {error}
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="admin-dashboard-header">

        <div>

          <p>
            ADMIN PANEL
          </p>

          <h1>
            Dashboard
          </h1>

          <span>
            Monitor your ShopEase store
            from one place.
          </span>

        </div>

        <Link
          to="/admin/orders"
          className="admin-dashboard-orders-btn"
        >
          <i className="bi bi-box-seam"></i>

          Manage Orders
        </Link>

      </section>


      {/* =========================
          STATS
      ========================= */}

      <section className="admin-dashboard-stats">

        {/* TOTAL ORDERS */}

        <div className="admin-dashboard-stat">

          <div className="admin-dashboard-stat-icon">
            <i className="bi bi-box-seam"></i>
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {stats.totalOrders}
            </strong>
          </div>

        </div>


        {/* PENDING */}

        <div className="admin-dashboard-stat">

          <div className="admin-dashboard-stat-icon">
            <i className="bi bi-clock-history"></i>
          </div>

          <div>
            <span>
              Pending Orders
            </span>

            <strong>
              {stats.pendingOrders}
            </strong>
          </div>

        </div>


        {/* SHIPMENT */}

        <div className="admin-dashboard-stat">

          <div className="admin-dashboard-stat-icon">
            <i className="bi bi-truck"></i>
          </div>

          <div>
            <span>
              In Shipment
            </span>

            <strong>
              {stats.shipmentOrders}
            </strong>
          </div>

        </div>


        {/* DELIVERED */}

        <div className="admin-dashboard-stat">

          <div className="admin-dashboard-stat-icon">
            <i className="bi bi-check-circle"></i>
          </div>

          <div>
            <span>
              Delivered
            </span>

            <strong>
              {stats.deliveredOrders}
            </strong>
          </div>

        </div>

      </section>


      {/* =========================
          REVENUE
      ========================= */}

      <section className="admin-dashboard-revenue">

        <div>

          <p>
            TOTAL REVENUE
          </p>

          <h2>
            $
            {stats.revenue.toFixed(2)}
          </h2>

          <span>
            Based on non-cancelled orders
          </span>

        </div>

        <div className="admin-dashboard-revenue-icon">
          <i className="bi bi-currency-dollar"></i>
        </div>

      </section>


      {/* =========================
          RECENT ORDERS
      ========================= */}

      <section className="admin-dashboard-recent">

        <div className="admin-dashboard-section-head">

          <div>

            <p>
              RECENT ACTIVITY
            </p>

            <h2>
              Recent Orders
            </h2>

          </div>

          <Link
            to="/admin/orders"
          >
            View All
            <i className="bi bi-arrow-right"></i>
          </Link>

        </div>


        {orders.length === 0 ? (

          <div className="admin-empty">

            <i className="bi bi-box-seam"></i>

            <h2>
              No Orders Yet
            </h2>

            <p>
              No customer orders are
              available.
            </p>

          </div>

        ) : (

          <div className="admin-dashboard-order-list">

            {orders
              .slice(0, 5)
              .map((order) => (

                <div
                  className="admin-dashboard-order"
                  key={order.orderId}
                >

                  <div className="admin-dashboard-order-icon">
                    <i className="bi bi-box"></i>
                  </div>

                  <div className="admin-dashboard-order-main">

                    <strong>
                      {order.orderId}
                    </strong>

                    <span>
                      {order.user?.name ||
                        `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim() ||
                        "Customer"}
                    </span>

                  </div>


                  <div className="admin-dashboard-order-status">

                    <span
                      className={`order-status ${
                        String(
                          order.orderStatus ||
                            "Processing"
                        )
                          .toLowerCase()
                          .replaceAll(
                            " ",
                            "-"
                          )
                      }`}
                    >
                      {order.orderStatus ||
                        "Processing"}
                    </span>

                  </div>


                  <strong className="admin-dashboard-order-total">
                    $
                    {Number(
                      order.total || 0
                    ).toFixed(2)}
                  </strong>


                  <Link
                    to={`/track-order/${order.orderId}`}
                    className="admin-dashboard-order-arrow"
                  >
                    <i className="bi bi-arrow-right"></i>
                  </Link>

                </div>

              ))}

          </div>

        )}

      </section>


      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <section className="admin-dashboard-quick">

        <div className="admin-dashboard-section-head">

          <div>

            <p>
              QUICK ACTIONS
            </p>

            <h2>
              Manage Store
            </h2>

          </div>

        </div>


        <div className="admin-dashboard-quick-grid">

          <Link
            to="/admin/orders"
            className="admin-quick-card"
          >
            <i className="bi bi-box-seam"></i>

            <div>
              <strong>
                Manage Orders
              </strong>

              <span>
                View and update orders
              </span>
            </div>

            <i className="bi bi-arrow-right"></i>
          </Link>


          <Link
            to="/products"
            className="admin-quick-card"
          >
            <i className="bi bi-grid"></i>

            <div>
              <strong>
                View Products
              </strong>

              <span>
                Browse your products
              </span>
            </div>

            <i className="bi bi-arrow-right"></i>
          </Link>


          <Link
            to="/profile"
            className="admin-quick-card"
          >
            <i className="bi bi-person"></i>

            <div>
              <strong>
                My Profile
              </strong>

              <span>
                Manage admin account
              </span>
            </div>

            <i className="bi bi-arrow-right"></i>
          </Link>

        </div>

      </section>

    </main>
  );
}

export default AdminDashboard;