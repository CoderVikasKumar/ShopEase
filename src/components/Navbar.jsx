import { useEffect, useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  const [authChecking, setAuthChecking] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  // ==========================================
  // LOAD USER
  // ==========================================
  const loadUser = async () => {
    const token = localStorage.getItem("shopease_token");

    // First load saved user immediately
    const savedUser = localStorage.getItem(
      "shopease_current_user"
    );

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser) {
          setCurrentUser(parsedUser);
        }
      } catch (error) {
        console.error(
          "Saved user parse error:",
          error
        );
      }
    }

    // No token = logged out
    if (!token) {
      setCurrentUser(null);
      setAuthChecking(false);
      return;
    }

    try {
      const response = await fetch(
        "https://shopease-backend-txtm.onrender.com/api/auth/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Session expired."
        );
      }

      // ==========================================
      // USER FROM BACKEND
      // ==========================================
      if (data.user) {
        const user = {
          id: data.user.id,
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          city: data.user.city || "",
        };

        setCurrentUser(user);

        localStorage.setItem(
          "shopease_current_user",
          JSON.stringify(user)
        );
      }
    } catch (error) {
      console.error(
        "Navbar auth verification error:",
        error
      );

      /*
        IMPORTANT:
        Agar /api/auth/me temporary fail hota hai,
        to saved user ko immediately delete nahi karenge.

        Isse login ke baad Navbar me profile
        visible rahega.
      */

      const savedUserAgain =
        localStorage.getItem(
          "shopease_current_user"
        );

      if (savedUserAgain) {
        try {
          const parsedUser =
            JSON.parse(savedUserAgain);

          if (parsedUser) {
            setCurrentUser(parsedUser);
          }
        } catch (parseError) {
          console.error(
            "User restore error:",
            parseError
          );
        }
      }
    } finally {
      setAuthChecking(false);
    }
  };

  // ==========================================
  // RUN AUTH CHECK
  // ==========================================
  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  // ==========================================
  // STORAGE EVENT
  // ==========================================
  useEffect(() => {
    const handleStorageChange = () => {
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

  // ==========================================
  // CLOSE MENU
  // ==========================================
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    const confirmed = window.confirm(
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

  // ==========================================
  // USER NAME
  // ==========================================
  const userName =
    currentUser?.name || "Account";

  return (
    <div className="navbar-wrapper">
      <nav className="main-navbar">

        {/* =====================================
            LOGO
        ===================================== */}

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

        {/* =====================================
            DESKTOP MENU
        ===================================== */}

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

        {/* =====================================
            RIGHT SIDE
        ===================================== */}

        <div className="nav-actions">

          {/* SEARCH */}

          <Link
            to="/search"
            className="nav-icon"
            aria-label="Search"
          >
            <i className="bi bi-search"></i>
          </Link>

          {/* WISHLIST */}

          <Link
            to="/wishlist"
            className="nav-icon"
            aria-label="Wishlist"
          >
            <i
              className={
                wishlistCount > 0
                  ? "bi bi-heart-fill"
                  : "bi bi-heart"
              }
            ></i>

            <span className="wishlist-count">
              {wishlistCount}
            </span>
          </Link>

          {/* CART */}

          <Link
            to="/cart"
            className="nav-icon"
            aria-label="Cart"
          >
            <i className="bi bi-bag"></i>

            <span className="cart-count">
              {cartCount}
            </span>
          </Link>

          {/* ===================================
              ACCOUNT
          =================================== */}

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
                    onClick={handleLogout}
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

          {/* ===================================
              MOBILE MENU BUTTON
          =================================== */}

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

        {/* =====================================
            MOBILE MENU
        ===================================== */}

        {menuOpen && (
          <div className="mobile-nav-menu">

            <Link
              to="/"
              onClick={closeMenu}
            >
              <i className="bi bi-house"></i>
              <span>Home</span>
            </Link>

            <Link
              to="/products"
              onClick={closeMenu}
            >
              <i className="bi bi-grid"></i>
              <span>Products</span>
            </Link>

            <Link
              to="/categories"
              onClick={closeMenu}
            >
              <i className="bi bi-collection"></i>
              <span>Categories</span>
            </Link>

            <Link
              to="/search"
              onClick={closeMenu}
            >
              <i className="bi bi-search"></i>
              <span>Search</span>
            </Link>

            <Link
              to="/wishlist"
              onClick={closeMenu}
            >
              <i
                className={
                  wishlistCount > 0
                    ? "bi bi-heart-fill"
                    : "bi bi-heart"
                }
              ></i>

              <span>
                Wishlist ({wishlistCount})
              </span>
            </Link>

            <Link
              to="/cart"
              onClick={closeMenu}
            >
              <i className="bi bi-bag"></i>

              <span>
                Cart ({cartCount})
              </span>
            </Link>

            {/* MOBILE ACCOUNT */}

            {!authChecking && (
              <>
                {currentUser ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                    >
                      <i className="bi bi-person-circle"></i>

                      <span>
                        {userName}
                      </span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={closeMenu}
                    >
                      <i className="bi bi-box-seam"></i>

                      <span>
                        My Orders
                      </span>
                    </Link>

                    <button
                      type="button"
                      className="mobile-logout-btn"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>

                      <span>
                        Logout
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                    >
                      <i className="bi bi-person"></i>

                      <span>
                        Login
                      </span>
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMenu}
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