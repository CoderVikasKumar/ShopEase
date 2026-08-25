function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-content">

        <p className="hero-small-text">
          LIMITED TIME OFFER
        </p>

        <h1>
          Shop More,
          <br />
          <span>Save More!</span>
        </h1>

        <p className="hero-description">
          Discover amazing deals on your favorite products.
          Quality products, great prices and fast delivery.
        </p>

        <div className="hero-features">
          <span>
            <i className="bi bi-check-circle-fill"></i>
            Best Prices
          </span>

          <span>
            <i className="bi bi-shield-check"></i>
            Secure Payments
          </span>

          <span>
            <i className="bi bi-truck"></i>
            Fast Delivery
          </span>
        </div>

        <a href="/products" className="hero-btn">
          EXPLORE COLLECTION
          <i className="bi bi-arrow-right"></i>
        </a>
      </div>

      <div className="hero-image-area">
        <div className="hero-circle"></div>

        <div className="discount-badge">
          <span>UP TO</span>
          <strong>50%</strong>
          <small>OFF</small>
        </div>

        <div className="product-visual">
          <i className="bi bi-bag-heart-fill"></i>
        </div>
      </div>
    </section>
  );
}

export default Hero;