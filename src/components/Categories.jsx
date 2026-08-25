import { Link } from "react-router-dom";

function Categories() {
  const categories = [
    {
      name: "Women",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80",
    },
    {
      name: "Men",
      image:
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=700&q=80",
    },
    {
      name: "Electronics",
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80",
    },
    {
      name: "Home & Living",
      image:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80",
    },
    {
      name: "Beauty",
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80",
    },
  ];

  return (
    <section className="categories-section">
      <div className="section-heading">
        <div>
          <p>EXPLORE OUR COLLECTION</p>
          <h2>Shop By Category</h2>
        </div>

        <Link to="/categories" className="view-all-btn">
          View All
          <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <Link
            to="/categories"
            className="category-card"
            key={category.name}
          >
            <img src={category.image} alt={category.name} />

            <div className="category-overlay">
              <h3>{category.name}</h3>

              <span>
                Shop Now <i className="bi bi-arrow-right"></i>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Categories;