import { Link } from "react-router-dom";

function CategoriesPage() {
  const categories = [
    {
      name: "Women",
      icon: "bi-person-standing-dress",
      count: 24,
      description: "Fashion, dresses, bags and more",
    },
    {
      name: "Men",
      icon: "bi-person-standing",
      count: 18,
      description: "Clothing, shoes and accessories",
    },
    {
      name: "Electronics",
      icon: "bi-phone",
      count: 31,
      description: "Phones, watches, headphones and more",
    },
    {
      name: "Home & Living",
      icon: "bi-house",
      count: 22,
      description: "Furniture, decor and essentials",
    },
    {
      name: "Beauty",
      icon: "bi-stars",
      count: 16,
      description: "Beauty, skincare and personal care",
    },
    {
      name: "Footwear",
      icon: "bi-bootstrap",
      count: 19,
      description: "Sneakers, shoes and sandals",
    },
    {
      name: "Accessories",
      icon: "bi-watch",
      count: 14,
      description: "Watches, bags and other accessories",
    },
    {
      name: "Lifestyle",
      icon: "bi-balloon",
      count: 12,
      description: "Lifestyle products for everyday use",
    },
  ];

  return (
    <main className="categories-page">

      <section className="categories-page-header">
        <p>EXPLORE SHOP EASE</p>

        <h1>Shop By Category</h1>

        <span>
          Browse our collections and find products made
          for your lifestyle.
        </span>
      </section>

      <section className="categories-page-grid">

        {categories.map((category) => (
          <Link
            to="/products"
            className="categories-page-card"
            key={category.name}
          >
            <div className="categories-page-icon">
              <i className={`bi ${category.icon}`}></i>
            </div>

            <div className="categories-page-info">
              <h2>{category.name}</h2>

              <p>{category.description}</p>

              <span>
                {category.count} Products
              </span>
            </div>

            <div className="categories-page-arrow">
              <i className="bi bi-arrow-right"></i>
            </div>
          </Link>
        ))}

      </section>

    </main>
  );
}

export default CategoriesPage;