import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// =========================================================
// COMPONENTS
// =========================================================

import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import BackButton from "./components/BackButton";
import ProtectedRoute from "./components/ProtectedRoute";

// =========================================================
// CONTEXTS
// =========================================================

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// =========================================================
// PUBLIC PAGES
// =========================================================

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import CategoriesPage from "./pages/CategoriesPage";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";

// =========================================================
// AUTH PAGES
// =========================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// =========================================================
// USER PAGES
// =========================================================

import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";

// =========================================================
// ADMIN PAGES
// =========================================================

import AdminOrders from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";

// =========================================================
// APP LAYOUT
// =========================================================

function AppLayout() {
  const location = useLocation();

  const isHomePage =
    location.pathname === "/";

  return (
    <>
      {/* =================================================
          HEADER
      ================================================= */}

      <TopBar />

      <Navbar />

      {!isHomePage && (
        <BackButton />
      )}

      {/* =================================================
          ROUTES
      ================================================= */}

      <Routes>
        {/* =================================================
            PUBLIC
        ================================================= */}

        <Route
          path="/"
          element={
            <Home />
          }
        />

        <Route
          path="/products"
          element={
            <Products />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductDetails />
          }
        />

        <Route
          path="/categories"
          element={
            <CategoriesPage />
          }
        />

        <Route
          path="/search"
          element={
            <Search />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart />
          }
        />

        <Route
          path="/wishlist"
          element={
            <Wishlist />
          }
        />

        {/* =================================================
            AUTH
        ================================================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/register"
          element={
            <Register />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />

        {/* =================================================
            CHECKOUT
        ================================================= */}

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ORDERS
        ================================================= */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ORDER TRACKING
        ================================================= */}

        <Route
          path="/track-order/:orderId"
          element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN ORDERS
        ================================================= */}

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN USERS
        ================================================= */}

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN PRODUCTS
        ================================================= */}

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <AdminProducts />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <BrowserRouter>

      <CartProvider>

        <WishlistProvider>

          <AppLayout />

        </WishlistProvider>

      </CartProvider>

    </BrowserRouter>
  );
}

export default App;