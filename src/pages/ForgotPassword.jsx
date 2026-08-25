import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================
  // CHECK EMAIL
  // =========================

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    let users = [];

    try {
      const savedUsers =
        localStorage.getItem(
          "shopease_users"
        );

      users = savedUsers
        ? JSON.parse(savedUsers)
        : [];

      if (!Array.isArray(users)) {
        users = [];
      }
    } catch (error) {
      console.error(
        "Users load error:",
        error
      );

      setError(
        "Unable to access account data."
      );

      return;
    }

    const userExists = users.some(
      (user) =>
        user.email.toLowerCase() ===
        normalizedEmail
    );

    if (!userExists) {
      setError(
        "No account found with this email."
      );
      return;
    }

    setEmail(normalizedEmail);

    setSuccess(
      "Account found. Create your new password."
    );

    setStep(2);
  };

  // =========================
  // RESET PASSWORD
  // =========================

  const handlePasswordReset = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    let users = [];

    try {
      const savedUsers =
        localStorage.getItem(
          "shopease_users"
        );

      users = savedUsers
        ? JSON.parse(savedUsers)
        : [];

      if (!Array.isArray(users)) {
        users = [];
      }
    } catch (error) {
      console.error(
        "Users load error:",
        error
      );

      setError(
        "Unable to update password."
      );

      return;
    }

    const updatedUsers = users.map(
      (user) =>
        user.email.toLowerCase() ===
        email.toLowerCase()
          ? {
              ...user,
              password,
            }
          : user
    );

    localStorage.setItem(
      "shopease_users",
      JSON.stringify(updatedUsers)
    );

    setSuccess(
      "Password reset successfully! Redirecting to login..."
    );

    setTimeout(() => {
      navigate("/login");
    }, 1200);
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
            Reset Your Password
          </h1>

          <p>
            Recover your account and
            create a new secure password.
          </p>

          <div className="auth-benefits">

            <div>
              <i className="bi bi-shield-check"></i>

              <span>
                Secure account recovery
              </span>
            </div>

            <div>
              <i className="bi bi-lock"></i>

              <span>
                Create a new password
              </span>
            </div>

            <div>
              <i className="bi bi-arrow-repeat"></i>

              <span>
                Get back to your account
              </span>
            </div>

          </div>

        </div>


        {/* =========================
            FORM SIDE
        ========================= */}

        <div className="auth-form-container">

          {/* STEP 1 */}

          {step === 1 && (
            <>
              <div className="auth-form-header">

                <h1>
                  Forgot Password?
                </h1>

                <p>
                  Enter your registered
                  email address.
                </p>

              </div>


              <form
                onSubmit={
                  handleEmailSubmit
                }
              >

                <div className="form-group">

                  <label htmlFor="forgot-email">
                    Email Address
                  </label>

                  <div className="input-wrapper">

                    <i className="bi bi-envelope"></i>

                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(
                          e.target.value
                        );
                        setError("");
                        setSuccess("");
                      }}
                      autoComplete="email"
                      required
                    />

                  </div>

                </div>


                {error && (
                  <div className="auth-error">

                    <i className="bi bi-exclamation-circle"></i>

                    <span>
                      {error}
                    </span>

                  </div>
                )}


                {success && (
                  <div className="auth-success">

                    <i className="bi bi-check-circle"></i>

                    <span>
                      {success}
                    </span>

                  </div>
                )}


                <button
                  type="submit"
                  className="auth-submit-btn"
                >
                  CONTINUE

                  <i className="bi bi-arrow-right"></i>
                </button>

              </form>


              <div className="auth-divider">
                <span>
                  OR
                </span>
              </div>


              <Link
                to="/login"
                className="back-to-login-link"
              >
                <i className="bi bi-arrow-left"></i>

                Back to Login
              </Link>
            </>
          )}


          {/* STEP 2 */}

          {step === 2 && (
            <>
              <div className="auth-form-header">

                <h1>
                  Create New Password
                </h1>

                <p>
                  Set a new password for:
                  <br />

                  <strong>
                    {email}
                  </strong>
                </p>

              </div>


              <form
                onSubmit={
                  handlePasswordReset
                }
              >

                {/* NEW PASSWORD */}

                <div className="form-group">

                  <label htmlFor="new-password">
                    New Password
                  </label>

                  <div className="input-wrapper">

                    <i className="bi bi-lock"></i>

                    <input
                      id="new-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(
                          e.target.value
                        );
                        setError("");
                      }}
                      minLength="6"
                      autoComplete="new-password"
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

                  <label htmlFor="confirm-new-password">
                    Confirm Password
                  </label>

                  <div className="input-wrapper">

                    <i className="bi bi-shield-lock"></i>

                    <input
                      id="confirm-new-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm new password"
                      value={
                        confirmPassword
                      }
                      onChange={(e) => {
                        setConfirmPassword(
                          e.target.value
                        );
                        setError("");
                      }}
                      minLength="6"
                      autoComplete="new-password"
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


                {error && (
                  <div className="auth-error">

                    <i className="bi bi-exclamation-circle"></i>

                    <span>
                      {error}
                    </span>

                  </div>
                )}


                {success && (
                  <div className="auth-success">

                    <i className="bi bi-check-circle"></i>

                    <span>
                      {success}
                    </span>

                  </div>
                )}


                <button
                  type="submit"
                  className="auth-submit-btn"
                >
                  RESET PASSWORD

                  <i className="bi bi-check-lg"></i>
                </button>

              </form>

            </>
          )}

        </div>

      </section>

    </main>
  );
}

export default ForgotPassword;