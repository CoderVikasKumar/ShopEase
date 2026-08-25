import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================
  // LOGIN
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const email =
      formData.email.trim().toLowerCase();

    const password =
      formData.password;

    // =========================
    // VALIDATION
    // =========================

    if (!email) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      // =========================
      // BACKEND LOGIN API
      // =========================

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      // =========================
      // API ERROR
      // =========================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Invalid email or password."
        );
      }

      // =========================
      // USER DATA
      // =========================

      const user = data.user;

      // =========================
      // SAVE JWT
      // =========================

      localStorage.setItem(
        "shopease_token",
        data.token
      );

      // =========================
      // SAVE CURRENT USER
      // =========================

      const currentUser = {
        id: user.id,

        name: user.name,

        email: user.email,

        phone: user.phone || "",

        city: user.city || "",

        loginAt:
          new Date().toISOString(),
      };

      localStorage.setItem(
        "shopease_current_user",
        JSON.stringify(
          currentUser
        )
      );

      // =========================
      // REMEMBER ME
      // =========================

      localStorage.setItem(
        "shopease_remember_me",
        rememberMe
          ? "true"
          : "false"
      );

      // =========================
      // SUCCESS
      // =========================

      setSuccess(
        "Login successful! Redirecting..."
      );

      // =========================
      // REDIRECT
      // =========================

      const redirectTo =
        location.state?.from ||
        "/profile";

      setTimeout(() => {
        navigate(
          redirectTo,
          { replace: true }
        );
      }, 700);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <section className="auth-container">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="auth-left">

          <div className="auth-brand">

            <div className="auth-brand-icon">

              <i className="bi bi-bag-fill"></i>

            </div>

            <div>

              <h2>
                Shop<span>Ease</span>
              </h2>

              <p>
                Shop Smart. Live Better.
              </p>

            </div>

          </div>


          <h1>
            Welcome Back!
          </h1>

          <p>
            Login to your account and
            continue shopping your
            favorite products.
          </p>


          <div className="auth-benefits">

            <div>

              <i className="bi bi-bag-check"></i>

              <span>
                Manage your orders
              </span>

            </div>


            <div>

              <i className="bi bi-heart"></i>

              <span>
                Save your favorite products
              </span>

            </div>


            <div>

              <i className="bi bi-lightning-charge"></i>

              <span>
                Checkout faster
              </span>

            </div>

          </div>

        </div>


        {/* =========================
            LOGIN FORM
        ========================= */}

        <div className="auth-form-container">

          <div className="auth-form-header">

            <h1>
              Login
            </h1>

            <p>
              Don't have an account?{" "}

              <Link to="/register">
                Create one
              </Link>

            </p>

          </div>


          <form
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <i className="bi bi-envelope"></i>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot Password?
                </Link>

              </div>


              <div className="input-wrapper">

                <i className="bi bi-lock"></i>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  <i
                    className={
                      showPassword
                        ? "bi bi-eye-slash"
                        : "bi bi-eye"
                    }
                  ></i>

                </button>

              </div>

            </div>


            {/* REMEMBER ME */}

            <label className="remember-me">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
                disabled={loading}
              />

              <span>
                Remember me
              </span>

            </label>


            {/* ERROR */}

            {error && (
              <div className="auth-error">

                <i className="bi bi-exclamation-circle"></i>

                <span>
                  {error}
                </span>

              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div className="auth-success">

                <i className="bi bi-check-circle"></i>

                <span>
                  {success}
                </span>

              </div>
            )}


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >

              {loading
                ? "LOGGING IN..."
                : "LOGIN"}

              <i
                className={
                  loading
                    ? "bi bi-arrow-repeat"
                    : "bi bi-arrow-right"
                }
              ></i>

            </button>

          </form>


          {/* DIVIDER */}

          <div className="auth-divider">

            <span>
              OR
            </span>

          </div>


          {/* GOOGLE */}

          <button
            type="button"
            className="google-btn"
            disabled={loading}
            onClick={() =>
              alert(
                "Google Login will be connected later."
              )
            }
          >

            <i className="bi bi-google"></i>

            Continue with Google

          </button>

        </div>

      </section>

    </main>
  );
}

export default Login;