function Newsletter() {
  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <div className="newsletter-icon">
          <i className="bi bi-envelope-paper-heart"></i>
        </div>

        <div className="newsletter-text">
          <p>STAY IN THE LOOP</p>

          <h2>Get 10% Off Your First Order</h2>

          <span>
            Subscribe to our newsletter and get exclusive deals,
            new arrivals and special offers.
          </span>
        </div>

        <form className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email address"
          />

          <button type="submit">
            SUBSCRIBE
            <i className="bi bi-arrow-right"></i>
          </button>
        </form>
      </div>
    </section>
  );
}

export default Newsletter;