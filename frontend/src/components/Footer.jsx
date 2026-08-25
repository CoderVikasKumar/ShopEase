import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">

        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="footer-logo-icon">
              <i className="bi bi-bag-fill"></i>
            </div>

            <div>
              <h2>
                Shop<span>Ease</span>
              </h2>

              <p>Shop Smart. Live Better.</p>
            </div>
          </Link>

          <p className="footer-description">
            Discover quality products at amazing prices.
            Shop with confidence and enjoy fast, secure delivery.
          </p>

          <div className="social-links">
            <a href="#!" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>

            <a href="#!" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>

            <a href="#!" aria-label="Twitter">
              <i className="bi bi-twitter-x"></i>
            </a>

            <a href="#!" aria-label="YouTube">
              <i className="bi bi-youtube"></i>
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Shop</h3>

          <Link to="/products">New Arrivals</Link>
          <Link to="/categories">Women</Link>
          <Link to="/categories">Men</Link>
          <Link to="/categories">Electronics</Link>
          <Link to="/products">Deals</Link>
        </div>

        <div className="footer-column">
          <h3>Help</h3>

          <Link to="/orders">Track Order</Link>
          <Link to="/profile">My Account</Link>
          <Link to="/checkout">Shipping Info</Link>
          <Link to="/checkout">Returns</Link>
          <Link to="/checkout">FAQ</Link>
        </div>

        <div className="footer-column">
          <h3>Contact</h3>

          <p>
            <i className="bi bi-geo-alt"></i>
            123 Market Street
          </p>

          <p>
            <i className="bi bi-telephone"></i>
            +1 234 567 890
          </p>

          <p>
            <i className="bi bi-envelope"></i>
            support@shopease.com
          </p>

          <p>
            <i className="bi bi-clock"></i>
            Mon - Sat: 9 AM - 8 PM
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 ShopEase. All rights reserved.</p>

        <div>
          <Link to="#!">Privacy Policy</Link>
          <Link to="#!">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;