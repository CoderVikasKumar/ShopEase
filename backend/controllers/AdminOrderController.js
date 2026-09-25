const Order = require("../models/Order");

// =========================================================
// TRACKING STEPS
// =========================================================

const trackingSteps = [
  "Order Placed",
  "Order Confirmed",
  "Order Packed",
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

// =========================================================
// STATUS → TRACKING TITLE
// =========================================================

const statusToTrackingTitle = {
  Processing: "Order Placed",
  Packed: "Order Packed",
  Shipped: "Shipped",
  "In Transit": "In Transit",
  "Out for Delivery":
    "Out for Delivery",
  Delivered: "Delivered",
  Cancelled:
    "Order Cancelled",
};

// =========================================================
// UPDATE TRACKING HISTORY
// =========================================================

const updateTrackingHistory = (
  order,
  status
) => {
  if (
    !Array.isArray(
      order.trackingHistory
    )
  ) {
    order.trackingHistory = [];
  }

  const currentTitle =
    statusToTrackingTitle[status];

  // -------------------------------------------------------
  // CANCELLED
  // -------------------------------------------------------

  if (
    status === "Cancelled"
  ) {
    const alreadyCancelled =
      order.trackingHistory.some(
        (item) =>
          item.title ===
          "Order Cancelled"
      );

    if (!alreadyCancelled) {
      const now = new Date();

      order.trackingHistory.push({
        title:
          "Order Cancelled",

        location:
          "ShopEase",

        date:
          now.toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          ),

        time:
          now.toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),

        completed: true,
      });
    }

    return;
  }

  // -------------------------------------------------------
  // NORMAL TRACKING
  // -------------------------------------------------------

  const currentIndex =
    trackingSteps.indexOf(
      currentTitle
    );

  order.trackingHistory =
    order.trackingHistory.map(
      (item) => {
        const stepIndex =
          trackingSteps.indexOf(
            item.title
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

  // -------------------------------------------------------
  // ADD DATE/TIME TO CURRENT STEP
  // -------------------------------------------------------

  const now = new Date();

  const date =
    now.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  const time =
    now.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  const currentItem =
    order.trackingHistory.find(
      (item) =>
        item.title ===
        currentTitle
    );

  if (currentItem) {
    currentItem.date = date;
    currentItem.time = time;
    currentItem.completed = true;

    // -----------------------------------------------------
    // CURRENT LOCATION
    // -----------------------------------------------------

    if (
      status === "Processing"
    ) {
      currentItem.location =
        "ShopEase Warehouse";
    }

    if (
      status === "Packed"
    ) {
      currentItem.location =
        "Delhi Warehouse";
    }

    if (
      status === "Shipped"
    ) {
      currentItem.location =
        "Delhi";
    }

    if (
      status === "In Transit"
    ) {
      currentItem.location =
        "Lucknow Hub";
    }

    if (
      status ===
      "Out for Delivery"
    ) {
      currentItem.location =
        order.customer?.city ||
        "Customer Location";
    }

    if (
      status === "Delivered"
    ) {
      currentItem.location =
        order.customer?.address ||
        "Customer Address";
    }
  }
};

// =========================================================
// UPDATE LOCATION
// =========================================================

const updateOrderLocation = (
  order,
  status
) => {
  if (
    status === "Processing"
  ) {
    order.currentLocation =
      "ShopEase Warehouse";
  }

  if (
    status === "Packed"
  ) {
    order.currentLocation =
      "Delhi Warehouse";
  }

  if (
    status === "Shipped"
  ) {
    order.currentLocation =
      "Delhi";
  }

  if (
    status === "In Transit"
  ) {
    order.currentLocation =
      "Lucknow Hub";
  }

  if (
    status ===
    "Out for Delivery"
  ) {
    order.currentLocation =
      order.customer?.city ||
      "Customer Location";
  }

  if (
    status === "Delivered"
  ) {
    order.currentLocation =
      order.customer?.address ||
      "Customer Address";
  }

  if (
    status === "Cancelled"
  ) {
    order.currentLocation =
      "Order Cancelled";
  }
};

// =========================================================
// GET ALL ORDERS
// =========================================================

const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find()
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

      count:
        orders.length,

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

// =========================================================
// UPDATE ORDER STATUS
// =========================================================

const updateOrderStatus =
  async (
    req,
    res
  ) => {
    try {
      const orderId =
        String(
          req.params.orderId ||
            ""
        ).trim();

      const {
        status,
      } = req.body;

      // =====================================================
      // VALIDATION
      // =====================================================

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
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order status.",
        });
      }

      if (!orderId) {
        return res.status(400).json({
          success: false,

          message:
            "Order ID is required.",
        });
      }

      // =====================================================
      // FIND ORDER
      // =====================================================

      const order =
        await Order.findOne({
          orderId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      // =====================================================
      // ALREADY SAME STATUS
      // =====================================================

      if (
        order.orderStatus ===
        status
      ) {
        return res.status(200).json({
          success: true,

          message:
            "Order is already in this status.",

          order,
        });
      }

      // =====================================================
      // UPDATE STATUS
      // =====================================================

      order.orderStatus =
        status;

      // =====================================================
      // UPDATE TRACKING
      // =====================================================

      updateTrackingHistory(
        order,
        status
      );

      // =====================================================
      // UPDATE LOCATION
      // =====================================================

      updateOrderLocation(
        order,
        status
      );

      // =====================================================
      // SAVE
      // =====================================================

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
          error?.message ||
          "Unable to update order status.",
      });
    }
  };

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getAllOrders,
  updateOrderStatus,
};