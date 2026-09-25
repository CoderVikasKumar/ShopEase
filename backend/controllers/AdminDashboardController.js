const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// =========================================================
// ADMIN DASHBOARD
// =========================================================

const getAdminDashboard = async (
  req,
  res
) => {
  try {
    // =======================================================
    // BASIC COUNTS
    // =======================================================

    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingPayments,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
    ] = await Promise.all([
      Order.countDocuments(),

      Product.countDocuments({
        isActive: true,
      }),

      User.countDocuments(),

      Order.countDocuments({
        paymentStatus: "pending",
      }),

      Order.countDocuments({
        orderStatus: "Processing",
      }),

      Order.countDocuments({
        orderStatus: "Delivered",
      }),

      Order.countDocuments({
        orderStatus: "Cancelled",
      }),

      Product.find({
        isActive: true,
        stock: {
          $lte: 5,
        },
      })
        .sort({
          stock: 1,
        })
        .limit(10)
        .select(
          "_id name price stock category image"
        )
        .lean(),
    ]);

    // =======================================================
    // TOTAL SALES
    // Paid orders only
    // =======================================================

    const salesResult =
      await Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },

        {
          $group: {
            _id: null,

            totalSales: {
              $sum: "$total",
            },
          },
        },
      ]);

    const totalSales =
      Number(
        salesResult?.[0]?.totalSales ||
          0
      ).toFixed(2);

    // =======================================================
    // ORDER STATUS SUMMARY
    // =======================================================

    const statusSummary =
      await Order.aggregate([
        {
          $group: {
            _id: "$orderStatus",

            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const orderStatusSummary = {
      Processing: 0,
      Packed: 0,
      Shipped: 0,
      "In Transit": 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
    };

    statusSummary.forEach(
      (item) => {
        if (
          Object.prototype.hasOwnProperty.call(
            orderStatusSummary,
            item._id
          )
        ) {
          orderStatusSummary[
            item._id
          ] = item.count;
        }
      }
    );

    // =======================================================
    // RECENT ORDERS
    // =======================================================

    const recentOrders =
      await Order.find()
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .select(
          [
            "orderId",
            "user",
            "items",
            "total",
            "paymentMethod",
            "paymentStatus",
            "orderStatus",
            "courier",
            "trackingNumber",
            "currentLocation",
            "expectedDelivery",
            "customer",
            "createdAt",
          ].join(" ")
        )
        .populate(
          "user",
          "name email phone"
        )
        .lean();

    // =======================================================
    // FORMAT RECENT ORDERS
    // =======================================================

    const formattedOrders =
      recentOrders.map(
        (order) => {
          const firstItem =
            order.items?.[0];

          const customerName =
            order.user?.name ||
            `${order.customer?.firstName || ""} ${
              order.customer?.lastName || ""
            }`.trim() ||
            "Customer";

          return {
            id:
              order._id,

            orderId:
              order.orderId,

            customerName,

            customerEmail:
              order.user?.email ||
              order.customer?.email ||
              "",

            customerPhone:
              order.user?.phone ||
              order.customer?.phone ||
              "",

            productName:
              firstItem?.name ||
              "Multiple Products",

            productImage:
              firstItem?.image ||
              "",

            itemCount:
              Array.isArray(
                order.items
              )
                ? order.items.reduce(
                    (
                      total,
                      item
                    ) =>
                      total +
                      Number(
                        item.quantity ||
                          0
                      ),
                    0
                  )
                : 0,

            total:
              Number(
                order.total || 0
              ),

            paymentMethod:
              order.paymentMethod ||
              "",

            paymentStatus:
              order.paymentStatus ||
              "pending",

            orderStatus:
              order.orderStatus ||
              "Processing",

            courier:
              order.courier ||
              "",

            trackingNumber:
              order.trackingNumber ||
              "",

            currentLocation:
              order.currentLocation ||
              "",

            expectedDelivery:
              order.expectedDelivery ||
              "",

            customer:
              order.customer ||
              null,

            createdAt:
              order.createdAt,
          };
        }
      );

    // =======================================================
    // NEW ORDERS
    // Processing + newest
    // =======================================================

    const newOrders =
      await Order.find({
        orderStatus: "Processing",
      })
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .select(
          [
            "orderId",
            "total",
            "paymentMethod",
            "paymentStatus",
            "orderStatus",
            "customer",
            "items",
            "createdAt",
          ].join(" ")
        )
        .populate(
          "user",
          "name email"
        )
        .lean();

    // =======================================================
    // RECENT CUSTOMERS
    // =======================================================

    const recentCustomers =
      await User.find()
        .sort({
          createdAt: -1,
        })
        .limit(8)
        .select(
          "name email phone createdAt"
        )
        .lean();

    // =======================================================
    // MONTHLY SALES
    // =======================================================

    const monthlySales =
      await Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },

        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },

              month: {
                $month: "$createdAt",
              },
            },

            sales: {
              $sum: "$total",
            },

            orders: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

    // =======================================================
    // TOP PRODUCTS FROM ORDERS
    // =======================================================

    const topProducts =
      await Order.aggregate([
        {
          $unwind: "$items",
        },

        {
          $group: {
            _id: "$items.productId",

            name: {
              $first:
                "$items.name",
            },

            image: {
              $first:
                "$items.image",
            },

            quantity: {
              $sum:
                "$items.quantity",
            },

            revenue: {
              $sum: {
                $multiply: [
                  "$items.price",
                  "$items.quantity",
                ],
              },
            },
          },
        },

        {
          $sort: {
            quantity: -1,
          },
        },

        {
          $limit: 5,
        },
      ]);

    // =======================================================
    // LOW STOCK COUNT
    // =======================================================

    const lowStockCount =
      lowStockProducts.length;

    // =======================================================
    // OUT OF STOCK COUNT
    // =======================================================

    const outOfStock =
      await Product.countDocuments({
        isActive: true,

        stock: {
          $lte: 0,
        },
      });

    // =======================================================
    // RESPONSE
    // =======================================================

    return res.status(200).json({
      success: true,

      dashboard: {
        stats: {
          totalSales:
            Number(
              totalSales
            ),

          totalOrders,

          totalProducts,

          totalCustomers,

          processingOrders,

          deliveredOrders,

          cancelledOrders,

          pendingPayments,

          lowStockCount,

          outOfStock,
        },

        orderStatusSummary,

        recentOrders:
          formattedOrders,

        newOrders,

        recentCustomers,

        lowStockProducts,

        monthlySales,

        topProducts,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Unable to load admin dashboard.",
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getAdminDashboard,
};