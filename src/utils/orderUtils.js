const ORDERS_KEY = "shopease_orders";

// =========================
// GET ORDERS
// =========================

export function getOrders() {
  const savedOrders =
    localStorage.getItem(ORDERS_KEY);

  if (!savedOrders) {
    return [];
  }

  try {
    return JSON.parse(savedOrders);
  } catch (error) {
    console.error(
      "Orders load error:",
      error
    );

    return [];
  }
}

// =========================
// SAVE ORDER
// =========================

export function saveOrder(order) {
  const orders = getOrders();

  const newOrder = {
    ...order,

    id:
      order.id ||
      `SE-${Date.now()}`,

    createdAt:
      order.createdAt ||
      new Date().toISOString(),
  };

  const updatedOrders = [
    newOrder,
    ...orders,
  ];

  localStorage.setItem(
    ORDERS_KEY,
    JSON.stringify(updatedOrders)
  );

  return newOrder;
}

// =========================
// GET SINGLE ORDER
// =========================

export function getOrderById(orderId) {
  const orders = getOrders();

  return (
    orders.find(
      (order) =>
        String(order.id) ===
        String(orderId)
    ) || null
  );
}

// =========================
// CLEAR ORDERS
// =========================

export function clearOrders() {
  localStorage.removeItem(ORDERS_KEY);
}