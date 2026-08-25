import ProductCard from "./ProductCard";

function NewArrivals() {
  const products = [
    {
      id: 5,
      name: "Premium Cotton T-Shirt",
      category: "Men's Fashion",
      price: 24,
      oldPrice: 35,
      rating: 4.8,
      reviews: 84,
      discount: 31,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      name: "Elegant Women's Dress",
      category: "Women's Fashion",
      price: 45,
      oldPrice: 65,
      rating: 4.9,
      reviews: 126,
      discount: 30,
      image:
        "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 7,
      name: "Smart Watch Pro",
      category: "Electronics",
      price: 79,
      oldPrice: 109,
      rating: 4.7,
      reviews: 196,
      discount: 28,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 8,
      name: "Modern Backpack",
      category: "Accessories",
      price: 38,
      oldPrice: 55,
      rating: 4.6,
      reviews: 71,
      discount: 31,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="new-arrivals-section">
      <div className="section-heading">
        <div>
          <p>JUST LANDED</p>
          <h2>New Arrivals</h2>
        </div>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

      <div className="new-arrivals-button">
        <a href="/products" className="outline-shop-btn">
          VIEW ALL PRODUCTS
          <i className="bi bi-arrow-right"></i>
        </a>
      </div>
    </section>
  );
}

export default NewArrivals;