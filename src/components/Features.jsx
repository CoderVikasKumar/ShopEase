function Features() {
  const features = [
    {
      icon: "bi-truck",
      title: "Free Shipping",
      description: "On orders over $75",
    },
    {
      icon: "bi-shield-check",
      title: "Secure Payment",
      description: "100% secure checkout",
    },
    {
      icon: "bi-arrow-repeat",
      title: "Easy Returns",
      description: "30-day return policy",
    },
    {
      icon: "bi-headset",
      title: "24/7 Support",
      description: "We're here to help",
    },
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        {features.map((feature, index) => (
          <div className="feature-item" key={index}>
            <div className="feature-icon">
              <i className={`bi ${feature.icon}`}></i>
            </div>

            <div className="feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;