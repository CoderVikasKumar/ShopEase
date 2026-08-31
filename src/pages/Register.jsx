import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  // =========================
  // FORM STATES
  // =========================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
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
  // REGISTER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();

    const email =
      formData.email.trim().toLowerCase();

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;

    // =========================
    // VALIDATION
    // =========================

    if (!name) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (!email) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Password and confirm password do not match."
      );
      return;
    }

    // =========================
    // API REQUEST
    // =========================

    try {
      setLoading(true);

      const response = await fetch(
        "https://shopease-vnpn.onrender.com/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
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
            "Registration failed."
        );
      }

      // =========================
      // SUCCESS
      // =========================

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
          "Unable to create account. Please try again."
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
            Join ShopEase
          </h1>

          <p>
            Create your account and unlock a
            better shopping experience.
          </p>


          <div className="auth-benefits">

            <div>

              <i className="bi bi-gift"></i>

              <span>
                Exclusive member offers
              </span>

            </div>


            <div>

              <i className="bi bi-truck"></i>

              <span>
                Easy order tracking
              </span>

            </div>


            <div>

              <i className="bi bi-heart"></i>

              <span>
                Save your wishlist
              </span>

            </div>

          </div>

        </div>


        {/* =========================
            FORM
        ========================= */}

        <div className="auth-form-container">

          <div className="auth-form-header">

            <h1>
              Create Account
            </h1>

            <p>
              Already have an account?{" "}

              <Link to="/login">
                Login
              </Link>

            </p>

          </div>


          <form
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <div className="input-wrapper">

                <i className="bi bi-person"></i>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="register-email">
                Email Address
              </label>

              <div className="input-wrapper">

                <i className="bi bi-envelope"></i>

                <input
                  id="register-email"
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

              <label htmlFor="register-password">
                Password
              </label>

              <div className="input-wrapper">

                <i className="bi bi-lock"></i>

                <input
                  id="register-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  minLength="6"
                  value={
                    formData.password
                  }
                  onChange={handleChange}
                  autoComplete="new-password"
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


            {/* CONFIRM PASSWORD */}

            <div className="form-group">

              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <div className="input-wrapper">

                <i className="bi bi-shield-lock"></i>

                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  minLength="6"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >

                  <i
                    className={
                      showConfirmPassword
                        ? "bi bi-eye-slash"
                        : "bi bi-eye"
                    }
                  ></i>

                </button>

              </div>

            </div>


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


            {/* TERMS */}

            <label className="terms-check">

              <input
                type="checkbox"
                disabled={loading}
                required
              />

              <span>
                I agree to the{" "}

                <Link to="/register">
                  Terms & Conditions
                </Link>{" "}

                and Privacy Policy.
              </span>

            </label>


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >

              {loading
                ? "CREATING ACCOUNT..."
                : "CREATE ACCOUNT"}

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
                "Google Sign Up will be connected later."
              )
            }
          >

            <i className="bi bi-google"></i>

            Sign up with Google

          </button>

        </div>

      </section>

    </main>
  );
}

export default Register;