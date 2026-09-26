import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { getOrders } from "../utils/orderUtils";

import { useCart } from "../context/CartContext";

import {
  useWishlist,
} from "../context/WishlistContext";

function Profile() {
  const navigate = useNavigate();

  const { cartCount } =
    useCart();

  const { wishlistCount } =
    useWishlist();

  // =========================================================
  // IMAGE INPUT
  // =========================================================

  const fileInputRef =
    useRef(null);

  // =========================================================
  // GET STORED USER
  // =========================================================

  const getStoredUser = () => {
    try {
      const savedUser =
        localStorage.getItem(
          "shopease_current_user"
        );

      if (!savedUser) {
        return null;
      }

      return JSON.parse(
        savedUser
      );
    } catch (error) {
      console.error(
        "Current user load error:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // CURRENT USER
  // =========================================================

  const [
    currentUser,
    setCurrentUser,
  ] = useState(
    getStoredUser
  );

  // =========================================================
  // PROFILE
  // =========================================================

  const [
    profile,
    setProfile,
  ] = useState(() => {
    const user =
      getStoredUser();

    return {
      name:
        user?.name || "",

      email:
        user?.email || "",

      phone:
        user?.phone || "",

      city:
        user?.city || "",

      profileImage:
        user?.profileImage || "",
    };
  });

  // =========================================================
  // STATES
  // =========================================================

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // =========================================================
  // ORDER COUNT
  // =========================================================

  const orderCount =
    getOrders().length;

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    let finalValue =
      value;

    if (
      name === "phone"
    ) {
      finalValue =
        value
          .replace(/\D/g, "")
          .slice(0, 10);
    }

    setProfile(
      (prev) => ({
        ...prev,
        [name]:
          finalValue,
      })
    );

    setError("");
  };

  // =========================================================
  // OPEN IMAGE PICKER
  // =========================================================

  const handleChoosePhoto = () => {
    if (!editing) {
      return;
    }

    fileInputRef.current?.click();
  };

  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  const handleImageChange = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    // Only images
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select a valid image file."
      );

      return;
    }

    // 5MB limit
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image size must be less than 5MB."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const image =
        reader.result;

      setProfile(
        (prev) => ({
          ...prev,
          profileImage:
            image,
        })
      );

      setError("");
    };

    reader.onerror = () => {
      setError(
        "Unable to load selected image."
      );
    };

    reader.readAsDataURL(
      file
    );

    // Same file dobara select karne ke liye
    e.target.value = "";
  };

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  const handleRemovePhoto = () => {
    if (!editing) {
      return;
    }

    setProfile(
      (prev) => ({
        ...prev,
        profileImage: "",
      })
    );

    setError("");
  };

  // =========================================================
  // LOAD PROFILE FROM BACKEND
  // =========================================================

  useEffect(() => {
    const loadProfile =
      async () => {
        const token =
          localStorage.getItem(
            "shopease_token"
          );

        if (!token) {
          return;
        }

        try {
          const response =
            await fetch(
              "https://shopease-backend-txtm.onrender.com/api/auth/me",
              {
                method:
                  "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

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

            navigate(
              "/login"
            );

            return;
          }

          if (
            !response.ok
          ) {
            return;
          }

          if (data.user) {
            const user =
              data.user;

            // Keep locally saved profile image
            const savedUser =
              getStoredUser();

            const profileImage =
              user.profileImage ||
              savedUser?.profileImage ||
              "";

            const updatedUser = {
              ...user,
              profileImage,
            };

            setCurrentUser(
              updatedUser
            );

            setProfile({
              name:
                user.name ||
                "",

              email:
                user.email ||
                "",

              phone:
                user.phone ||
                "",

              city:
                user.city ||
                "",

              profileImage,
            });

            localStorage.setItem(
              "shopease_current_user",
              JSON.stringify(
                updatedUser
              )
            );
          }
        } catch (err) {
          console.error(
            "Profile load error:",
            err
          );
        }
      };

    loadProfile();
  }, [navigate]);

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave =
    async () => {
      const token =
        localStorage.getItem(
          "shopease_token"
        );

      if (!token) {
        navigate(
          "/login"
        );

        return;
      }

      // NAME
      if (
        !profile.name.trim()
      ) {
        setError(
          "Name is required."
        );

        return;
      }

      // EMAIL
      if (
        !profile.email.trim()
      ) {
        setError(
          "Email is required."
        );

        return;
      }

      // EMAIL FORMAT
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          profile.email.trim()
        )
      ) {
        setError(
          "Please enter a valid email address."
        );

        return;
      }

      // PHONE
      if (
        profile.phone &&
        profile.phone.length !==
          10
      ) {
        setError(
          "Please enter a valid 10-digit phone number."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");

        // =====================================================
        // UPDATE BACKEND PROFILE
        // =====================================================

        const response =
          await fetch(
            "https://shopease-backend-txtm.onrender.com/api/auth/profile",
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  name:
                    profile.name.trim(),

                  email:
                    profile.email
                      .trim()
                      .toLowerCase(),

                  phone:
                    profile.phone.trim(),

                  city:
                    profile.city.trim(),
                }),
            }
          );

        const data =
          await response.json();

        // =====================================================
        // AUTH ERROR
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

          navigate(
            "/login"
          );

          return;
        }

        // =====================================================
        // API ERROR
        // =====================================================

        if (
          !response.ok
        ) {
          throw new Error(
            data.message ||
              "Unable to update profile."
          );
        }

        // =====================================================
        // UPDATED USER
        // =====================================================

        const updatedUser = {
          ...data.user,

          // Preserve selected profile image
          profileImage:
            profile.profileImage ||
            "",
        };

        setCurrentUser(
          updatedUser
        );

        setProfile({
          name:
            updatedUser.name ||
            "",

          email:
            updatedUser.email ||
            "",

          phone:
            updatedUser.phone ||
            "",

          city:
            updatedUser.city ||
            "",

          profileImage:
            updatedUser.profileImage ||
            "",
        });

        // =====================================================
        // SAVE SESSION LOCALLY
        // =====================================================

        localStorage.setItem(
          "shopease_current_user",
          JSON.stringify(
            updatedUser
          )
        );

        setEditing(false);

        window.alert(
          "Profile updated successfully!"
        );
      } catch (err) {
        console.error(
          "Profile save error:",
          err
        );

        setError(
          err.message ||
            "Unable to update profile."
        );
      } finally {
        setSaving(false);
      }
    };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancel =
    () => {
      setProfile({
        name:
          currentUser?.name ||
          "",

        email:
          currentUser?.email ||
          "",

        phone:
          currentUser?.phone ||
          "",

        city:
          currentUser?.city ||
          "",

        profileImage:
          currentUser?.profileImage ||
          "",
      });

      setError("");
      setEditing(false);
    };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    const confirmLogout =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmLogout) {
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

    navigate(
      "/login"
    );
  };

  // =========================================================
  // INITIAL
  // =========================================================

  const getInitial =
    () => {
      return (
        profile.name ||
        "U"
      )
        .charAt(0)
        .toUpperCase();
    };

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!currentUser) {
    return (
      <main className="profile-page">

        <section className="profile-header">

          <p>
            ACCOUNT CENTER
          </p>

          <h1>
            My Profile
          </h1>

          <span>
            Please login to access your
            account.
          </span>

        </section>

        <div className="profile-login-required">

          <div className="profile-login-icon">
            <i className="bi bi-person-lock"></i>
          </div>

          <h2>
            Login Required
          </h2>

          <p>
            Please login to view and
            manage your profile.
          </p>

          <Link
            to="/login"
            className="auth-submit-btn profile-login-btn"
          >
            LOGIN

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
    <main className="profile-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="profile-header">

        <p>
          ACCOUNT CENTER
        </p>

        <h1>
          My Profile
        </h1>

        <span>
          Manage your personal information
          and account.
        </span>

      </section>

      {/* =====================================================
          PROFILE LAYOUT
      ===================================================== */}

      <section className="profile-layout">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="profile-sidebar">

          {/* =================================================
              PROFILE IMAGE
          ================================================= */}

          <div className="profile-avatar-wrapper">

            <div
              className={`profile-avatar ${
                profile.profileImage
                  ? "has-image"
                  : ""
              }`}
              onClick={
                editing
                  ? handleChoosePhoto
                  : undefined
              }
              role={
                editing
                  ? "button"
                  : undefined
              }
              tabIndex={
                editing
                  ? 0
                  : undefined
              }
              onKeyDown={(e) => {
                if (
                  editing &&
                  (e.key ===
                    "Enter" ||
                    e.key ===
                      " ")
                ) {
                  handleChoosePhoto();
                }
              }}
            >

              {profile.profileImage ? (
                <img
                  src={
                    profile.profileImage
                  }
                  alt={
                    profile.name ||
                    "Profile"
                  }
                  className="profile-avatar-image"
                />
              ) : (
                getInitial()
              )}

              {/* CAMERA BUTTON */}

              {editing && (
                <span className="profile-avatar-camera">
                  <i className="bi bi-camera-fill"></i>
                </span>
              )}

            </div>

            {/* REMOVE PHOTO */}

            {editing &&
              profile.profileImage && (
                <button
                  type="button"
                  className="profile-remove-photo"
                  onClick={
                    handleRemovePhoto
                  }
                  disabled={
                    saving
                  }
                >
                  <i className="bi bi-trash3"></i>
                  Remove
                </button>
              )}

            {/* HIDDEN FILE INPUT */}

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={
                handleImageChange
              }
              hidden
            />

          </div>

          <h2>
            {profile.name ||
              "User"}
          </h2>

          <p>
            {profile.email}
          </p>

          {editing && (
            <small className="profile-photo-hint">
              Click your photo to change it
            </small>
          )}

          {/* =================================================
              MENU
          ================================================= */}

          <nav className="profile-menu">

            <Link
              to="/profile"
              className="active"
            >
              <i className="bi bi-person"></i>

              Profile
            </Link>

            <Link
              to="/orders"
            >
              <i className="bi bi-box"></i>

              My Orders

              <span>
                {orderCount}
              </span>
            </Link>

            <Link
              to="/wishlist"
            >
              <i className="bi bi-heart"></i>

              Wishlist

              <span>
                {wishlistCount}
              </span>
            </Link>

            <Link
              to="/cart"
            >
              <i className="bi bi-cart"></i>

              Cart

              <span>
                {cartCount}
              </span>
            </Link>

            <button
              type="button"
              className="profile-logout-link"
              onClick={
                handleLogout
              }
            >
              <i className="bi bi-box-arrow-right"></i>

              Logout
            </button>

          </nav>

        </aside>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <section className="profile-content">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="profile-content-header">

            <div>

              <p>
                PERSONAL INFORMATION
              </p>

              <h2>
                Profile Details
              </h2>

            </div>

            {!editing && (
              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => {
                  setEditing(true);
                  setError("");
                }}
              >
                <i className="bi bi-pencil"></i>

                Edit Profile
              </button>
            )}

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="profile-error">

              <i className="bi bi-exclamation-circle"></i>

              <span>
                {error}
              </span>

            </div>
          )}

          {/* =================================================
              PHOTO EDIT CARD
          ================================================= */}

          {editing && (
            <div className="profile-photo-edit-card">

              <div className="profile-photo-edit-icon">
                <i className="bi bi-image"></i>
              </div>

              <div className="profile-photo-edit-text">

                <strong>
                  Profile Photo
                </strong>

                <span>
                  JPG, PNG or WEBP · Maximum 5MB
                </span>

              </div>

              <button
                type="button"
                className="profile-change-photo-btn"
                onClick={
                  handleChoosePhoto
                }
                disabled={
                  saving
                }
              >
                <i className="bi bi-upload"></i>

                {profile.profileImage
                  ? "Change Photo"
                  : "Upload Photo"}
              </button>

            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <div className="profile-form">

            {/* NAME */}

            <div className="profile-field">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={
                  profile.name
                }
                onChange={
                  handleChange
                }
                disabled={
                  !editing ||
                  saving
                }
              />

            </div>

            {/* EMAIL */}

            <div className="profile-field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={
                  profile.email
                }
                onChange={
                  handleChange
                }
                disabled={
                  !editing ||
                  saving
                }
              />

            </div>

            {/* PHONE */}

            <div className="profile-field">

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                placeholder="10-digit phone number"
                value={
                  profile.phone
                }
                onChange={
                  handleChange
                }
                maxLength="10"
                inputMode="numeric"
                disabled={
                  !editing ||
                  saving
                }
              />

            </div>

            {/* CITY */}

            <div className="profile-field">

              <label>
                City
              </label>

              <input
                type="text"
                name="city"
                placeholder="Enter your city"
                value={
                  profile.city
                }
                onChange={
                  handleChange
                }
                disabled={
                  !editing ||
                  saving
                }
              />

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          {editing && (
            <div className="profile-actions">

              <button
                type="button"
                className="cancel-profile-btn"
                disabled={
                  saving
                }
                onClick={
                  handleCancel
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-profile-btn"
                disabled={
                  saving
                }
                onClick={
                  handleSave
                }
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          )}

          {/* =================================================
              ACCOUNT STATS
          ================================================= */}

          <div className="profile-stats">

            <div className="profile-stat-card">

              <i className="bi bi-box-seam"></i>

              <div>

                <strong>
                  {orderCount}
                </strong>

                <span>
                  Orders
                </span>

              </div>

            </div>

            <div className="profile-stat-card">

              <i className="bi bi-heart"></i>

              <div>

                <strong>
                  {wishlistCount}
                </strong>

                <span>
                  Wishlist
                </span>

              </div>

            </div>

            <div className="profile-stat-card">

              <i className="bi bi-cart"></i>

              <div>

                <strong>
                  {cartCount}
                </strong>

                <span>
                  Cart Items
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <div className="profile-info-cards">

            {/* ORDERS */}

            <div>

              <i className="bi bi-box-seam"></i>

              <div>

                <strong>
                  My Orders
                </strong>

                <span>
                  View your complete
                  order history.
                </span>

              </div>

              <Link
                to="/orders"
                aria-label="View orders"
              >
                <i className="bi bi-arrow-right"></i>
              </Link>

            </div>

            {/* WISHLIST */}

            <div>

              <i className="bi bi-heart"></i>

              <div>

                <strong>
                  Wishlist
                </strong>

                <span>
                  View products you
                  have saved.
                </span>

              </div>

              <Link
                to="/wishlist"
                aria-label="View wishlist"
              >
                <i className="bi bi-arrow-right"></i>
              </Link>

            </div>

            {/* CART */}

            <div>

              <i className="bi bi-cart"></i>

              <div>

                <strong>
                  Shopping Cart
                </strong>

                <span>
                  Continue shopping
                  and checkout.
                </span>

              </div>

              <Link
                to="/cart"
                aria-label="View cart"
              >
                <i className="bi bi-arrow-right"></i>
              </Link>

            </div>

          </div>

        </section>

      </section>

    </main>
  );
}

export default Profile;