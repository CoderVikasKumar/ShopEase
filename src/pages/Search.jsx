import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard";

// =========================================================
// VALID MONGODB OBJECT ID
// =========================================================

const isValidMongoId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(
    String(id || "").trim()
  );
};

// =========================================================
// SEARCH PAGE
// =========================================================

function Search() {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [query, setQuery] =
    useState("");

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
          "http://localhost:5000/api/products"
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load products."
          );
        }

        const dbProducts =
          Array.isArray(
            data.products
          )
            ? data.products
            : [];

        const normalizedProducts =
          dbProducts
            .map((product) => {
              const mongoId =
                String(
                  product?._id || ""
                ).trim();

              // Ignore invalid MongoDB IDs
              if (
                !isValidMongoId(
                  mongoId
                )
              ) {
                console.warn(
                  "Skipping invalid product:",
                  product
                );

                return null;
              }

              const price =
                Number(
                  product.price || 0
                );

              const oldPrice =
                Number(
                  product.originalPrice ||
                    0
                );

              const discount =
                oldPrice > price
                  ? Math.round(
                      ((oldPrice -
                        price) /
                        oldPrice) *
                        100
                    )
                  : 0;

              return {
                id: mongoId,

                name:
                  product.name ||
                  "Product",

                description:
                  product.description ||
                  "",

                category:
                  product.category ||
                  "Other",

                brand:
                  product.brand ||
                  "ShopEase",

                price,

                oldPrice,

                discount,

                rating:
                  Number(
                    product.rating || 0
                  ),

                reviews:
                  Number(
                    product.reviews || 0
                  ),

                image:
                  product.image || "",

                stock:
                  Number(
                    product.stock || 0
                  ),

                featured:
                  Boolean(
                    product.featured
                  ),

                isActive:
                  product.isActive !==
                  false,

                createdAt:
                  product.createdAt,
              };
            })
            .filter(Boolean);

        if (mounted) {
          setProducts(
            normalizedProducts
          );
        }
      } catch (err) {
        console.error(
          "Search products error:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Unable to load products."
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
  // SEARCH RESULTS
  // =======================================================

  const results = useMemo(() => {
    const value =
      query
        .trim()
        .toLowerCase();

    if (!value) {
      return [];
    }

    return products.filter(
      (product) => {
        return (
          product.name
            ?.toLowerCase()
            .includes(value) ||
          product.category
            ?.toLowerCase()
            .includes(value) ||
          product.brand
            ?.toLowerCase()
            .includes(value) ||
          product.description
            ?.toLowerCase()
            .includes(value)
        );
      }
    );
  }, [
    products,
    query,
  ]);

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <main className="search-page">

        <section className="search-header">

          <p>
            FIND YOUR FAVORITES
          </p>

          <h1>
            Search Products
          </h1>

          <div className="large-search-box">

            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search for products, categories..."
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
              autoFocus
            />

          </div>

        </section>

        <div className="search-empty">

          <i className="bi bi-arrow-repeat"></i>

          <h2>
            Loading Products
          </h2>

          <p>
            Please wait...
          </p>

        </div>

      </main>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <main className="search-page">

        <section className="search-header">

          <p>
            FIND YOUR FAVORITES
          </p>

          <h1>
            Search Products
          </h1>

          <div className="large-search-box">

            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search for products, categories..."
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
              autoFocus
            />

          </div>

        </section>

        <div className="search-empty">

          <i className="bi bi-exclamation-circle"></i>

          <h2>
            Unable to Load Products
          </h2>

          <p>
            {error}
          </p>

        </div>

      </main>
    );
  }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <main className="search-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="search-header">

        <p>
          FIND YOUR FAVORITES
        </p>

        <h1>
          Search Products
        </h1>

        <div className="large-search-box">

          <i className="bi bi-search"></i>

          <input
            type="text"
            placeholder="Search for products, categories..."
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
            autoFocus
          />

          {query && (
            <button
              type="button"
              onClick={() =>
                setQuery("")
              }
              aria-label="Clear search"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}

        </div>

      </section>

      {/* =========================
          RESULT TEXT
      ========================= */}

      {query && (
        <div className="search-result-text">

          <strong>
            {results.length}
          </strong>

          {" "}result(s) found for{" "}

          <strong>
            "{query}"
          </strong>

        </div>
      )}

      {/* =========================
          NO QUERY
      ========================= */}

      {!query ? (

        <div className="search-empty">

          <i className="bi bi-search"></i>

          <h2>
            What are you looking for?
          </h2>

          <p>
            Search for shoes,
            electronics, fashion,
            accessories and more.
          </p>

          <Link
            to="/products"
            className="continue-shopping-btn"
          >
            BROWSE ALL PRODUCTS

            <i className="bi bi-arrow-right"></i>
          </Link>

        </div>

      ) : results.length > 0 ? (

        <section className="search-results-grid">

          {results.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}

        </section>

      ) : (

        <div className="search-empty">

          <i className="bi bi-search"></i>

          <h2>
            No Products Found
          </h2>

          <p>
            Try searching for another
            product or category.
          </p>

        </div>

      )}

    </main>
  );
}

export default Search;