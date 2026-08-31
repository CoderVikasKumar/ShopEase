import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [showForm, setShowForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState("");

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      image: "",
      category: "",
      brand: "",
      stock: "",
      rating: "",
      reviews: "",
      featured: false,
      isActive: true,
    });

  // =========================================================
  // TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem(
      "shopease_token"
    );
  };

  // =========================================================
  // RESET FORM DATA
  // =========================================================

  const getEmptyForm = () => {
    return {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      image: "",
      category: "",
      brand: "",
      stock: "",
      rating: "",
      reviews: "",
      featured: false,
      isActive: true,
    };
  };

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://shopease-vnpn.onrender.com/api/admin/products",
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      // =========================
      // SESSION EXPIRED
      // =========================

      if (
        response.status === 401
      ) {
        localStorage.removeItem(
          "shopease_token"
        );

        localStorage.removeItem(
          "shopease_current_user"
        );

        localStorage.removeItem(
          "shopease_remember_me"
        );

        navigate("/login");
        return;
      }

      // =========================
      // NOT ADMIN
      // =========================

      if (
        response.status === 403
      ) {
        setError(
          "Admin access required."
        );

        return;
      }

      // =========================
      // API ERROR
      // =========================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load products."
        );
      }

      setProducts(
        Array.isArray(
          data.products
        )
          ? data.products
          : []
      );
    } catch (err) {
      console.error(
        "Admin products error:",
        err
      );

      setError(
        err.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadProducts();
  }, []);

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    const values =
      products
        .map(
          (product) =>
            product.category
        )
        .filter(Boolean);

    return [
      "all",
      ...new Set(values),
    ];
  }, [products]);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchesSearch =
            !query ||
            product.name
              ?.toLowerCase()
              .includes(query) ||
            product.brand
              ?.toLowerCase()
              .includes(query) ||
            product.category
              ?.toLowerCase()
              .includes(query);

          const matchesCategory =
            categoryFilter ===
              "all" ||
            product.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      products,
      search,
      categoryFilter,
    ]);

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData(
      getEmptyForm()
    );

    setEditingProduct(null);
    setShowForm(false);
    setError("");
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddForm = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log(
      "ADMIN: ADD PRODUCT CLICKED"
    );

    setEditingProduct(null);
    setError("");

    setFormData(
      getEmptyForm()
    );

    setShowForm(true);
  };

  // =========================================================
  // EDIT FORM
  // =========================================================

  const startEdit = (
    product
  ) => {
    setEditingProduct(product);

    setError("");

    setFormData({
      name:
        product.name || "",

      description:
        product.description || "",

      price:
        product.price ?? "",

      originalPrice:
        product.originalPrice ??
        "",

      image:
        product.image || "",

      category:
        product.category || "",

      brand:
        product.brand || "",

      stock:
        product.stock ?? "",

      rating:
        product.rating ?? "",

      reviews:
        product.reviews ?? "",

      featured:
        Boolean(
          product.featured
        ),

      isActive:
        product.isActive !==
        false,
    });

    setShowForm(true);
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type ===
        "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // SAVE PRODUCT
  // =========================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const productName =
        formData.name.trim();

      const productCategory =
        formData.category.trim();

      if (
        !productName ||
        !productCategory ||
        formData.price === ""
      ) {
        setError(
          "Product name, category and price are required."
        );

        return;
      }

      const price = Number(
        formData.price
      );

      const originalPrice =
        Number(
          formData.originalPrice ||
            0
        );

      const stock = Number(
        formData.stock || 0
      );

      const rating = Number(
        formData.rating || 0
      );

      const reviews = Number(
        formData.reviews || 0
      );

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        setError(
          "Please enter a valid price."
        );

        return;
      }

      if (
        !Number.isFinite(
          originalPrice
        ) ||
        originalPrice < 0
      ) {
        setError(
          "Please enter a valid original price."
        );

        return;
      }

      if (
        !Number.isFinite(stock) ||
        stock < 0
      ) {
        setError(
          "Please enter a valid stock quantity."
        );

        return;
      }

      if (
        !Number.isFinite(rating) ||
        rating < 0 ||
        rating > 5
      ) {
        setError(
          "Rating must be between 0 and 5."
        );

        return;
      }

      if (
        !Number.isFinite(reviews) ||
        reviews < 0
      ) {
        setError(
          "Reviews must be 0 or more."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload = {
          name:
            productName,

          description:
            formData.description.trim(),

          price,

          originalPrice,

          image:
            formData.image.trim(),

          category:
            productCategory,

          brand:
            formData.brand.trim() ||
            "ShopEase",

          stock,

          rating,

          reviews,

          featured:
            Boolean(
              formData.featured
            ),

          isActive:
            Boolean(
              formData.isActive
            ),
        };

        const isEditing =
          Boolean(
            editingProduct
          );

        const url = isEditing
          ? `https://shopease-vnpn.onrender.com/api/admin/products/${editingProduct._id}`
          : "https://shopease-vnpn.onrender.com/api/admin/products";

        const method = isEditing
          ? "PUT"
          : "POST";

        console.log(
          "ADMIN PRODUCT PAYLOAD:",
          payload
        );

        const response =
          await fetch(url, {
            method,

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                payload
              ),
          });

        const data =
          await response.json();

        // =========================
        // SESSION EXPIRED
        // =========================

        if (
          response.status ===
          401
        ) {
          localStorage.removeItem(
            "shopease_token"
          );

          localStorage.removeItem(
            "shopease_current_user"
          );

          localStorage.removeItem(
            "shopease_remember_me"
          );

          navigate("/login");

          return;
        }

        // =========================
        // NOT ADMIN
        // =========================

        if (
          response.status ===
          403
        ) {
          setError(
            "Admin access required."
          );

          return;
        }

        // =========================
        // API ERROR
        // =========================

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to save product."
          );
        }

        // =========================
        // RELOAD PRODUCTS
        // =========================

        await loadProducts();

        // =========================
        // CLOSE FORM
        // =========================

        resetForm();

        console.log(
          isEditing
            ? "Product updated successfully."
            : "Product created successfully."
        );
      } catch (err) {
        console.error(
          "Product save error:",
          err
        );

        setError(
          err.message ||
            "Unable to save product."
        );
      } finally {
        setSaving(false);
      }
    };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDelete = async (
    productId
  ) => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        productId
      );

      setError("");

      const response =
        await fetch(
          `https://shopease-vnpn.onrender.com/api/admin/products/${productId}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (
        response.status ===
        401
      ) {
        localStorage.removeItem(
          "shopease_token"
        );

        localStorage.removeItem(
          "shopease_current_user"
        );

        navigate("/login");

        return;
      }

      if (
        response.status ===
        403
      ) {
        setError(
          "Admin access required."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete product."
        );
      }

      setProducts(
        (prev) =>
          prev.filter(
            (product) =>
              product._id !==
              productId
          )
      );
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete product."
      );
    } finally {
      setDeletingId("");
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="admin-products-page">

        <section className="admin-products-header">

          <div>
            <p>
              ADMIN PANEL
            </p>

            <h1>
              Products
            </h1>

            <span>
              Loading products...
            </span>
          </div>

        </section>

        <div className="admin-products-loading">

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

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="admin-products-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="admin-products-header">

        <div>

          <p>
            ADMIN PANEL
          </p>

          <h1>
            Products
          </h1>

          <span>
            Manage your ShopEase
            product catalog.
          </span>

        </div>

        <div className="admin-products-header-actions">

          <Link
            to="/admin"
            className="admin-products-dashboard-btn"
          >
            <i className="bi bi-grid"></i>
            Dashboard
          </Link>

          <button
            type="button"
            className="admin-products-add-btn"
            onClick={
              openAddForm
            }
            disabled={saving}
          >
            <i className="bi bi-plus-lg"></i>
            Add Product
          </button>

        </div>

      </section>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="admin-products-error">

          <i className="bi bi-exclamation-circle"></i>

          <span>
            {error}
          </span>

        </div>
      )}

      {/* =========================
          FORM
      ========================= */}

      {showForm && (
        <section
          className="admin-product-form-card"
          style={{
            position: "relative",
            zIndex: 1000,
          }}
        >

          <div className="admin-product-form-header">

            <div>

              <p>
                {editingProduct
                  ? "EDIT PRODUCT"
                  : "NEW PRODUCT"}
              </p>

              <h2>
                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

            </div>

            <button
              type="button"
              onClick={
                resetForm
              }
              className="admin-product-close-btn"
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>

          <form
            className="admin-product-form"
            onSubmit={
              handleSubmit
            }
          >

            <div className="admin-product-form-grid">

              {/* PRODUCT NAME */}

              <div className="admin-product-field full">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter product name"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="admin-product-field full">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter product description"
                  rows="4"
                />

              </div>

              {/* PRICE */}

              <div className="admin-product-field">

                <label>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="49"
                  required
                />

              </div>

              {/* ORIGINAL PRICE */}

              <div className="admin-product-field">

                <label>
                  Original Price
                </label>

                <input
                  type="number"
                  name="originalPrice"
                  value={
                    formData.originalPrice
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="69"
                />

              </div>

              {/* CATEGORY */}

              <div className="admin-product-field">

                <label>
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Fashion"
                  required
                />

              </div>

              {/* BRAND */}

              <div className="admin-product-field">

                <label>
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="ShopEase"
                />

              </div>

              {/* STOCK */}

              <div className="admin-product-field">

                <label>
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={
                    formData.stock
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  placeholder="25"
                />

              </div>

              {/* RATING */}

              <div className="admin-product-field">

                <label>
                  Rating
                </label>

                <input
                  type="number"
                  name="rating"
                  value={
                    formData.rating
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="4.5"
                />

              </div>

              {/* REVIEWS */}

              <div className="admin-product-field">

                <label>
                  Reviews
                </label>

                <input
                  type="number"
                  name="reviews"
                  value={
                    formData.reviews
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  placeholder="18"
                />

              </div>

              {/* IMAGE */}

              <div className="admin-product-field full">

                <label>
                  Product Image
                </label>

                <input
                  type="url"
                  name="image"
                  value={
                    formData.image
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://example.com/product-image.jpg"
                />

                {formData.image.trim() && (
                  <div className="admin-product-image-preview">

                    <img
                      src={
                        formData.image
                      }
                      alt="Product preview"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";

                        e.currentTarget.parentElement.classList.add(
                          "image-error"
                        );
                      }}
                    />

                    <span>
                      Image Preview
                    </span>

                  </div>
                )}

              </div>

              {/* FEATURED */}

              <label className="admin-product-checkbox">

                <input
                  type="checkbox"
                  name="featured"
                  checked={
                    formData.featured
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  Featured Product
                </span>

              </label>

              {/* ACTIVE */}

              <label className="admin-product-checkbox">

                <input
                  type="checkbox"
                  name="isActive"
                  checked={
                    formData.isActive
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  Active Product
                </span>

              </label>

            </div>

            {/* FORM ACTIONS */}

            <div className="admin-product-form-actions">

              <button
                type="button"
                className="admin-product-cancel-btn"
                onClick={
                  resetForm
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-product-save-btn"
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Create Product"}

                <i className="bi bi-check-lg"></i>
              </button>

            </div>

          </form>

        </section>
      )}

      {/* =========================
          PRODUCTS CARD
      ========================= */}

      <section className="admin-products-card">

        <div className="admin-products-card-header">

          <div>

            <p>
              PRODUCT CATALOG
            </p>

            <h2>
              All Products
            </h2>

          </div>

          <span>
            {
              filteredProducts.length
            }{" "}
            Products
          </span>

        </div>

        {/* SEARCH + FILTER */}

        <div className="admin-products-tools">

          <div className="admin-products-search">

            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="admin-products-categories">

            {categories.map(
              (category) => (
                <button
                  key={
                    category
                  }
                  type="button"
                  className={
                    categoryFilter ===
                    category
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setCategoryFilter(
                      category
                    )
                  }
                >
                  {category ===
                  "all"
                    ? "All"
                    : category}
                </button>
              )
            )}

          </div>

        </div>

        {/* PRODUCTS */}

        {filteredProducts.length ===
        0 ? (

          <div className="admin-products-empty">

            <i className="bi bi-box-seam"></i>

            <h2>
              No Products Found
            </h2>

            <p>
              Add your first product
              to the catalog.
            </p>

            <button
              type="button"
              className="admin-products-empty-btn"
              onClick={
                openAddForm
              }
            >
              ADD PRODUCT
            </button>

          </div>

        ) : (

          <div className="admin-products-list">

            {filteredProducts.map(
              (product) => (

                <article
                  className="admin-product-row"
                  key={
                    product._id
                  }
                >

                  {/* IMAGE */}

                  <div className="admin-product-image">

                    <img
                      src={
                        product.image ||
                        "https://via.placeholder.com/80?text=Product"
                      }
                      alt={
                        product.name
                      }
                      onError={(
                        e
                      ) => {
                        e.currentTarget.onerror =
                          null;

                        e.currentTarget.src =
                          "https://via.placeholder.com/80?text=Product";
                      }}
                    />

                  </div>

                  {/* MAIN INFO */}

                  <div className="admin-product-main">

                    <strong>
                      {
                        product.name
                      }
                    </strong>

                    <span>
                      {
                        product.brand ||
                        "ShopEase"
                      }
                    </span>

                    <small>
                      {
                        product.category
                      }
                    </small>

                  </div>

                  {/* PRICE */}

                  <div className="admin-product-price">

                    <span>
                      PRICE
                    </span>

                    <strong>
                      $
                      {Number(
                        product.price
                      ).toFixed(
                        2
                      )}
                    </strong>

                  </div>

                  {/* STOCK */}

                  <div className="admin-product-stock">

                    <span>
                      STOCK
                    </span>

                    <strong
                      className={
                        Number(
                          product.stock
                        ) <= 5
                          ? "low"
                          : ""
                      }
                    >
                      {
                        product.stock
                      }
                    </strong>

                  </div>

                  {/* STATUS */}

                  <div className="admin-product-status">

                    <span
                      className={
                        product.isActive
                          ? "active"
                          : "inactive"
                      }
                    >
                      {product.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    {product.featured && (
                      <small>
                        Featured
                      </small>
                    )}

                  </div>

                  {/* ACTIONS */}

                  <div className="admin-product-actions">

                    <button
                      type="button"
                      className="admin-product-edit-btn"
                      onClick={() =>
                        startEdit(
                          product
                        )
                      }
                    >
                      <i className="bi bi-pencil"></i>
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-product-delete-btn"
                      disabled={
                        deletingId ===
                        product._id
                      }
                      onClick={() =>
                        handleDelete(
                          product._id
                        )
                      }
                    >
                      <i className="bi bi-trash"></i>

                      {deletingId ===
                      product._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default AdminProducts;