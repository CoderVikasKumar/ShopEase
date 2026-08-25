import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const WishlistContext =
  createContext(null);

export function WishlistProvider({
  children,
}) {
  // =========================
  // LOAD WISHLIST
  // =========================

  const [wishlistItems, setWishlistItems] =
    useState(() => {
      try {
        const savedWishlist =
          localStorage.getItem(
            "shopease_wishlist"
          );

        if (!savedWishlist) {
          return [];
        }

        const parsed =
          JSON.parse(savedWishlist);

        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed
          .filter((item) => item?.id)
          .map((item) => ({
            ...item,

            id: String(item.id),

            name:
              item.name ||
              "Product",

            price: Number(
              item.price || 0
            ),

            image:
              item.image || "",

            category:
              item.category ||
              "Other",

            rating:
              Number(
                item.rating || 0
              ),

            reviews:
              Number(
                item.reviews || 0
              ),
          }));
      } catch (error) {
        console.error(
          "Wishlist load error:",
          error
        );

        return [];
      }
    });

  // =========================
  // SAVE WISHLIST
  // =========================

  useEffect(() => {
    try {
      localStorage.setItem(
        "shopease_wishlist",
        JSON.stringify(
          wishlistItems
        )
      );
    } catch (error) {
      console.error(
        "Wishlist save error:",
        error
      );
    }
  }, [wishlistItems]);

  // =========================
  // TOGGLE WISHLIST
  // =========================

  const toggleWishlist = (
    product
  ) => {
    if (!product?.id) {
      console.error(
        "Cannot add product without id."
      );

      return;
    }

    const productId =
      String(product.id);

    setWishlistItems(
      (prevItems) => {
        const exists =
          prevItems.some(
            (item) =>
              String(item.id) ===
              productId
          );

        // REMOVE
        if (exists) {
          return prevItems.filter(
            (item) =>
              String(item.id) !==
              productId
          );
        }

        // ADD
        return [
          ...prevItems,
          {
            ...product,

            id: productId,

            name:
              product.name ||
              "Product",

            price:
              Number(
                product.price || 0
              ),

            image:
              product.image || "",

            category:
              product.category ||
              "Other",

            rating:
              Number(
                product.rating || 0
              ),

            reviews:
              Number(
                product.reviews || 0
              ),
          },
        ];
      }
    );
  };

  // =========================
  // CHECK
  // =========================

  const isInWishlist = (
    id
  ) => {
    return wishlistItems.some(
      (item) =>
        String(item.id) ===
        String(id)
    );
  };

  // =========================
  // REMOVE
  // =========================

  const removeFromWishlist = (
    id
  ) => {
    setWishlistItems(
      (prevItems) =>
        prevItems.filter(
          (item) =>
            String(item.id) !==
            String(id)
        )
    );
  };

  // =========================
  // CLEAR
  // =========================

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  // =========================
  // COUNT
  // =========================

  const wishlistCount =
    wishlistItems.length;

  // =========================
  // PROVIDER
  // =========================

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,

        toggleWishlist,

        isInWishlist,

        removeFromWishlist,

        clearWishlist,

        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// =========================
// USE WISHLIST
// =========================

export function useWishlist() {
  const context =
    useContext(
      WishlistContext
    );

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}