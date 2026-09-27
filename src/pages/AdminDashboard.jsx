import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL =
  "https://shopease-backend-txtm.onrender.com";

function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    const token = localStorage.getItem("shopease_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [ordersResponse, productsResponse, usersResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/admin/orders`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_URL}/api/products`, {
            method: "GET",
          }),

          fetch(`${API_URL}/api/admin/users`, {
            method: "GET",
            headers,
          }),
        ]);

      const ordersData = await ordersResponse.json();
      const productsData = await productsResponse.json();
      const usersData = await usersResponse.json();

      if (ordersResponse.status === 401) {
        localStorage.removeItem("shopease_token");
        localStorage.removeItem("shopease_current_user");
        navigate("/login");
        return;
      }

      if (ordersResponse.status === 403) {
        setError("Admin access required.");
        return;
      }

      if (!ordersResponse.ok) {
        throw new Error(
          ordersData.message || "Unable to load orders."
        );
      }

      setOrders(
        Array.isArray(ordersData.orders)
          ? ordersData.orders
          : []
      );

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : Array.isArray(productsData.products)
          ? productsData.products
          : []
      );

      setUsers(
        Array.isArray(usersData.users)
          ? usersData.users
          : []
      );
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err.message || "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const processingOrders = orders.filter((order) =>
      ["Processing", "Packed"].includes(
        order.orderStatus
      )
    ).length;

    const deliveredOrders = orders.filter(
      (order) =>
        order.orderStatus === "Delivered"
    ).length;

    const cancelledOrders = orders.filter(
      (order) =>
        order.orderStatus === "Cancelled"
    ).length;

    const totalSales = orders
      .filter(
        (order) =>
          order.orderStatus !== "Cancelled"
      )
      .reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      );

    const today = new Date();

    const todaysSales = orders
      .filter((order) => {
        if (order.orderStatus === "Cancelled") {
          return false;
        }

        const date = new Date(order.createdAt);

        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      })
      .reduce(
        (sum, order) =>
          sum + Number(order.total || 0),
        0
      );

    const lowStockProducts = products.filter(
      (product) =>
        Number(product.stock || 0) <= 5
    );

    const outOfStock = products.filter(
      (product) =>
        Number(product.stock || 0) <= 0
    ).length;

    return {
      totalOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      totalSales,
      todaysSales,
      lowStockProducts,
      outOfStock,
    };
  }, [orders, products]);

  if (loading) {
    return (
      <main className="shopEase-admin-page">
        <div className="shopEase-admin-loading">
          <div className="shopEase-admin-spinner"></div>
          <h2>Loading Dashboard</h2>
          <p>Please wait...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="shopEase-admin-page">
        <div className="shopEase-admin-error-page">
          <div className="shopEase-admin-error-icon">
            <i className="bi bi-exclamation-triangle"></i>
          </div>

          <h2>Dashboard Unavailable</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={loadDashboard}
          >
            <i className="bi bi-arrow-repeat"></i>
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="shopEase-admin-page">

      {/* SIDEBAR */}

      <aside className="shopEase-admin-sidebar">

        <div className="shopEase-admin-brand">

          <div className="shopEase-admin-brand-logo">
            <i className="bi bi-bag-fill"></i>
          </div>

          <div>
            <strong>
              Shop<span>Ease</span>
            </strong>

            <small>ADMIN CONTROL</small>
          </div>

        </div>

        <div className="shopEase-admin-menu-title">
          MENU
        </div>

        <nav className="shopEase-admin-nav">

          <Link
            to="/admin"
            className="active"
          >
            <i className="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
          </Link>

          <Link to="/admin/orders">
            <i className="bi bi-box-seam"></i>
            <span>Orders</span>

            {orders.length > 0 && (
              <b>{orders.length}</b>
            )}
          </Link>

          <Link to="/admin/products">
            <i className="bi bi-boxes"></i>
            <span>Products</span>
          </Link>

          <Link to="/admin/users">
            <i className="bi bi-people"></i>
            <span>Customers</span>
          </Link>

          <Link to="/admin/products">
            <i className="bi bi-boxes"></i>
            <span>Inventory</span>

            {stats.lowStockProducts.length > 0 && (
              <b className="warning">
                {stats.lowStockProducts.length}
              </b>
            )}
          </Link>

          <Link to="/admin/orders">
            <i className="bi bi-credit-card"></i>
            <span>Payments</span>
          </Link>

          <div className="shopEase-admin-menu-title second">
            STORE
          </div>

          <Link to="/admin/orders">
            <i className="bi bi-bar-chart"></i>
            <span>Analytics</span>
          </Link>

          <Link to="/profile">
            <i className="bi bi-gear"></i>
            <span>Settings</span>
          </Link>

        </nav>

        <div className="shopEase-admin-sidebar-bottom">

          <div className="shopEase-admin-help-box">
            <i className="bi bi-headset"></i>

            <div>
              <strong>Need Help?</strong>
              <span>Admin support</span>
            </div>
          </div>

          <Link
            to="/"
            className="shopEase-admin-logout"
          >
            <i className="bi bi-box-arrow-left"></i>
            Logout / Store
          </Link>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <section className="shopEase-admin-content">

        {/* TOPBAR */}

        <header className="shopEase-admin-topbar">

          <div className="shopEase-admin-mobile-brand">
            <strong>
              Shop<span>Ease</span>
            </strong>

            <small>Admin</small>
          </div>

          <div className="shopEase-admin-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search orders, products, customers..."
            />
          </div>

          <div className="shopEase-admin-top-actions">

            <button
              type="button"
              onClick={loadDashboard}
              title="Refresh dashboard"
            >
              <i className="bi bi-arrow-repeat"></i>
            </button>

            <button
              type="button"
              title="Notifications"
              className="notification"
            >
              <i className="bi bi-bell"></i>

              {orders.length > 0 && (
                <span>{orders.length}</span>
              )}
            </button>

            <div className="shopEase-admin-profile">

              <div className="shopEase-admin-avatar">
                A
              </div>

              <div>
                <strong>Admin</strong>
                <span>ShopEase</span>
              </div>

              <i className="bi bi-chevron-down"></i>

            </div>

          </div>

        </header>


        {/* HEADING */}

        <div className="shopEase-admin-heading">

          <div>
            <span>OVERVIEW</span>

            <h1>Dashboard</h1>

            <p>
              Welcome back. Here's what's happening
              with your ShopEase store today.
            </p>
          </div>

          <div className="shopEase-admin-heading-actions">

            <button
              type="button"
              onClick={loadDashboard}
            >
              <i className="bi bi-arrow-repeat"></i>
              Refresh
            </button>

            <Link to="/admin/products">
              <i className="bi bi-plus-lg"></i>
              Add Product
            </Link>

          </div>

        </div>


        {/* KPI CARDS */}

        <section className="shopEase-admin-kpi-grid">

          <div className="shopEase-admin-kpi purple">

            <div className="kpi-top">
              <span>Today's Sales</span>
              <i className="bi bi-bag-check"></i>
            </div>

            <strong>
              ₹{stats.todaysSales.toFixed(2)}
            </strong>

            <small>
              <i className="bi bi-arrow-up"></i>
              Live order activity
            </small>

            <div className="kpi-decoration"></div>

          </div>


          <div className="shopEase-admin-kpi green">

            <div className="kpi-top">
              <span>Total Sales</span>
              <i className="bi bi-graph-up-arrow"></i>
            </div>

            <strong>
              ₹{stats.totalSales.toFixed(2)}
            </strong>

            <small>
              <i className="bi bi-arrow-up"></i>
              Non-cancelled orders
            </small>

            <div className="kpi-decoration"></div>

          </div>


          <div className="shopEase-admin-kpi orange">

            <div className="kpi-top">
              <span>Total Orders</span>
              <i className="bi bi-box-seam"></i>
            </div>

            <strong>
              {stats.totalOrders}
            </strong>

            <small>
              <i className="bi bi-clock"></i>
              {stats.processingOrders} processing
            </small>

            <div className="kpi-decoration"></div>

          </div>


          <div className="shopEase-admin-kpi blue">

            <div className="kpi-top">
              <span>Total Products</span>
              <i className="bi bi-boxes"></i>
            </div>

            <strong>
              {products.length}
            </strong>

            <small>
              <i className="bi bi-check-circle"></i>
              Active products
            </small>

            <div className="kpi-decoration"></div>

          </div>


          <div className="shopEase-admin-kpi pink">

            <div className="kpi-top">
              <span>Total Customers</span>
              <i className="bi bi-people-fill"></i>
            </div>

            <strong>
              {users.length}
            </strong>

            <small>
              <i className="bi bi-person-plus"></i>
              Registered users
            </small>

            <div className="kpi-decoration"></div>

          </div>


          <div className="shopEase-admin-kpi teal">

            <div className="kpi-top">
              <span>Low Stock Alerts</span>
              <i className="bi bi-exclamation-diamond"></i>
            </div>

            <strong>
              {stats.lowStockProducts.length}
            </strong>

            <small>
              <i className="bi bi-box"></i>
              {stats.outOfStock} out of stock
            </small>

            <div className="kpi-decoration"></div>

          </div>

        </section>


        {/* ANALYTICS */}

        <section className="shopEase-admin-analytics-grid">

          <div className="shopEase-admin-card sales-card">

            <div className="shopEase-admin-card-header">

              <div>
                <span>SALES OVERVIEW</span>
                <h2>Store Overview</h2>
              </div>

              <span className="admin-card-label">
                Current Data
              </span>

            </div>

            <div className="admin-sales-summary">

              <div>
                <i className="bi bi-currency-rupee"></i>

                <span>Total Sales</span>

                <strong>
                  ₹{stats.totalSales.toFixed(2)}
                </strong>
              </div>

              <div>
                <i className="bi bi-cart-check"></i>

                <span>Orders</span>

                <strong>
                  {stats.totalOrders}
                </strong>
              </div>

              <div>
                <i className="bi bi-check2-circle"></i>

                <span>Delivered</span>

                <strong>
                  {stats.deliveredOrders}
                </strong>
              </div>

            </div>

          </div>


          {/* LOW STOCK */}

          <div className="shopEase-admin-card low-stock-card">

            <div className="shopEase-admin-card-header">

              <div>
                <span>ATTENTION REQUIRED</span>
                <h2>Low Stock Alert</h2>
              </div>

              <i className="bi bi-exclamation-triangle"></i>

            </div>

            <div className="low-stock-table">

              {stats.lowStockProducts
                .slice(0, 6)
                .map((product) => (

                  <div key={product._id}>

                    <span>
                      {product.name}
                    </span>

                    <span>
                      {product.category || "Product"}
                    </span>

                    <strong
                      className={
                        Number(product.stock || 0) <= 0
                          ? "critical"
                          : ""
                      }
                    >
                      {Number(product.stock || 0)} left
                    </strong>

                  </div>

                ))}

              {stats.lowStockProducts.length === 0 && (
                <div className="empty-box">
                  All products are well stocked.
                </div>
              )}

            </div>

          </div>

        </section>


        {/* RECENT TRANSACTIONS + CUSTOMERS */}

        <section className="shopEase-admin-bottom-grid">

          <div className="shopEase-admin-card">

            <div className="shopEase-admin-card-header">

              <div>
                <span>RECENT ACTIVITY</span>
                <h2>Recent Transactions</h2>
              </div>

              <Link to="/admin/orders">
                View All
              </Link>

            </div>

            <div className="transactions-list">

              {orders.slice(0, 6).map((order) => (

                <div
                  className="transaction-item"
                  key={order.orderId}
                >

                  <div className="transaction-icon">

                    <i
                      className={
                        order.paymentStatus === "paid"
                          ? "bi bi-check-lg"
                          : "bi bi-clock"
                      }
                    ></i>

                  </div>

                  <div>
                    <strong>
                      {order.orderId}
                    </strong>

                    <span>
                      {order.user?.name ||
                        `${order.customer?.firstName || ""} ${
                          order.customer?.lastName || ""
                        }`.trim() ||
                        "Customer"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      ₹{Number(
                        order.total || 0
                      ).toFixed(2)}
                    </strong>

                    <span>
                      {order.paymentMethod || "Online"}
                    </span>
                  </div>

                  <div>

                    <span className="transaction-status">
                      {order.orderStatus || "Processing"}
                    </span>

                    <small>
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString("en-IN")
                        : ""}
                    </small>

                  </div>

                </div>

              ))}

              {orders.length === 0 && (
                <div className="empty-box">
                  No transactions available.
                </div>
              )}

            </div>

          </div>


          {/* CUSTOMERS */}

          <div className="shopEase-admin-card">

            <div className="shopEase-admin-card-header">

              <div>
                <span>CUSTOMERS</span>
                <h2>Recent Customers</h2>
              </div>

              <Link to="/admin/users">
                View All
              </Link>

            </div>

            <div className="customers-list">

              {users.slice(0, 6).map((user) => (

                <div
                  className="customer-item"
                  key={user._id || user.id}
                >

                  <div className="customer-avatar">
                    {(user.name || "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {user.name || "Customer"}
                    </strong>

                    <span>
                      {user.email || ""}
                    </span>
                  </div>

                </div>

              ))}

              {users.length === 0 && (
                <div className="empty-box">
                  No customers available.
                </div>
              )}

            </div>

          </div>

        </section>

      </section>

    </main>
  );
}

export default AdminDashboard;