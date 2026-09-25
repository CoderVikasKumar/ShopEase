import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [authChecking, setAuthChecking] =
    useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const { cartCount } = useCart();
  const { wishlistCount } =
    useWishlist();

  // =========================================================
  // SAFE COUNTS
  // =========================================================

  const safeCartCount =
    Number(cartCount || 0);

  const safeWishlistCount =
    Number(wishlistCount || 0);

  const hasCartItems =
    safeCartCount > 0;

  const hasWishlistItems =
    safeWishlistCount > 0;

  // =========================================================
  // LOAD + VERIFY USER
  // =========================================================

  const loadUser = async () => {
    const token =
      localStorage.getItem(
        "shopease_token"
      );

    if (!token) {
      setCurrentUser(null);
      setAuthChecking(false);
      return;
    }

    try {
      const response =
        await fetch(
          "http://localhost:5000/api/auth/me",
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

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Session expired."
        );
      }

      const user = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone:
          data.user.phone || "",
        city:
          data.user.city || "",
      };

      setCurrentUser(user);

      localStorage.setItem(
        "shopease_current_user",
        JSON.stringify(user)
      );
    } catch (error) {
      console.error(
        "Navbar auth error:",
        error
      );

      localStorage.removeItem(
        "shopease_token"
      );

      localStorage.removeItem(
        "shopease_current_user"
      );

      localStorage.removeItem(
        "shopease_remember_me"
      );

      setCurrentUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  // =========================================================
  // RUN AUTH CHECK
  // =========================================================

  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  // =========================================================
  // STORAGE EVENT
  // =========================================================

  useEffect(() => {
    const handleStorageChange =
      () => {
        loadUser();
      };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  // =========================================================
  // CLOSE MENU
  // =========================================================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "shopease_token"
    );

    localStorage.removeItem(
      "shopease_current_user"
    );

    localStorage.removeItem(
      "shopease_remember_me"
    );

    setCurrentUser(null);
    setMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  const userName =
    currentUser?.name || "Account";

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="navbar-wrapper">

      <nav className="main-navbar">

        {/* =====================================================
            LOGO
        ===================================================== */}

        <Link
          to="/"
          className="brand"
          onClick={closeMenu}
        >
          <div className="brand-icon">
            <i className="bi bi-bag-fill"></i>
          </div>

          <div className="brand-text">
            <h2>
              Shop<span>Ease</span>
            </h2>

            <p>
              Shop Smart. Live Better.
            </p>
          </div>
        </Link>

        {/* =====================================================
            DESKTOP MENU
        ===================================================== */}

        <div className="nav-links">

          <Link
            to="/"
            className="nav-link-item"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="nav-link-item"
          >
            Products
          </Link>

          <Link
            to="/categories"
            className="nav-link-item"
          >
            Categories
          </Link>

          <Link
            to="/products"
            className="nav-link-item deal-link"
          >
            Deals

            <span className="deal-badge">
              HOT
            </span>
          </Link>

        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="nav-actions">

          {/* SEARCH */}

          <Link
            to="/search"
            className="nav-icon"
            aria-label="Search"
          >
            <i className="bi bi-search"></i>
          </Link>

          {/* =================================================
              WISHLIST
              ONLY SHOW WHEN ITEMS EXIST
          ================================================= */}

          {hasWishlistItems && (
            <Link
              to="/wishlist"
              className="nav-icon"
              aria-label={`Wishlist (${safeWishlistCount})`}
              title="Wishlist"
            >
              <i className="bi bi-heart-fill"></i>

              <span className="wishlist-count">
                {safeWishlistCount}
              </span>
            </Link>
          )}

          {/* =================================================
              CART
              ONLY SHOW WHEN ITEMS EXIST
          ================================================= */}

          {hasCartItems && (
            <Link
              to="/cart"
              className="nav-icon"
              aria-label={`Cart (${safeCartCount})`}
              title="Cart"
            >
              <i className="bi bi-bag-fill"></i>

              <span className="cart-count">
                {safeCartCount}
              </span>
            </Link>
          )}

          {/* =================================================
              ACCOUNT
          ================================================= */}

          {!authChecking && (
            <>
              {currentUser ? (
                <>
                  {/* PROFILE */}

                  <Link
                    to="/profile"
                    className="nav-account-btn"
                    title={userName}
                    onClick={closeMenu}
                  >
                    <span className="nav-user-avatar">
                      {userName
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <span className="nav-user-name">
                      {userName}
                    </span>
                  </Link>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    className="nav-logout-btn"
                    onClick={
                      handleLogout
                    }
                  >
                    <i className="bi bi-box-arrow-right"></i>

                    <span>
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {/* LOGIN */}

                  <Link
                    to="/login"
                    className="login-btn"
                    onClick={closeMenu}
                  >
                    <i className="bi bi-person"></i>

                    <span>
                      Login
                    </span>
                  </Link>

                  {/* REGISTER */}

                  <Link
                    to="/register"
                    className="register-btn"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() =>
              setMenuOpen(
                (prev) => !prev
              )
            }
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <i
              className={
                menuOpen
                  ? "bi bi-x-lg"
                  : "bi bi-list"
              }
            ></i>
          </button>

        </div>

        {/* =====================================================
            MOBILE MENU
        ===================================================== */}

        {menuOpen && (
          <div className="mobile-nav-menu">

            {/* HOME */}

            <Link
              to="/"
              onClick={closeMenu}
            >
              <i className="bi bi-house"></i>

              <span>
                Home
              </span>
            </Link>

            {/* PRODUCTS */}

            <Link
              to="/products"
              onClick={closeMenu}
            >
              <i className="bi bi-grid"></i>

              <span>
                Products
              </span>
            </Link>

            {/* CATEGORIES */}

            <Link
              to="/categories"
              onClick={closeMenu}
            >
              <i className="bi bi-collection"></i>

              <span>
                Categories
              </span>
            </Link>

            {/* SEARCH */}

            <Link
              to="/search"
              onClick={closeMenu}
            >
              <i className="bi bi-search"></i>

              <span>
                Search
              </span>
            </Link>

            {/* =================================================
                MOBILE WISHLIST
                HIDDEN WHEN EMPTY
            ================================================= */}

            {hasWishlistItems && (
              <Link
                to="/wishlist"
                onClick={closeMenu}
              >
                <i className="bi bi-heart-fill"></i>

                <span>
                  Wishlist (
                  {safeWishlistCount}
                  )
                </span>
              </Link>
            )}

            {/* =================================================
                MOBILE CART
                HIDDEN WHEN EMPTY
            ================================================= */}

            {hasCartItems && (
              <Link
                to="/cart"
                onClick={closeMenu}
              >
                <i className="bi bi-bag-fill"></i>

                <span>
                  Cart (
                  {safeCartCount}
                  )
                </span>
              </Link>
            )}

            {/* =================================================
                ACCOUNT MOBILE
            ================================================= */}

            {!authChecking && (
              <>
                {currentUser ? (
                  <>
                    {/* PROFILE */}

                    <Link
                      to="/profile"
                      onClick={
                        closeMenu
                      }
                    >
                      <i className="bi bi-person-circle"></i>

                      <span>
                        {userName}
                      </span>
                    </Link>

                    {/* ORDERS */}

                    <Link
                      to="/orders"
                      onClick={
                        closeMenu
                      }
                    >
                      <i className="bi bi-box-seam"></i>

                      <span>
                        My Orders
                      </span>
                    </Link>

                    {/* LOGOUT */}

                    <button
                      type="button"
                      className="mobile-logout-btn"
                      onClick={
                        handleLogout
                      }
                    >
                      <i className="bi bi-box-arrow-right"></i>

                      <span>
                        Logout
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* LOGIN */}

                    <Link
                      to="/login"
                      onClick={
                        closeMenu
                      }
                    >
                      <i className="bi bi-person"></i>

                      <span>
                        Login
                      </span>
                    </Link>

                    {/* SIGN UP */}

                    <Link
                      to="/register"
                      onClick={
                        closeMenu
                      }
                    >
                      <i className="bi bi-person-plus"></i>

                      <span>
                        Sign Up
                      </span>
                    </Link>
                  </>
                )}
              </>
            )}

          </div>
        )}

      </nav>
    </div>
  );
}

export default Navbar;