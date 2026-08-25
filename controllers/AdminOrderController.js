const Order = require("../models/Order");

// =========================
// GET ALL ORDERS
// =========================

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "name email phone city"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get all orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load all orders.",
    });
  }
};

// =========================
// UPDATE ORDER STATUS
// =========================

const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Processing",
      "Packed",
      "Shipped",
      "In Transit",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order status.",
      });
    }

    const order =
      await Order.findOne({
        orderId:
          req.params.orderId,
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found.",
      });
    }

    order.orderStatus = status;

    // =========================
    // TRACKING STEP MAPPING
    // =========================

    const statusToTitle = {
      Processing: "Order Placed",
      Packed: "Order Packed",
      Shipped: "Shipped",
      "In Transit": "In Transit",
      "Out for Delivery":
        "Out for Delivery",
      Delivered: "Delivered",
      Cancelled: "Cancelled",
    };

    const currentTitle =
      statusToTitle[status];

    // Mark matching tracking step
    if (
      Array.isArray(
        order.trackingHistory
      )
    ) {
      order.trackingHistory =
        order.trackingHistory.map(
          (item) => {
            const stepIndex =
              [
                "Order Placed",
                "Order Confirmed",
                "Order Packed",
                "Shipped",
                "In Transit",
                "Out for Delivery",
                "Delivered",
              ].indexOf(
                item.title
              );

            const currentIndex =
              [
                "Order Placed",
                "Order Confirmed",
                "Order Packed",
                "Shipped",
                "In Transit",
                "Out for Delivery",
                "Delivered",
              ].indexOf(
                currentTitle
              );

            if (
              stepIndex !== -1 &&
              currentIndex !== -1
            ) {
              item.completed =
                stepIndex <=
                currentIndex;
            }

            return item;
          }
        );
    }

    // =========================
    // UPDATE LOCATION
    // =========================

    if (status === "Processing") {
      order.currentLocation =
        "ShopEase Warehouse";
    }

    if (status === "Packed") {
      order.currentLocation =
        "Delhi Warehouse";
    }

    if (status === "Shipped") {
      order.currentLocation =
        "Delhi";
    }

    if (status === "In Transit") {
      order.currentLocation =
        "Lucknow Hub";
    }

    if (
      status === "Out for Delivery"
    ) {
      order.currentLocation =
        order.customer.city;
    }

    if (status === "Delivered") {
      order.currentLocation =
        order.customer.address;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message:
        "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update order status.",
    });
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
};