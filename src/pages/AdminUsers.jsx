import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // SEARCH + FILTER
  // =========================

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [updatingUserId, setUpdatingUserId] =
    useState("");

  // =========================
  // LOAD USERS
  // =========================

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
          "https://shopease-vnpn.onrender.com/api/admin/users",
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

  // =========================
  // FILTERED USERS
  // =========================

  const filteredUsers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const name =
        user.name?.toLowerCase() || "";

      const email =
        user.email?.toLowerCase() || "";

      const phone =
        user.phone?.toLowerCase() || "";

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

  // =========================
  // COUNTS
  // =========================

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

  // =========================
  // CLEAR FILTERS
  // =========================

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
  };

  // =========================
  // CHANGE ROLE
  // =========================

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
          `https://shopease-vnpn.onrender.com/api/admin/users/${userId}/role`,
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

      setUsers((prev) =>
        prev.map((user) =>
          String(user._id) ===
          String(userId)
            ? {
                ...user,
                role:
                  data.user.role,
              }
            : user
        )
      );

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

  // =========================
  // LOADING
  // =========================

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

  // =========================
  // FULL ERROR
  // =========================

  if (error && users.length === 0) {
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

      {/* HEADER */}

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

        <Link
          to="/admin"
          className="admin-users-dashboard-btn"
        >
          <i className="bi bi-grid"></i>

          Dashboard
        </Link>

      </section>


      {/* ERROR */}

      {error && (
        <div className="admin-users-error">

          <i className="bi bi-exclamation-circle"></i>

          <span>
            {error}
          </span>

        </div>
      )}


      {/* STATS */}

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


      {/* USERS CARD */}

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


        {/* SEARCH + FILTER */}

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


        {/* RESULT BAR */}

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


        {/* USER LIST */}

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

                const isUpdating =
                  updatingUserId ===
                  String(user._id);

                const savedUser =
                  localStorage.getItem(
                    "shopease_current_user"
                  );

                let currentUserId = null;

                try {
                  if (savedUser) {
                    currentUserId =
                      JSON.parse(
                        savedUser
                      )?.id;
                  }
                } catch {
                  currentUserId = null;
                }

                const isCurrentUser =
                  String(
                    currentUserId
                  ) ===
                  String(user._id);

                const cannotDemoteSelf =
                  isCurrentUser &&
                  user.role === "admin";

                return (
                  <article
                    className="admin-user-row"
                    key={user._id}
                  >

                    {/* AVATAR */}

                    <div className="admin-user-avatar">

                      {(user.name || "U")
                        .charAt(0)
                        .toUpperCase()}

                    </div>


                    {/* USER */}

                    <div className="admin-user-main">

                      <strong>
                        {user.name}
                      </strong>

                      <span>
                        {user.email}
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
                            : ""
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
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month:
                                  "short",
                                year:
                                  "numeric",
                              }
                            )
                          : "—"}
                      </strong>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </section>

    </main>
  );
}

export default AdminUsers;