import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext =
  createContext(null);

// =========================================================
// HELPER: VALID MONGODB OBJECT ID
// =========================================================

const isValidMongoId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(
    String(id || "")
  );
};

// =========================================================
// NORMALIZE CART ITEM
// =========================================================

const normalizeCartItem = (item) => {
  if (!item) {
    return null;
  }

  const productId =
    String(item.id || "").trim();

  // IMPORTANT:
  // Reject old IDs like 1, 6, 7
  if (!isValidMongoId(productId)) {
    console.warn(
      "Removing invalid cart item:",
      item
    );

    return null;
  }

  return {
    ...item,

    id: productId,

    name:
      item.name || "Product",

    price:
      Number(item.price || 0),

    quantity: Math.max(
      1,
      Number(item.quantity || 1)
    ),

    size:
      item.size ||
      "Default",

    color:
      item.color ||
      "Default",

    image:
      item.image || "",

    stock:
      Number(item.stock || 0),

    category:
      item.category || "",

    brand:
      item.brand || "",
  };
};

// =========================================================
// CART PROVIDER
// =========================================================

export function CartProvider({
  children,
}) {
  // =======================================================
  // LOAD CART
  // =======================================================

  const [cartItems, setCartItems] =
    useState(() => {
      try {
        const savedCart =
          localStorage.getItem(
            "shopease_cart"
          );

        if (!savedCart) {
          return [];
        }

        const parsedCart =
          JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) {
          return [];
        }

        // Remove invalid old IDs
        const normalizedCart =
          parsedCart
            .map(
              normalizeCartItem
            )
            .filter(Boolean);

        // Save cleaned cart immediately
        if (
          normalizedCart.length !==
          parsedCart.length
        ) {
          localStorage.setItem(
            "shopease_cart",
            JSON.stringify(
              normalizedCart
            )
          );
        }

        return normalizedCart;
      } catch (error) {
        console.error(
          "Cart load error:",
          error
        );

        localStorage.removeItem(
          "shopease_cart"
        );

        return [];
      }
    });

  // =======================================================
  // SAVE CART
  // =======================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "shopease_cart",
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Cart save error:",
        error
      );
    }
  }, [cartItems]);

  // =======================================================
  // ADD TO CART
  // =======================================================

  const addToCart = (
    product,
    quantity = 1
  ) => {
    if (!product?.id) {
      console.error(
        "Cannot add product without id."
      );

      return false;
    }

    const productId =
      String(
        product.id
      ).trim();

    // IMPORTANT:
    // Product must have MongoDB ObjectId
    if (
      !isValidMongoId(
        productId
      )
    ) {
      console.error(
        "Invalid MongoDB product ID:",
        productId
      );

      alert(
        "This product has an invalid ID. Please refresh the products page and try again."
      );

      return false;
    }

    const productSize =
      product.size ||
      "Default";

    const productColor =
      product.color ||
      "Default";

    const safeQuantity =
      Math.max(
        1,
        Number(quantity) || 1
      );

    const productPrice =
      Number(
        product.price || 0
      );

    const productStock =
      Number(
        product.stock || 0
      );

    // =====================================================
    // STOCK VALIDATION
    // =====================================================

    if (
      productStock > 0 &&
      safeQuantity > productStock
    ) {
      alert(
        `Only ${productStock} item(s) available.`
      );

      return false;
    }

    setCartItems((prevItems) => {
      const existingItem =
        prevItems.find(
          (item) =>
            String(item.id) ===
              productId &&
            (item.size ||
              "Default") ===
              productSize &&
            (item.color ||
              "Default") ===
              productColor
        );

      // ===================================================
      // EXISTING ITEM
      // ===================================================

      if (existingItem) {
        const newQuantity =
          Number(
            existingItem.quantity || 0
          ) +
          safeQuantity;

        if (
          productStock > 0 &&
          newQuantity > productStock
        ) {
          alert(
            `Only ${productStock} item(s) available.`
          );

          return prevItems;
        }

        return prevItems.map(
          (item) => {
            const sameItem =
              String(item.id) ===
                productId &&
              (item.size ||
                "Default") ===
                productSize &&
              (item.color ||
                "Default") ===
                productColor;

            if (!sameItem) {
              return item;
            }

            return {
              ...item,

              id: productId,

              quantity:
                newQuantity,

              price:
                productPrice,

              image:
                product.image ||
                item.image ||
                "",

              stock:
                productStock,

              category:
                product.category ||
                item.category ||
                "",

              brand:
                product.brand ||
                item.brand ||
                "",
            };
          }
        );
      }

      // ===================================================
      // NEW ITEM
      // ===================================================

      return [
        ...prevItems,

        {
          ...product,

          id: productId,

          name:
            product.name ||
            "Product",

          price:
            productPrice,

          image:
            product.image || "",

          size:
            productSize,

          color:
            productColor,

          quantity:
            safeQuantity,

          stock:
            productStock,

          category:
            product.category || "",

          brand:
            product.brand || "",
        },
      ];
    });

    console.log(
      "CART ITEM ADDED:",
      {
        id: productId,
        name:
          product.name,
        quantity:
          safeQuantity,
      }
    );

    return true;
  };

  // =======================================================
  // REMOVE FROM CART
  // =======================================================

  const removeFromCart = (
    id,
    size = "Default",
    color = "Default"
  ) => {
    const productId =
      String(id).trim();

    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            String(item.id) ===
              productId &&
            (item.size ||
              "Default") ===
              size &&
            (item.color ||
              "Default") ===
              color
          )
      )
    );
  };

  // =======================================================
  // UPDATE QUANTITY
  // =======================================================

  const updateQuantity = (
    id,
    size = "Default",
    color = "Default",
    newQuantity
  ) => {
    const productId =
      String(id).trim();

    const quantity =
      Math.max(
        1,
        Number(newQuantity) || 1
      );

    setCartItems((prevItems) =>
      prevItems.map(
        (item) => {
          const sameItem =
            String(item.id) ===
              productId &&
            (item.size ||
              "Default") ===
              size &&
            (item.color ||
              "Default") ===
              color;

          if (!sameItem) {
            return item;
          }

          // Respect product stock
          const stock =
            Number(
              item.stock || 0
            );

          const finalQuantity =
            stock > 0
              ? Math.min(
                  quantity,
                  stock
                )
              : quantity;

          return {
            ...item,

            quantity:
              finalQuantity,
          };
        }
      )
    );
  };

  // =======================================================
  // CLEAR CART
  // =======================================================

  const clearCart = () => {
    setCartItems([]);

    localStorage.removeItem(
      "shopease_cart"
    );
  };

  // =======================================================
  // CART COUNT
  // =======================================================

  const cartCount =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );

  // =======================================================
  // CART SUBTOTAL
  // =======================================================

  const cartSubtotal =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(
          item.price || 0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );

  // =======================================================
  // PROVIDER
  // =======================================================

  return (
    <CartContext.Provider
      value={{
        cartItems,

        addToCart,

        removeFromCart,

        updateQuantity,

        clearCart,

        cartCount,

        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// =========================================================
// USE CART
// =========================================================

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}