import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

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
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "http://localhost:5000/api/admin/dashboard",
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

        navigate("/login");
        return;
      }

      if (
        response.status === 403
      ) {
        throw new Error(
          "Admin access required."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load dashboard."
        );
      }

      if (
        data.success &&
        data.dashboard
      ) {
        setDashboard(
          data.dashboard
        );
      } else {
        throw new Error(
          "Invalid dashboard response."
        );
      }
    } catch (err) {
      console.error(
        "Admin dashboard error:",
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

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================================
  // SAFE DATA
  // =========================================================

  const stats =
    dashboard?.stats || {};

  const recentOrders =
    Array.isArray(
      dashboard?.recentOrders
    )
      ? dashboard.recentOrders
      : [];

  const newOrders =
    Array.isArray(
      dashboard?.newOrders
    )
      ? dashboard.newOrders
      : [];

  const lowStockProducts =
    Array.isArray(
      dashboard?.lowStockProducts
    )
      ? dashboard.lowStockProducts
      : [];

  const recentCustomers =
    Array.isArray(
      dashboard?.recentCustomers
    )
      ? dashboard.recentCustomers
      : [];

  const monthlySales =
    Array.isArray(
      dashboard?.monthlySales
    )
      ? dashboard.monthlySales
      : [];

  const topProducts =
    Array.isArray(
      dashboard?.topProducts
    )
      ? dashboard.topProducts
      : [];

  const orderStatusSummary =
    dashboard?.orderStatusSummary ||
    {};

  // =========================================================
  // TOTALS
  // =========================================================

  const totalOrders =
    Number(
      stats.totalOrders || 0
    );

  const totalProducts =
    Number(
      stats.totalProducts || 0
    );

  const totalCustomers =
    Number(
      stats.totalCustomers || 0
    );

  const totalSales =
    Number(
      stats.totalSales || 0
    );

  const processingOrders =
    Number(
      stats.processingOrders || 0
    );

  const deliveredOrders =
    Number(
      stats.deliveredOrders || 0
    );

  const cancelledOrders =
    Number(
      stats.cancelledOrders || 0
    );

  const pendingPayments =
    Number(
      stats.pendingPayments || 0
    );

  const lowStockCount =
    Number(
      stats.lowStockCount || 0
    );

  const outOfStock =
    Number(
      stats.outOfStock || 0
    );

  // =========================================================
  // THIS MONTH SALES
  // =========================================================

  const thisMonthSales =
    useMemo(() => {
      if (
        monthlySales.length === 0
      ) {
        return 0;
      }

      const now =
        new Date();

      const currentYear =
        now.getFullYear();

      const currentMonth =
        now.getMonth() + 1;

      const current =
        monthlySales.find(
          (item) =>
            Number(
              item?._id?.year
            ) === currentYear &&
            Number(
              item?._id?.month
            ) === currentMonth
        );

      return Number(
        current?.sales || 0
      );
    }, [monthlySales]);

  // =========================================================
  // TODAY SALES
  // =========================================================

  const todaySales =
    useMemo(() => {
      const now =
        new Date();

      const today =
        now.toLocaleDateString(
          "en-CA"
        );

      return recentOrders
        .filter((order) => {
          if (!order.createdAt) {
            return false;
          }

          const orderDate =
            new Date(
              order.createdAt
            ).toLocaleDateString(
              "en-CA"
            );

          return (
            orderDate === today &&
            order.paymentStatus ===
              "paid"
          );
        })
        .reduce(
          (sum, order) =>
            sum +
            Number(
              order.total || 0
            ),
          0
        );
    }, [recentOrders]);

  // =========================================================
  // PAYMENT SUMMARY
  // =========================================================

  const paymentSummary =
    useMemo(() => {
      return recentOrders.reduce(
        (result, order) => {
          const method =
            order.paymentMethod;

          if (!method) {
            return result;
          }

          result[method] =
            (result[method] || 0) +
            Number(
              order.total || 0
            );

          return result;
        },
        {
          cod: 0,
          upi: 0,
          card: 0,
        }
      );
    }, [recentOrders]);

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // CUSTOMER NAME
  // =========================================================

  const getCustomerName =
    (order) => {
      return (
        order?.customerName ||
        `${order?.customer?.firstName || ""} ${
          order?.customer?.lastName || ""
        }`.trim() ||
        "Customer"
      );
    };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass =
    (status) => {
      return String(
        status || "Processing"
      )
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        );
    };

  // =========================================================
  // PAYMENT LABEL
  // =========================================================

  const getPaymentLabel =
    (method) => {
      if (
        method === "cod"
      ) {
        return "Cash on Delivery";
      }

      if (
        method === "upi"
      ) {
        return "UPI / QR";
      }

      if (
        method === "card"
      ) {
        return "Card";
      }

      return "Other";
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="shopEase-admin-page">

        <div className="shopEase-admin-loading">

          <div className="shopEase-admin-spinner">
            <i className="bi bi-arrow-repeat"></i>
          </div>

          <h2>
            Loading ShopEase Admin
          </h2>

          <p>
            Preparing your store dashboard...
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
      <main className="shopEase-admin-page">

        <div className="shopEase-admin-error-page">

          <div className="shopEase-admin-error-icon">
            <i className="bi bi-exclamation-triangle"></i>
          </div>

          <h2>
            Dashboard Unavailable
          </h2>

          <p>
            {error}
          </p>

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

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="shopEase-admin-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="shopEase-admin-sidebar">

        <div className="shopEase-admin-brand">

          <div className="shopEase-admin-brand-logo">
            <i className="bi bi-bag-fill"></i>
          </div>

          <div>
            <strong>
              Shop<span>Ease</span>
            </strong>

            <small>
              ADMIN CONTROL
            </small>
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

            {processingOrders > 0 && (
              <b>
                {processingOrders}
              </b>
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

            {lowStockCount > 0 && (
              <b className="warning">
                {lowStockCount}
              </b>
            )}
          </Link>

          <Link to="/admin/orders">
            <i className="bi bi-credit-card"></i>
            <span>Payments</span>

            {pendingPayments > 0 && (
              <b className="payment">
                {pendingPayments}
              </b>
            )}
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
              <strong>
                Need Help?
              </strong>

              <span>
                Admin support
              </span>
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

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="shopEase-admin-content">

        {/* TOP BAR */}

        <header className="shopEase-admin-topbar">

          <div className="shopEase-admin-mobile-brand">
            <div>
              <strong>
                Shop<span>Ease</span>
              </strong>

              <small>
                Admin
              </small>
            </div>
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

              {processingOrders >
                0 && (
                <span>
                  {processingOrders}
                </span>
              )}
            </button>

            <div className="shopEase-admin-profile">

              <div className="shopEase-admin-avatar">
                A
              </div>

              <div>
                <strong>
                  Admin
                </strong>

                <span>
                  ShopEase
                </span>
              </div>

              <i className="bi bi-chevron-down"></i>

            </div>

          </div>

        </header>

        {/* PAGE HEADER */}

        <div className="shopEase-admin-heading">

          <div>

            <span>
              OVERVIEW
            </span>

            <h1>
              Dashboard
            </h1>

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

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="shopEase-admin-kpi-grid">

          <div className="shopEase-admin-kpi purple">

            <div className="kpi-top">

              <span>
                Today's Sales
              </span>

              <i className="bi bi-bag-check"></i>

            </div>

            <strong>
              ₹{formatMoney(
                todaySales
              )}
            </strong>

            <small>
              <i className="bi bi-arrow-up"></i>
              Live order activity
            </small>

            <div className="kpi-decoration"></div>

          </div>

          <div className="shopEase-admin-kpi green">

            <div className="kpi-top">

              <span>
                This Month Sales
              </span>

              <i className="bi bi-graph-up-arrow"></i>

            </div>

            <strong>
              ₹{formatMoney(
                thisMonthSales
              )}
            </strong>

            <small>
              <i className="bi bi-arrow-up"></i>
              Paid orders
            </small>

            <div className="kpi-decoration"></div>

          </div>

          <div className="shopEase-admin-kpi orange">

            <div className="kpi-top">

              <span>
                Total Orders
              </span>

              <i className="bi bi-box-seam"></i>

            </div>

            <strong>
              {totalOrders.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              <i className="bi bi-clock"></i>
              {processingOrders} processing
            </small>

            <div className="kpi-decoration"></div>

          </div>

          <div className="shopEase-admin-kpi blue">

            <div className="kpi-top">

              <span>
                Total Products
              </span>

              <i className="bi bi-boxes"></i>

            </div>

            <strong>
              {totalProducts.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              <i className="bi bi-check-circle"></i>
              Active products
            </small>

            <div className="kpi-decoration"></div>

          </div>

          <div className="shopEase-admin-kpi pink">

            <div className="kpi-top">

              <span>
                Total Customers
              </span>

              <i className="bi bi-people-fill"></i>

            </div>

            <strong>
              {totalCustomers.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              <i className="bi bi-person-plus"></i>
              Registered users
            </small>

            <div className="kpi-decoration"></div>

          </div>

          <div className="shopEase-admin-kpi teal">

            <div className="kpi-top">

              <span>
                Low Stock Alerts
              </span>

              <i className="bi bi-exclamation-diamond"></i>

            </div>

            <strong>
              {lowStockCount}
            </strong>

            <small>
              <i className="bi bi-box"></i>
              {outOfStock} out of stock
            </small>

            <div className="kpi-decoration"></div>

          </div>

        </section>

        {/* =================================================
            MAIN ANALYTICS
        ================================================= */}

        <section className="shopEase-admin-analytics-grid">

          {/* SALES OVERVIEW */}

          <div className="shopEase-admin-card sales-card">

            <div className="shopEase-admin-card-header">

              <div>

                <span>
                  SALES OVERVIEW
                </span>

                <h2>
                  Monthly Sales
                </h2>

              </div>

              <select defaultValue="all">
                <option value="all">
                  This Year
                </option>
              </select>

            </div>

            <div className="shopEase-admin-chart">

              <div className="chart-y-labels">
                <span>₹50K</span>
                <span>₹40K</span>
                <span>₹30K</span>
                <span>₹20K</span>
                <span>₹10K</span>
                <span>₹0</span>
              </div>

              <div className="chart-area">

                <div className="chart-grid-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="chart-bars">

                  {monthlySales
                    .slice(-6)
                    .map(
                      (item, index) => {

                        const value =
                          Number(
                            item.sales ||
                              0
                          );

                        const max =
                          Math.max(
                            ...monthlySales.map(
                              (row) =>
                                Number(
                                  row.sales ||
                                    0
                                )
                            ),
                            1
                          );

                        const height =
                          Math.max(
                            8,
                            (
                              value /
                              max
                            ) * 100
                          );

                        return (
                          <div
                            className="chart-column"
                            key={
                              `${item?._id?.year}-${item?._id?.month}-${index}`
                            }
                          >

                            <div
                              className="chart-bar"
                              style={{
                                height:
                                  `${height}%`,
                              }}
                            ></div>

                            <span>
                              {item?._id?.month ||
                                index + 1}
                            </span>

                          </div>
                        );
                      }
                    )}

                </div>

              </div>

            </div>

            <div className="chart-legend">

              <span>
                <i className="legend-dot sales"></i>
                Sales
              </span>

              <span>
                ₹
                {formatMoney(
                  thisMonthSales
                )} this month
              </span>

            </div>

          </div>

          {/* PAYMENT COLLECTION */}

          <div className="shopEase-admin-card collection-card">

            <div className="shopEase-admin-card-header">

              <div>

                <span>
                  COLLECTION SUMMARY
                </span>

                <h2>
                  Payment Methods
                </h2>

              </div>

            </div>

            <div className="collection-total">

              <small>
                Recorded from recent orders
              </small>

              <strong>
                ₹
                {formatMoney(
                  totalSales
                )}
              </strong>

            </div>

            <div className="collection-list">

              <div>

                <span>

                  <i className="bi bi-cash-stack"></i>

                  Cash on Delivery

                </span>

                <strong>
                  ₹
                  {formatMoney(
                    paymentSummary.cod
                  )}
                </strong>

              </div>

              <div>

                <span>

                  <i className="bi bi-qr-code"></i>

                  UPI / QR

                </span>

                <strong>
                  ₹
                  {formatMoney(
                    paymentSummary.upi
                  )}
                </strong>

              </div>

              <div>

                <span>

                  <i className="bi bi-credit-card"></i>

                  Card

                </span>

                <strong>
                  ₹
                  {formatMoney(
                    paymentSummary.card
                  )}
                </strong>

              </div>

            </div>

            <div className="collection-footer">

              <span>
                Pending Payments
              </span>

              <strong>
                {pendingPayments}
              </strong>

            </div>

          </div>

          {/* ORDER STATUS */}

          <div className="shopEase-admin-card status-card">

            <div className="shopEase-admin-card-header">

              <div>

                <span>
                  ORDER STATUS
                </span>

                <h2>
                  Live Order Summary
                </h2>

              </div>

            </div>

            <div className="status-ring">

              <div>

                <strong>
                  {totalOrders}
                </strong>

                <span>
                  Total Orders
                </span>

              </div>

            </div>

            <div className="status-mini-grid">

              <div>
                <span>
                  Processing
                </span>
                <strong>
                  {orderStatusSummary.Processing || 0}
                </strong>
              </div>

              <div>
                <span>
                  Shipped
                </span>
                <strong>
                  {orderStatusSummary.Shipped || 0}
                </strong>
              </div>

              <div>
                <span>
                  Delivered
                </span>
                <strong>
                  {deliveredOrders}
                </strong>
              </div>

              <div>
                <span>
                  Cancelled
                </span>
                <strong>
                  {cancelledOrders}
                </strong>
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            MANAGEMENT GRID
        ================================================= */}

        <section className="shopEase-admin-management-grid">

          {/* TOP PRODUCTS */}

          <div className="shopEase-admin-card">

            <div className="shopEase-admin-card-header">

              <div>

                <span>
                  BEST SELLERS
                </span>

                <h2>
                  Top Selling Items
                </h2>

              </div>

              <Link to="/admin/products">
                View All
              </Link>

            </div>

            <div className="shopEase-admin-table">

              {topProducts
                .slice(0, 5)
                .map(
                  (product, index) => (

                    <div
                      className="admin-table-row"
                      key={
                        `${product?._id}-${index}`
                      }
                    >

                      <span className="rank">
                        {index + 1}
                      </span>

                      <div className="table-product">

                        <div className="table-product-image">

                          {product.image ? (
                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                            />
                          ) : (
                            <i className="bi bi-box"></i>
                          )}

                        </div>

                        <div>

                          <strong>
                            {product.name}
                          </strong>

                          <small>
                            {Number(
                              product.quantity ||
                                0
                            )} sold
                          </small>

                        </div>

                      </div>

                      <strong>
                        ₹
                        {formatMoney(
                          product.revenue
                        )}
                      </strong>

                    </div>

                  )
                )}

              {topProducts.length ===
                0 && (
                <div className="empty-box">
                  No sales data available.
                </div>
              )}

            </div>

          </div>

          {/* STOCK SUMMARY */}

          <div className="shopEase-admin-card">

            <div className="shopEase-admin-card-header">

              <div>

                <span>
                  INVENTORY
                </span>

                <h2>
                  Stock Summary
                </h2>

              </div>

              <Link to="/admin/products">
                Manage
              </Link>

            </div>

            <div className="stock-summary-list">

              <div>

                <div>
                  <i className="bi bi-box"></i>
                  <span>
                    Low Stock Items
                  </span>
                </div>

                <strong>
                  {lowStockCount}
                </strong>

              </div>

              <div>

                <div>
                  <i className="bi bi-x-octagon"></i>
                  <span>
                    Out of Stock
                  </span>
                </div>

                <strong className="danger">
                  {outOfStock}
                </strong>

              </div>

              <div>

                <div>
                  <i className="bi bi-boxes"></i>
                  <span>
                    Total Products
                  </span>
                </div>

                <strong>
                  {totalProducts}
                </strong>

              </div>

              <div>

                <div>
                  <i className="bi bi-check2-circle"></i>
                  <span>
                    Delivered Orders
                  </span>
                </div>

                <strong>
                  {deliveredOrders}
                </strong>

              </div>

            </div>

          </div>

          {/* LOW STOCK ALERT */}

          <div className="shopEase-admin-card low-stock-card">

            <div className="shopEase-admin-card-header">

              <div>

                <span>
                  ATTENTION REQUIRED
                </span>

                <h2>
                  Low Stock Alert
                </h2>

              </div>

              <i className="bi bi-exclamation-triangle"></i>

            </div>

            <div className="low-stock-table">

              {lowStockProducts
                .slice(0, 6)
                .map(
                  (product) => (

                    <div
                      key={
                        product._id
                      }
                    >

                      <span>
                        {product.name}
                      </span>

                      <span>
                        {product.category ||
                          "Product"}
                      </span>

                      <strong
                        className={
                          Number(
                            product.stock
                          ) <= 0
                            ? "critical"
                            : ""
                        }
                      >
                        {Number(
                          product.stock ||
                            0
                        )} left
                      </strong>

                    </div>

                  )
                )}

              {lowStockProducts.length ===
                0 && (
                <div className="empty-box">
                  All products are well stocked.
                </div>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            RECENT TRANSACTIONS + CUSTOMERS
        ================================================= */}

        <section className="shopEase-admin-bottom-grid">

          {/* RECENT TRANSACTIONS */}

          <div className="shopEase-admin-card">

            <div className="shopEase-admin-card-header">

              <div>

                <span>
                  RECENT ACTIVITY
                </span>

                <h2>
                  Recent Transactions
                </h2>

              </div>

              <Link to="/admin/orders">
                View All
              </Link>

            </div>

            <div className="transactions-list">

              {recentOrders
                .slice(0, 6)
                .map(
                  (order) => (

                    <div
                      className="transaction-item"
                      key={
                        order.orderId
                      }
                    >

                      <div className="transaction-icon">

                        <i
                          className={
                            order.paymentStatus ===
                            "paid"
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
                          {getCustomerName(
                            order
                          )}
                        </span>

                      </div>

                      <div>

                        <strong>
                          ₹
                          {formatMoney(
                            order.total
                          )}
                        </strong>

                        <span>
                          {getPaymentLabel(
                            order.paymentMethod
                          )}
                        </span>

                      </div>

                      <div>

                        <span
                          className={`transaction-status ${getStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {
                            order.orderStatus
                          }
                        </span>

                        <small>
                          {formatDate(
                            order.createdAt
                          )}
                        </small>

                      </div>

                    </div>

                  )
                )}

              {recentOrders.length ===
                0 && (
                <div className="empty-box">
                  No transactions available.
                </div>
              )}

            </div>

          </div>

          {/* RECENT CUSTOMERS */}

          <div className="shopEase-admin-card">

            <div className="shopEase-admin-card-header">

              <div>

                <span>
                  CUSTOMERS
                </span>

                <h2>
                  Recent Customers
                </h2>

              </div>

              <Link to="/admin/users">
                View All
              </Link>

            </div>

            <div className="customers-list">

              {recentCustomers
                .slice(0, 6)
                .map(
                  (customer) => (

                    <div
                      className="customer-item"
                      key={
                        customer._id
                      }
                    >

                      <div className="customer-avatar">
                        {(customer.name ||
                          "C")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {customer.name ||
                            "Customer"}
                        </strong>

                        <span>
                          {customer.email ||
                            ""}
                        </span>

                      </div>

                      <small>
                        {formatDate(
                          customer.createdAt
                        )}
                      </small>

                    </div>

                  )
                )}

              {recentCustomers.length ===
                0 && (
                <div className="empty-box">
                  No customers available.
                </div>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            NEW CUSTOMER ORDERS - CONTROL CENTER
        ================================================= */}

        <section className="shopEase-admin-card orders-control-card">

          <div className="shopEase-admin-card-header">

            <div>

              <span>
                CUSTOMER ORDERS
              </span>

              <h2>
                New Orders — Admin Control
              </h2>

            </div>

            <Link to="/admin/orders">
              Manage All Orders
              <i className="bi bi-arrow-right"></i>
            </Link>

          </div>

          {newOrders.length ===
          0 ? (

            <div className="orders-empty">
              <i className="bi bi-check-circle"></i>

              <strong>
                No new orders
              </strong>

              <span>
                Your store is all caught up.
              </span>
            </div>

          ) : (

            <div className="control-orders-grid">

              {newOrders
                .slice(0, 6)
                .map(
                  (order) => (

                    <article
                      className="control-order"
                      key={
                        order.orderId
                      }
                    >

                      <div className="control-order-head">

                        <strong>
                          {order.orderId}
                        </strong>

                        <span
                          className={`order-status ${getStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>

                      </div>

                      <div className="control-order-customer">

                        <div className="customer-avatar">
                          {getCustomerName(
                            order
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {getCustomerName(
                              order
                            )}
                          </strong>

                          <span>
                            {order.customer?.city ||
                              "Customer"}
                          </span>

                        </div>

                      </div>

                      <div className="control-order-info">

                        <div>
                          <span>
                            Amount
                          </span>

                          <strong>
                            ₹
                            {formatMoney(
                              order.total
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Payment
                          </span>

                          <strong>
                            {getPaymentLabel(
                              order.paymentMethod
                            )}
                          </strong>
                        </div>

                      </div>

                      <div className="control-order-actions">

                        <Link
                          to={`/track-order/${order.orderId}`}
                        >
                          <i className="bi bi-eye"></i>
                          View
                        </Link>

                        <Link
                          to="/admin/orders"
                        >
                          <i className="bi bi-pencil-square"></i>
                          Manage
                        </Link>

                      </div>

                    </article>

                  )
                )}

            </div>

          )}

        </section>

      </section>

    </main>
  );
}

export default AdminDashboard;