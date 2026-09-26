import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "../styles/AdminUsers.css";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState("all");

  const [updatingUserId, setUpdatingUserId] =
    useState("");

  // =========================================================
  // CUSTOMER PROFILE DRAWER
  // =========================================================

  const [selectedUser, setSelectedUser] =
    useState(null);

  // =========================================================
  // RESET PASSWORD MODAL
  // =========================================================

  const [resetUser, setResetUser] =
    useState(null);

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [resettingPassword, setResettingPassword] =
    useState(false);

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {
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
          "https://shopease-backend-txtm.onrender.com/api/admin/users",
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

        localStorage.removeItem(
          "shopease_remember_me"
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
            "Unable to load users."
        );
      }

      setUsers(
        Array.isArray(data.users)
          ? data.users
          : []
      );
    } catch (err) {
      console.error(
        "Admin users error:",
        err
      );

      setError(
        err.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [navigate]);

  // =========================================================
  // FILTERED USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const name =
        user.name?.toLowerCase() || "";

      const email =
        user.email?.toLowerCase() || "";

      const phone =
        String(user.phone || "")
          .toLowerCase();

      const city =
        user.city?.toLowerCase() || "";

      const role =
        user.role?.toLowerCase() ||
        "user";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        city.includes(query);

      const matchesRole =
        roleFilter === "all" ||
        role === roleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });
  }, [
    users,
    search,
    roleFilter,
  ]);

  // =========================================================
  // COUNTS
  // =========================================================

  const adminCount =
    users.filter(
      (user) =>
        user.role === "admin"
    ).length;

  const customerCount =
    users.filter(
      (user) =>
        user.role !== "admin"
    ).length;

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
  };

  // =========================================================
  // OPEN PROFILE
  // =========================================================

  const handleViewProfile = (user) => {
    setSelectedUser(user);
  };

  // =========================================================
  // CLOSE PROFILE
  // =========================================================

  const handleCloseProfile = () => {
    setSelectedUser(null);
  };

  // =========================================================
  // OPEN RESET PASSWORD
  // =========================================================

  const handleOpenResetPassword = (
    user
  ) => {
    setResetUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  // =========================================================
  // CLOSE RESET PASSWORD
  // =========================================================

  const handleCloseResetPassword = () => {
    if (resettingPassword) {
      return;
    }

    setResetUser(null);
    setNewPassword("");
    setConfirmPassword("");
  };

  // =========================================================
  // RESET USER PASSWORD
  // =========================================================

  const handleResetPassword = async () => {
    if (!resetUser) {
      return;
    }

    const password =
      newPassword.trim();

    const confirm =
      confirmPassword.trim();

    if (!password) {
      setError(
        "Please enter a new password."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password.length > 100) {
      setError(
        "Password is too long."
      );
      return;
    }

    if (password !== confirm) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    const token =
      localStorage.getItem(
        "shopease_token"
      );

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setResettingPassword(true);
      setError("");

      const response =
        await fetch(
          `https://shopease-backend-txtm.onrender.com/api/admin/users/${encodeURIComponent(
            resetUser._id
          )}/password`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              password,
            }),
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

        localStorage.removeItem(
          "shopease_remember_me"
        );

        navigate("/login");
        return;
      }

      if (response.status === 403) {
        throw new Error(
          data.message ||
            "Admin access required."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to reset password."
        );
      }

      // Close modal and clear password fields.
      setResetUser(null);
      setNewPassword("");
      setConfirmPassword("");

      // Clear any stale error.
      setError("");

      window.alert(
        "Password reset successfully."
      );
    } catch (err) {
      console.error(
        "Reset password error:",
        err
      );

      setError(
        err.message ||
          "Unable to reset password."
      );
    } finally {
      setResettingPassword(false);
    }
  };

  // =========================================================
  // CHANGE ROLE
  // =========================================================

  const handleRoleChange = async (
    userId,
    currentRole
  ) => {
    const token =
      localStorage.getItem(
        "shopease_token"
      );

    if (!token) {
      navigate("/login");
      return;
    }

    const newRole =
      currentRole === "admin"
        ? "user"
        : "admin";

    const roleName =
      newRole === "admin"
        ? "Admin"
        : "User";

    const confirmed =
      window.confirm(
        `Are you sure you want to make this user ${roleName}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(
        String(userId)
      );

      setError("");

      const response =
        await fetch(
          `https://shopease-backend-txtm.onrender.com/api/admin/users/${encodeURIComponent(
            userId
          )}/role`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              role: newRole,
            }),
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

        localStorage.removeItem(
          "shopease_remember_me"
        );

        navigate("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          data.message ||
            "Admin access required."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update user role."
        );
      }

      const nextRole =
        data?.user?.role ||
        newRole;

      setUsers((prev) =>
        prev.map((user) =>
          String(user._id) ===
          String(userId)
            ? {
                ...user,
                role: nextRole,
              }
            : user
        )
      );

      setSelectedUser((prev) => {
        if (
          !prev ||
          String(prev._id) !==
            String(userId)
        ) {
          return prev;
        }

        return {
          ...prev,
          role: nextRole,
        };
      });
    } catch (err) {
      console.error(
        "Role update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update user role."
      );
    } finally {
      setUpdatingUserId("");
    }
  };

  // =========================================================
  // CURRENT USER
  // =========================================================

  const getCurrentUserId = () => {
    const savedUser =
      localStorage.getItem(
        "shopease_current_user"
      );

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(
        savedUser
      )?.id;
    } catch {
      return null;
    }
  };

  const currentUserId =
    getCurrentUserId();

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
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
  // INITIALS
  // =========================================================

  const getInitials = (name) => {
    const parts =
      String(name || "User")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
      return "U";
    }

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-users-page">

        <section className="admin-users-header">

          <div>
            <p>
              ADMIN PANEL
            </p>

            <h1>
              Users
            </h1>

            <span>
              Loading registered users...
            </span>
          </div>

        </section>

        <div className="admin-users-loading">

          <i className="bi bi-arrow-repeat"></i>

          <h2>
            Loading Users
          </h2>

          <p>
            Please wait...
          </p>

        </div>

      </main>
    );
  }

  // =========================================================
  // FULL ERROR
  // =========================================================

  if (
    error &&
    users.length === 0 &&
    !resetUser
  ) {
    return (
      <main className="admin-users-page">

        <section className="admin-users-header">

          <div>

            <p>
              ADMIN PANEL
            </p>

            <h1>
              Users
            </h1>

            <span>
              Manage registered users.
            </span>

          </div>

          <Link
            to="/admin"
            className="admin-users-dashboard-btn"
          >
            <i className="bi bi-grid"></i>
            Dashboard
          </Link>

        </section>

        <div className="admin-users-error">

          <i className="bi bi-exclamation-circle"></i>

          <span>
            {error}
          </span>

        </div>

      </main>
    );
  }

  return (
    <main className="admin-users-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="admin-users-header">

        <div>

          <p>
            ADMIN PANEL
          </p>

          <h1>
            Users
          </h1>

          <span>
            Manage all registered
            ShopEase users.
          </span>

        </div>

        <div className="admin-users-header-actions">

          <button
            type="button"
            className="admin-users-refresh-btn"
            onClick={loadUsers}
            disabled={loading}
          >
            <i className="bi bi-arrow-repeat"></i>
            Refresh
          </button>

          <Link
            to="/admin"
            className="admin-users-dashboard-btn"
          >
            <i className="bi bi-grid"></i>
            Dashboard
          </Link>

        </div>

      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-users-error">

          <i className="bi bi-exclamation-circle"></i>

          <span>
            {error}
          </span>

        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="admin-users-stats">

        <div className="admin-users-stat">

          <div>
            <i className="bi bi-people"></i>
          </div>

          <section>

            <span>
              Total Users
            </span>

            <strong>
              {users.length}
            </strong>

          </section>

        </div>

        <div className="admin-users-stat">

          <div>
            <i className="bi bi-shield-check"></i>
          </div>

          <section>

            <span>
              Admins
            </span>

            <strong>
              {adminCount}
            </strong>

          </section>

        </div>

        <div className="admin-users-stat">

          <div>
            <i className="bi bi-person-check"></i>
          </div>

          <section>

            <span>
              Customers
            </span>

            <strong>
              {customerCount}
            </strong>

          </section>

        </div>

      </section>

      {/* =====================================================
          USERS CARD
      ===================================================== */}

      <section className="admin-users-card">

        <div className="admin-users-card-header">

          <div>

            <p>
              REGISTERED USERS
            </p>

            <h2>
              User List
            </h2>

          </div>

          <span>
            {filteredUsers.length} Users
          </span>

        </div>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div className="admin-users-tools">

          <div className="admin-users-search">

            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search name, email, phone or city..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                className="admin-users-clear-search"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <i className="bi bi-x"></i>
              </button>
            )}

          </div>

          <div className="admin-users-filters">

            <button
              type="button"
              className={
                roleFilter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRoleFilter("all")
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                roleFilter === "admin"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRoleFilter("admin")
              }
            >
              Admins
            </button>

            <button
              type="button"
              className={
                roleFilter === "user"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRoleFilter("user")
              }
            >
              Users
            </button>

          </div>

        </div>

        {/* =================================================
            RESULT BAR
        ================================================= */}

        {(search ||
          roleFilter !== "all") && (
          <div className="admin-users-result-bar">

            <span>
              Showing{" "}
              <strong>
                {filteredUsers.length}
              </strong>
              {" "}of{" "}
              <strong>
                {users.length}
              </strong>
              {" "}users
            </span>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>
        )}

        {/* =================================================
            USER LIST
        ================================================= */}

        {filteredUsers.length === 0 ? (

          <div className="admin-users-empty">

            <i className="bi bi-search"></i>

            <h2>
              No Users Found
            </h2>

            <p>
              No user matches your
              current search or filter.
            </p>

            <button
              type="button"
              className="admin-users-empty-btn"
              onClick={clearFilters}
            >
              CLEAR FILTERS
            </button>

          </div>

        ) : (

          <div className="admin-users-list">

            {filteredUsers.map(
              (user) => {

                const userId =
                  String(user._id);

                const isUpdating =
                  updatingUserId ===
                  userId;

                const isCurrentUser =
                  String(
                    currentUserId
                  ) === userId;

                const cannotDemoteSelf =
                  isCurrentUser &&
                  user.role === "admin";

                return (
                  <article
                    className="admin-user-row"
                    key={userId}
                  >

                    {/* AVATAR */}

                    <div className="admin-user-avatar">
                      {getInitials(
                        user.name
                      )}
                    </div>

                    {/* USER */}

                    <div className="admin-user-main">

                      <strong>
                        {user.name ||
                          "Unnamed User"}
                      </strong>

                      <span>
                        {user.email ||
                          "No email"}
                      </span>

                    </div>

                    {/* PHONE */}

                    <div className="admin-user-detail">

                      <span>
                        PHONE
                      </span>

                      <strong>
                        {user.phone ||
                          "—"}
                      </strong>

                    </div>

                    {/* CITY */}

                    <div className="admin-user-detail">

                      <span>
                        CITY
                      </span>

                      <strong>
                        {user.city ||
                          "—"}
                      </strong>

                    </div>

                    {/* ROLE */}

                    <div className="admin-user-role">

                      <span
                        className={
                          user.role ===
                          "admin"
                            ? "admin-role-badge admin"
                            : "admin-role-badge user"
                        }
                      >
                        {user.role ===
                        "admin"
                          ? "Admin"
                          : "User"}
                      </span>

                      <button
                        type="button"
                        className="admin-role-change-btn"
                        disabled={
                          isUpdating ||
                          cannotDemoteSelf
                        }
                        title={
                          cannotDemoteSelf
                            ? "You cannot remove your own admin access."
                            : user.role ===
                              "admin"
                            ? "Remove admin access"
                            : "Grant admin access"
                        }
                        onClick={() =>
                          handleRoleChange(
                            user._id,
                            user.role
                          )
                        }
                      >
                        {isUpdating
                          ? "Updating..."
                          : user.role ===
                            "admin"
                          ? "Make User"
                          : "Make Admin"}
                      </button>

                    </div>

                    {/* JOINED */}

                    <div className="admin-user-detail">

                      <span>
                        JOINED
                      </span>

                      <strong>
                        {formatDate(
                          user.createdAt
                        )}
                      </strong>

                    </div>

                    {/* VIEW PROFILE */}

                    <div className="admin-user-actions">

                      <button
                        type="button"
                        className="admin-user-view-btn"
                        onClick={() =>
                          handleViewProfile(
                            user
                          )
                        }
                      >
                        <i className="bi bi-person-vcard"></i>
                        View
                      </button>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* =====================================================
          CUSTOMER PROFILE DRAWER
      ===================================================== */}

      {selectedUser && (
        <div
          className="admin-user-drawer-overlay"
          onClick={
            handleCloseProfile
          }
        >

          <aside
            className="admin-user-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* DRAWER HEADER */}

            <div className="admin-user-drawer-header">

              <div>

                <span>
                  CUSTOMER PROFILE
                </span>

                <h2>
                  User Details
                </h2>

              </div>

              <button
                type="button"
                className="admin-user-drawer-close"
                onClick={
                  handleCloseProfile
                }
                aria-label="Close profile"
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            {/* DRAWER BODY */}

            <div className="admin-user-drawer-body">

              {/* PROFILE HERO */}

              <div className="admin-user-profile-hero">

                <div className="admin-user-profile-avatar">
                  {getInitials(
                    selectedUser.name
                  )}
                </div>

                <div>

                  <h3>
                    {selectedUser.name ||
                      "Unnamed User"}
                  </h3>

                  <span>
                    {selectedUser.role ===
                    "admin"
                      ? "Administrator"
                      : "ShopEase Customer"}
                  </span>

                </div>

                <span
                  className={
                    selectedUser.role ===
                    "admin"
                      ? "admin-role-badge admin"
                      : "admin-role-badge user"
                  }
                >
                  {selectedUser.role ===
                  "admin"
                    ? "Admin"
                    : "Customer"}
                </span>

              </div>

              {/* CONTACT */}

              <section className="admin-user-drawer-section">

                <div className="admin-user-drawer-section-title">

                  <i className="bi bi-person-lines-fill"></i>

                  <span>
                    Contact Information
                  </span>

                </div>

                <div className="admin-user-drawer-info-grid">

                  <div>

                    <span>
                      EMAIL
                    </span>

                    <strong>
                      {selectedUser.email ||
                        "—"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      PHONE
                    </span>

                    <strong>
                      {selectedUser.phone ||
                        "—"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      CITY
                    </span>

                    <strong>
                      {selectedUser.city ||
                        "—"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      ACCOUNT CREATED
                    </span>

                    <strong>
                      {formatDate(
                        selectedUser.createdAt
                      )}
                    </strong>

                  </div>

                </div>

              </section>

              {/* ACCOUNT SECURITY */}

              <section className="admin-user-drawer-section">

                <div className="admin-user-drawer-section-title">

                  <i className="bi bi-shield-lock"></i>

                  <span>
                    Account Security
                  </span>

                </div>

                <div className="admin-user-security-card">

                  <div>

                    <span>
                      PASSWORD
                    </span>

                    <strong>
                      ••••••••••••••
                    </strong>

                  </div>

                  <small>
                    The existing password is hidden.
                    Set a new password when the
                    customer cannot log in.
                  </small>

                </div>

                <button
                  type="button"
                  className="admin-reset-password-btn"
                  onClick={() =>
                    handleOpenResetPassword(
                      selectedUser
                    )
                  }
                >
                  <i className="bi bi-key"></i>
                  Reset Password
                </button>

              </section>

              {/* ROLE */}

              <section className="admin-user-drawer-section">

                <div className="admin-user-drawer-section-title">

                  <i className="bi bi-person-badge"></i>

                  <span>
                    Account Role
                  </span>

                </div>

                <div className="admin-user-role-card">

                  <div>

                    <span>
                      CURRENT ROLE
                    </span>

                    <strong>
                      {selectedUser.role ===
                      "admin"
                        ? "Administrator"
                        : "Customer"}
                    </strong>

                  </div>

                  <button
                    type="button"
                    className="admin-role-change-btn drawer-role-btn"
                    disabled={
                      updatingUserId ===
                        String(
                          selectedUser._id
                        ) ||
                      (String(
                        currentUserId
                      ) ===
                        String(
                          selectedUser._id
                        ) &&
                        selectedUser.role ===
                          "admin")
                    }
                    onClick={() =>
                      handleRoleChange(
                        selectedUser._id,
                        selectedUser.role
                      )
                    }
                  >
                    {updatingUserId ===
                    String(
                      selectedUser._id
                    )
                      ? "Updating..."
                      : selectedUser.role ===
                        "admin"
                      ? "Make User"
                      : "Make Admin"}
                  </button>

                </div>

              </section>

              {/* USER ID */}

              <section className="admin-user-drawer-section">

                <div className="admin-user-drawer-section-title">

                  <i className="bi bi-fingerprint"></i>

                  <span>
                    Account ID
                  </span>

                </div>

                <div className="admin-user-id-box">

                  {String(
                    selectedUser._id
                  )}

                </div>

              </section>

            </div>

            {/* DRAWER ACTIONS */}

            <div className="admin-user-drawer-actions">

              <Link
                to="/admin/orders"
                className="admin-user-drawer-primary-btn"
                onClick={
                  handleCloseProfile
                }
              >
                <i className="bi bi-box-seam"></i>
                View Orders
              </Link>

              <button
                type="button"
                className="admin-user-drawer-secondary-btn"
                onClick={
                  handleCloseProfile
                }
              >
                Close
              </button>

            </div>

          </aside>

        </div>
      )}

      {/* =====================================================
          RESET PASSWORD MODAL
      ===================================================== */}

      {resetUser && (
        <div
          className="admin-reset-modal-overlay"
          onClick={
            handleCloseResetPassword
          }
        >

          <div
            className="admin-reset-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="admin-reset-modal-header">

              <div>

                <span>
                  ACCOUNT SECURITY
                </span>

                <h2>
                  Reset Password
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseResetPassword
                }
                disabled={
                  resettingPassword
                }
                aria-label="Close reset password"
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="admin-reset-modal-body">

              <p>
                Set a new password for{" "}
                <strong>
                  {resetUser.name ||
                    "this customer"}
                </strong>
                . The old password will
                remain hidden.
              </p>

              <label htmlFor="admin-new-password">
                New Password
              </label>

              <input
                id="admin-new-password"
                type="password"
                value={
                  newPassword
                }
                onChange={(event) => {
                  setNewPassword(
                    event.target.value
                  );
                  setError("");
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={
                  resettingPassword
                }
              />

              <label htmlFor="admin-confirm-password">
                Confirm Password
              </label>

              <input
                id="admin-confirm-password"
                type="password"
                value={
                  confirmPassword
                }
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );
                  setError("");
                }}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                disabled={
                  resettingPassword
                }
              />

              {error && (
                <div className="admin-reset-modal-error">
                  <i className="bi bi-exclamation-circle"></i>
                  <span>
                    {error}
                  </span>
                </div>
              )}

              <small className="admin-reset-password-hint">
                Minimum 6 characters.
              </small>

            </div>

            {/* MODAL ACTIONS */}

            <div className="admin-reset-modal-actions">

              <button
                type="button"
                onClick={
                  handleCloseResetPassword
                }
                disabled={
                  resettingPassword
                }
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleResetPassword
                }
                disabled={
                  resettingPassword
                }
              >
                {resettingPassword
                  ? "Updating..."
                  : "Set New Password"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default AdminUsers;
