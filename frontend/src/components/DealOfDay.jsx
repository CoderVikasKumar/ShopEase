import {
  useEffect,
  useState,
} from "react";

import ProductCard from "./ProductCard";

// =========================================================
// DEAL OF DAY
// =========================================================

function DealOfDay() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =======================================================
  // LOAD PRODUCTS FROM MONGODB
  // =======================================================

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://shopease-backend-txtm.onrender.com/api/products"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load deal products."
          );
        }

        const dbProducts = Array.isArray(data.products)
          ? data.products
          : [];

        // =================================================
        // NORMALIZE MONGODB PRODUCTS
        // =================================================

        const normalizedProducts = dbProducts
          .map((product) => {
            const mongoId = String(
              product?._id || ""
            ).trim();

            if (!/^[a-fA-F0-9]{24}$/.test(mongoId)) {
              return null;
            }

            const price = Number(product.price || 0);

            const oldPrice = Number(
              product.originalPrice || 0
            );

            const discount =
              oldPrice > price
                ? Math.round(
                    ((oldPrice - price) / oldPrice) * 100
                  )
                : 0;

            return {
              id: mongoId,

              name: product.name || "Product",

              description: product.description || "",

              category: product.category || "Other",

              brand: product.brand || "ShopEase",

              price,

              oldPrice,

              discount,

              rating: Number(product.rating || 0),

              reviews: Number(product.reviews || 0),

              image: product.image || "",

              stock: Number(product.stock || 0),

              featured: Boolean(product.featured),

              isActive: product.isActive !== false,
            };
          })
          .filter(Boolean);

        // =================================================
        // ONLY DISCOUNTED PRODUCTS
        // =================================================

        const dealProducts = normalizedProducts
          .filter(
            (product) =>
              product.oldPrice > product.price
          )
          .sort(
            (a, b) =>
              b.discount - a.discount
          )
          .slice(0, 4);

        // =================================================
        // FALLBACK
        // =================================================

        const finalProducts =
          dealProducts.length > 0
            ? dealProducts
            : normalizedProducts.slice(0, 4);

        if (mounted) {
          setProducts(finalProducts);
        }
      } catch (err) {
        console.error(
          "Deal of Day loading error:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Unable to load deal products."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <section className="deal-section">
        <div className="section-heading">
          <div>
            <p>LIMITED TIME DEALS</p>

            <h2>Deal of the Day</h2>
          </div>

          <div className="deal-timer">
            <span>ENDS IN</span>

            <strong>08 : 24 : 36</strong>
          </div>
        </div>

        <div className="products-grid">
          <div className="no-products">
            Loading deals...
          </div>
        </div>
      </section>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <section className="deal-section">
        <div className="section-heading">
          <div>
            <p>LIMITED TIME DEALS</p>

            <h2>Deal of the Day</h2>
          </div>

          <div className="deal-timer">
            <span>ENDS IN</span>

            <strong>08 : 24 : 36</strong>
          </div>
        </div>

        <div className="no-products">
          <h3>Unable to load deals</h3>

          <p>{error}</p>
        </div>
      </section>
    );
  }

  // =======================================================
  // EMPTY
  // =======================================================

  if (products.length === 0) {
    return (
      <section className="deal-section">
        <div className="section-heading">
          <div>
            <p>LIMITED TIME DEALS</p>

            <h2>Deal of the Day</h2>
          </div>

          <div className="deal-timer">
            <span>ENDS IN</span>

            <strong>08 : 24 : 36</strong>
          </div>
        </div>

        <div className="no-products">
          <h3>No deals available</h3>

          <p>
            Please add products from the
            admin panel.
          </p>
        </div>
      </section>
    );
  }

  // =======================================================
  // MAIN
  // =======================================================

  return (
    <section className="deal-section">

      {/* HEADER */}

      <div className="section-heading">
        <div>
          <p>LIMITED TIME DEALS</p>

          <h2>Deal of the Day</h2>
        </div>

        <div className="deal-timer">
          <span>ENDS IN</span>

          <strong>08 : 24 : 36</strong>
        </div>
      </div>

      {/* PRODUCTS */}

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

    </section>
  );
}

export default DealOfDay;