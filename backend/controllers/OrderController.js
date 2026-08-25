const crypto = require("crypto");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");

// =========================================================
// RAZORPAY HELPER
// =========================================================

const getRazorpay = () => {
  const keyId =
    process.env.RAZORPAY_KEY_ID;

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET;

  if (
    !keyId ||
    !keySecret ||
    keyId === "your_key_id" ||
    keySecret === "your_key_secret"
  ) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// =========================================================
// ROUND MONEY
// =========================================================

const roundMoney = (value) => {
  return (
    Math.round(
      Number(value || 0) * 100
    ) / 100
  );
};

// =========================================================
// CALCULATE SHIPPING
// =========================================================

const calculateShipping = (
  subtotal
) => {
  return subtotal >= 75 ||
    subtotal === 0
    ? 0
    : 8;
};

// =========================================================
// CREATE TRACKING HISTORY
// =========================================================

const createTrackingHistory = (
  customer,
  expectedDelivery
) => {
  const now = new Date();

  const orderDate =
    now.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  const orderTime =
    now.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  return [
    {
      title: "Order Placed",
      location: "ShopEase Online",
      date: orderDate,
      time: orderTime,
      completed: true,
    },

    {
      title: "Order Confirmed",
      location: "ShopEase",
      date: "",
      time: "",
      completed: false,
    },

    {
      title: "Order Packed",
      location: "Delhi Warehouse",
      date: "",
      time: "",
      completed: false,
    },

    {
      title: "Shipped",
      location: "Delhi",
      date: "",
      time: "",
      completed: false,
    },

    {
      title: "In Transit",
      location: "Lucknow Hub",
      date: "",
      time: "",
      completed: false,
    },

    {
      title: "Out for Delivery",
      location:
        customer?.city || "",
      date:
        expectedDelivery || "",
      time: "",
      completed: false,
    },

    {
      title: "Delivered",
      location:
        customer?.address || "",
      date:
        expectedDelivery || "",
      time: "",
      completed: false,
    },
  ];
};

// =========================================================
// VALIDATE + NORMALIZE ORDER ITEMS
// =========================================================

const validateOrderItems =
  async (items) => {
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return {
        success: false,
        message:
          "Order must contain at least one product.",
      };
    }

    const normalizedItems = [];
    const seenIds = new Set();

    for (
      const item of items
    ) {
      const productId =
        String(
          item?.id || ""
        ).trim();

      const quantity =
        Number(
          item?.quantity || 0
        );

      // =========================
      // PRODUCT ID
      // =========================

      if (
        !mongoose.isValidObjectId(
          productId
        )
      ) {
        return {
          success: false,
          message:
            `Invalid product ID: ${productId}`,
        };
      }

      // =========================
      // DUPLICATE ITEM
      // =========================

      if (
        seenIds.has(productId)
      ) {
        return {
          success: false,
          message:
            "Duplicate product found in order.",
        };
      }

      seenIds.add(productId);

      // =========================
      // QUANTITY
      // =========================

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity < 1
      ) {
        return {
          success: false,
          message:
            "Invalid product quantity.",
        };
      }

      // =========================
      // DATABASE PRODUCT
      // =========================

      const product =
        await Product.findOne({
          _id: productId,
          isActive: true,
        }).lean();

      if (!product) {
        return {
          success: false,
          message:
            "Product not found or inactive.",
        };
      }

      // =========================
      // STOCK
      // =========================

      const productStock =
        Number(
          product.stock || 0
        );

      if (
        productStock <
        quantity
      ) {
        return {
          success: false,
          message:
            `${product.name} has only ${productStock} item(s) left in stock.`,
        };
      }

      // =========================
      // SERVER AUTHORITY
      // =========================

      normalizedItems.push({
        product,
        productId,
        quantity,

        size:
          String(
            item?.size || ""
          ).trim(),

        color:
          String(
            item?.color || ""
          ).trim(),
      });
    }

    return {
      success: true,
      items:
        normalizedItems,
    };
  };

// =========================================================
// CALCULATE ORDER TOTALS
// =========================================================

const calculateOrderTotals = (
  validatedItems
) => {
  const subtotal =
    roundMoney(
      validatedItems.reduce(
        (sum, item) => {
          const price =
            Number(
              item.product.price || 0
            );

          return (
            sum +
            price *
              item.quantity
          );
        },
        0
      )
    );

  const shipping =
    calculateShipping(
      subtotal
    );

  const total =
    roundMoney(
      subtotal +
        shipping
    );

  return {
    subtotal,
    shipping,
    total,
  };
};

// =========================================================
// BUILD ORDER ITEMS FROM DATABASE
// =========================================================

const buildOrderItems = (
  validatedItems
) => {
  return validatedItems.map(
    (item) => ({
      productId:
        String(
          item.productId
        ),

      name:
        item.product.name,

      price:
        Number(
          item.product.price || 0
        ),

      quantity:
        Number(
          item.quantity
        ),

      image:
        item.product.image ||
        "",

      size:
        item.size || "",

      color:
        item.color || "",
    })
  );
};

// =========================================================
// DECREASE PRODUCT STOCK
// =========================================================

const decreaseProductStock =
  async (items) => {
    const updatedProducts =
      [];

    try {
      for (
        const item of items
      ) {
        const updatedProduct =
          await Product.findOneAndUpdate(
            {
              _id:
                item.productId,

              isActive: true,

              stock: {
                $gte:
                  item.quantity,
              },
            },
            {
              $inc: {
                stock:
                  -item.quantity,
              },
            },
            {
              returnDocument:
                "after",
            }
          );

        if (!updatedProduct) {
          // Rollback previous stock changes
          for (
            const updated of
              updatedProducts
          ) {
            await Product.findByIdAndUpdate(
              updated.productId,
              {
                $inc: {
                  stock:
                    updated.quantity,
                },
              }
            );
          }

          return {
            success: false,
            message:
              `Insufficient stock for ${item.product.name}.`,
          };
        }

        updatedProducts.push({
          productId:
            item.productId,

          quantity:
            item.quantity,
        });
      }

      return {
        success: true,
        updatedProducts,
      };
    } catch (error) {
      // Rollback if something unexpected happens
      for (
        const updated of
          updatedProducts
      ) {
        try {
          await Product.findByIdAndUpdate(
            updated.productId,
            {
              $inc: {
                stock:
                  updated.quantity,
              },
            }
          );
        } catch (
          rollbackError
        ) {
          console.error(
            "Stock rollback error:",
            rollbackError
          );
        }
      }

      throw error;
    }
  };

// =========================================================
// RESTORE PRODUCT STOCK
// =========================================================

const restoreProductStock =
  async (items) => {
    const restoredProducts =
      [];

    try {
      for (
        const item of items
      ) {
        const productId =
          String(
            item?.productId || ""
          ).trim();

        const quantity =
          Number(
            item?.quantity || 0
          );

        if (
          !mongoose.isValidObjectId(
            productId
          )
        ) {
          continue;
        }

        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity < 1
        ) {
          continue;
        }

        const updatedProduct =
          await Product.findByIdAndUpdate(
            productId,
            {
              $inc: {
                stock:
                  quantity,
              },
            },
            {
              returnDocument:
                "after",
            }
          );

        if (updatedProduct) {
          restoredProducts.push({
            productId,
            quantity,
          });
        }
      }

      return {
        success: true,
        restoredProducts,
      };
    } catch (error) {
      console.error(
        "Restore stock error:",
        error
      );

      throw error;
    }
  };

// =========================================================
// SAVE ORDER
// =========================================================

const saveShopEaseOrder =
  async ({
    userId,
    items,
    subtotal,
    shipping,
    total,
    paymentMethod,
    paymentStatus,
    customer,
    expectedDelivery,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) => {
    const now =
      Date.now();

    const orderId =
      `SE-${now}`;

    const trackingNumber =
      `DLV-${now}`;

    const trackingHistory =
      createTrackingHistory(
        customer,
        expectedDelivery
      );

    const orderData = {
      user: userId,

      orderId,

      items,

      subtotal:
        Number(subtotal),

      shipping:
        Number(shipping),

      total:
        Number(total),

      paymentMethod,

      paymentStatus,

      orderStatus:
        "Processing",

      customer: {
        firstName:
          customer.firstName,

        lastName:
          customer.lastName || "",

        email:
          customer.email,

        phone:
          customer.phone,

        address:
          customer.address,

        city:
          customer.city,

        state:
          customer.state,

        pincode:
          customer.pincode,
      },

      courier:
        "Delhivery",

      trackingNumber,

      currentLocation:
        "ShopEase Warehouse",

      expectedDelivery:
        expectedDelivery || "",

      trackingHistory,
    };

    // Only save Razorpay data when present
    if (razorpayOrderId) {
      orderData.razorpayOrderId =
        razorpayOrderId;
    }

    if (razorpayPaymentId) {
      orderData.razorpayPaymentId =
        razorpayPaymentId;
    }

    if (razorpaySignature) {
      orderData.razorpaySignature =
        razorpaySignature;
    }

    const order =
      await Order.create(
        orderData
      );

    return order;
  };

// =========================================================
// CREATE COD ORDER
// =========================================================

const createOrder =
  async (
    req,
    res
  ) => {
    try {
      const {
        items,
        paymentMethod,
        customer,
        expectedDelivery,
      } = req.body;

      if (
        paymentMethod !==
        "cod"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This endpoint is only for COD orders.",
        });
      }

      if (!customer) {
        return res.status(400).json({
          success: false,
          message:
            "Delivery details are required.",
        });
      }

      const itemValidation =
        await validateOrderItems(
          items
        );

      if (
        !itemValidation.success
      ) {
        return res.status(400).json({
          success: false,
          message:
            itemValidation.message,
        });
      }

      const totals =
        calculateOrderTotals(
          itemValidation.items
        );

      const orderItems =
        buildOrderItems(
          itemValidation.items
        );

      const stockResult =
        await decreaseProductStock(
          itemValidation.items
        );

      if (
        !stockResult.success
      ) {
        return res.status(409).json({
          success: false,
          message:
            stockResult.message,
        });
      }

      try {
        const order =
          await saveShopEaseOrder({
            userId:
              req.user._id,

            items:
              orderItems,

            subtotal:
              totals.subtotal,

            shipping:
              totals.shipping,

            total:
              totals.total,

            paymentMethod:
              "cod",

            paymentStatus:
              "pending",

            customer,

            expectedDelivery,
          });

        return res.status(201).json({
          success: true,

          message:
            "Order created successfully.",

          order: {
            id:
              order._id,

            orderId:
              order.orderId,

            status:
              order.orderStatus,

            total:
              order.total,

            paymentMethod:
              order.paymentMethod,

            paymentStatus:
              order.paymentStatus,

            trackingNumber:
              order.trackingNumber,

            expectedDelivery:
              order.expectedDelivery,
          },
        });
      } catch (orderError) {
        for (
          const updated of
            stockResult.updatedProducts
        ) {
          await Product.findByIdAndUpdate(
            updated.productId,
            {
              $inc: {
                stock:
                  updated.quantity,
              },
            }
          );
        }

        throw orderError;
      }
    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Server error while creating order.",
      });
    }
  };

// =========================================================
// CREATE RAZORPAY ORDER
// =========================================================

const createRazorpayOrder =
  async (
    req,
    res
  ) => {
    try {
      const razorpay =
        getRazorpay();

      if (!razorpay) {
        return res.status(503).json({
          success: false,

          message:
            "Razorpay is not configured. Check backend/.env.",
        });
      }

      const {
        items,
      } = req.body;

      const itemValidation =
        await validateOrderItems(
          items
        );

      if (
        !itemValidation.success
      ) {
        return res.status(400).json({
          success: false,

          message:
            itemValidation.message,
        });
      }

      const totals =
        calculateOrderTotals(
          itemValidation.items
        );

      const amountInSmallestUnit =
        Math.round(
          totals.total * 100
        );

      const razorpayOrder =
        await razorpay.orders.create({
          amount:
            amountInSmallestUnit,

          currency:
            process.env
              .RAZORPAY_CURRENCY ||
            "INR",

          receipt:
            `SEPAY-${Date.now()}`,

          notes: {
            userId:
              String(
                req.user._id
              ),
          },
        });

      return res.status(201).json({
        success: true,

        message:
          "Razorpay order created successfully.",

        serverTotals: {
          subtotal:
            totals.subtotal,

          shipping:
            totals.shipping,

          total:
            totals.total,
        },

        key:
          process.env
            .RAZORPAY_KEY_ID,

        razorpayOrder: {
          id:
            razorpayOrder.id,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency,

          status:
            razorpayOrder.status,

          receipt:
            razorpayOrder.receipt,
        },
      });
    } catch (error) {
      console.error(
        "Razorpay create order error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.error
            ?.description ||
          error?.message ||
          "Unable to create Razorpay order.",
      });
    }
  };

// =========================================================
// VERIFY RAZORPAY PAYMENT
// =========================================================

const verifyRazorpayPayment =
  async (
    req,
    res
  ) => {
    try {
      const razorpay =
        getRazorpay();

      if (!razorpay) {
        return res.status(503).json({
          success: false,

          message:
            "Razorpay is not configured. Check backend/.env.",
        });
      }

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentMethod,
        items,
        customer,
        expectedDelivery,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Razorpay payment details are required.",
        });
      }

      if (
        ![
          "upi",
          "card",
        ].includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid Razorpay payment method.",
        });
      }

      if (!customer) {
        return res.status(400).json({
          success: false,

          message:
            "Customer details are required.",
        });
      }

      // =====================================================
      // DUPLICATE PAYMENT CHECK
      // =====================================================

      const existingOrder =
        await Order.findOne({
          razorpayPaymentId:
            razorpay_payment_id,
        }).lean();

      if (existingOrder) {
        return res.status(200).json({
          success: true,

          message:
            "Payment already verified.",

          order: {
            id:
              existingOrder._id,

            orderId:
              existingOrder.orderId,

            status:
              existingOrder.orderStatus,

            total:
              existingOrder.total,

            paymentMethod:
              existingOrder.paymentMethod,

            paymentStatus:
              existingOrder.paymentStatus,

            trackingNumber:
              existingOrder.trackingNumber,

            expectedDelivery:
              existingOrder.expectedDelivery,
          },
        });
      }

      // =====================================================
      // VALIDATE PRODUCTS
      // =====================================================

      const itemValidation =
        await validateOrderItems(
          items
        );

      if (
        !itemValidation.success
      ) {
        return res.status(409).json({
          success: false,

          message:
            itemValidation.message,
        });
      }

      const totals =
        calculateOrderTotals(
          itemValidation.items
        );

      // =====================================================
      // RAZORPAY ORDER CHECK
      // =====================================================

      const razorpayOrder =
        await razorpay.orders.fetch(
          razorpay_order_id
        );

      const razorpayAmount =
        Number(
          razorpayOrder?.amount || 0
        );

      const expectedAmount =
        Math.round(
          totals.total * 100
        );

      if (
        razorpayAmount !==
        expectedAmount
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Payment amount does not match the current order total.",
        });
      }

      // =====================================================
      // SIGNATURE
      // =====================================================

      const signatureBody =
        `${razorpay_order_id}|${razorpay_payment_id}`;

      const expectedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env
              .RAZORPAY_KEY_SECRET
          )
          .update(
            signatureBody
          )
          .digest("hex");

      const receivedBuffer =
        Buffer.from(
          razorpay_signature,
          "utf8"
        );

      const expectedBuffer =
        Buffer.from(
          expectedSignature,
          "utf8"
        );

      if (
        receivedBuffer.length !==
        expectedBuffer.length
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid Razorpay payment signature.",
        });
      }

      if (
        !crypto.timingSafeEqual(
          receivedBuffer,
          expectedBuffer
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid Razorpay payment signature.",
        });
      }

      // =====================================================
      // PAYMENT CAPTURE CHECK
      // =====================================================

      const razorpayPayment =
        await razorpay.payments.fetch(
          razorpay_payment_id
        );

      if (!razorpayPayment) {
        return res.status(400).json({
          success: false,

          message:
            "Razorpay payment could not be found.",
        });
      }

      if (
        razorpayPayment.order_id !==
        razorpay_order_id
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Payment does not belong to this Razorpay order.",
        });
      }

      if (
        razorpayPayment.status !==
        "captured"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Payment has not been captured yet.",
        });
      }

      // =====================================================
      // DECREASE STOCK
      // =====================================================

      const stockResult =
        await decreaseProductStock(
          itemValidation.items
        );

      if (
        !stockResult.success
      ) {
        return res.status(409).json({
          success: false,

          message:
            stockResult.message,
        });
      }

      try {
        const orderItems =
          buildOrderItems(
            itemValidation.items
          );

        const order =
          await saveShopEaseOrder({
            userId:
              req.user._id,

            items:
              orderItems,

            subtotal:
              totals.subtotal,

            shipping:
              totals.shipping,

            total:
              totals.total,

            paymentMethod,

            paymentStatus:
              "paid",

            customer,

            expectedDelivery,

            razorpayOrderId:
              razorpay_order_id,

            razorpayPaymentId:
              razorpay_payment_id,

            razorpaySignature:
              razorpay_signature,
          });

        return res.status(201).json({
          success: true,

          message:
            "Payment verified and order created successfully.",

          order: {
            id:
              order._id,

            orderId:
              order.orderId,

            status:
              order.orderStatus,

            total:
              order.total,

            paymentMethod:
              order.paymentMethod,

            paymentStatus:
              order.paymentStatus,

            trackingNumber:
              order.trackingNumber,

            expectedDelivery:
              order.expectedDelivery,
          },

          razorpay: {
            orderId:
              razorpay_order_id,

            paymentId:
              razorpay_payment_id,
          },
        });
      } catch (orderError) {
        for (
          const updated of
            stockResult.updatedProducts
        ) {
          try {
            await Product.findByIdAndUpdate(
              updated.productId,
              {
                $inc: {
                  stock:
                    updated.quantity,
                },
              }
            );
          } catch (
            rollbackError
          ) {
            console.error(
              "Razorpay stock rollback error:",
              rollbackError
            );
          }
        }

        // Duplicate payment race
        if (
          orderError?.code ===
          11000
        ) {
          const duplicateOrder =
            await Order.findOne({
              razorpayPaymentId:
                razorpay_payment_id,
            }).lean();

          if (
            duplicateOrder
          ) {
            return res.status(200).json({
              success: true,

              message:
                "Payment already verified.",

              order: {
                id:
                  duplicateOrder._id,

                orderId:
                  duplicateOrder.orderId,

                status:
                  duplicateOrder.orderStatus,

                total:
                  duplicateOrder.total,

                paymentMethod:
                  duplicateOrder.paymentMethod,

                paymentStatus:
                  duplicateOrder.paymentStatus,

                trackingNumber:
                  duplicateOrder.trackingNumber,

                expectedDelivery:
                  duplicateOrder.expectedDelivery,
              },
            });
          }
        }

        throw orderError;
      }
    } catch (error) {
      console.error(
        "Razorpay verification error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Unable to verify Razorpay payment.",
      });
    }
  };

// =========================================================
// CANCEL MY ORDER
// =========================================================

const cancelMyOrder =
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

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message:
            "Order ID is required.",
        });
      }

      // =====================================================
      // FIND USER'S ORDER
      // =====================================================

      const order =
        await Order.findOne({
          orderId,
          user:
            req.user._id,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      // =====================================================
      // ALREADY CANCELLED
      // =====================================================

      if (
        order.orderStatus ===
        "Cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order is already cancelled.",
        });
      }

      // =====================================================
      // CANCELLABLE STATUSES
      // =====================================================

      const cancellableStatuses = [
        "Processing",
        "Packed",
      ];

      if (
        !cancellableStatuses.includes(
          order.orderStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order can no longer be cancelled.",
        });
      }

      // =====================================================
      // PAID RAZORPAY ORDER
      // =====================================================

      if (
        order.paymentStatus ===
          "paid" ||
        [
          "upi",
          "card",
        ].includes(
          order.paymentMethod
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Paid Razorpay orders cannot be cancelled from here. Refund processing is required.",
        });
      }

      // =====================================================
      // RESTORE STOCK
      // =====================================================

      const stockItems =
        order.items.map(
          (item) => ({
            productId:
              String(
                item.productId
              ),

            quantity:
              Number(
                item.quantity || 1
              ),
          })
        );

      await restoreProductStock(
        stockItems
      );

      // =====================================================
      // CANCEL DATE + TIME
      // =====================================================

      const now = new Date();

      const cancelDate =
        now.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

      const cancelTime =
        now.toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

      // =====================================================
      // TRACKING HISTORY
      // =====================================================

      if (
        !Array.isArray(
          order.trackingHistory
        )
      ) {
        order.trackingHistory =
          [];
      }

      // Remove any previous cancellation entry
      // to prevent duplicate history entries.
      order.trackingHistory =
        order.trackingHistory.filter(
          (item) =>
            item.title !==
            "Order Cancelled"
        );

      // Add cancellation as LAST event.
      order.trackingHistory.push({
        title:
          "Order Cancelled",

        location:
          "ShopEase",

        date:
          cancelDate,

        time:
          cancelTime,

        completed: true,
      });

      // Tell Mongoose nested array changed.
      order.markModified(
        "trackingHistory"
      );

      // =====================================================
      // UPDATE ORDER
      // =====================================================

      order.orderStatus =
        "Cancelled";

      order.currentLocation =
        "Order Cancelled";

      // Remove shipment data because the order
      // is no longer going to be delivered.
      order.trackingNumber = "";

      order.expectedDelivery = "";

      // =====================================================
      // SAVE
      // =====================================================

      await order.save();

      // =====================================================
      // RESPONSE
      // =====================================================

      return res.status(200).json({
        success: true,

        message:
          "Order cancelled successfully.",

        order: {
          id:
            order._id,

          orderId:
            order.orderId,

          status:
            order.orderStatus,

          paymentStatus:
            order.paymentStatus,

          total:
            order.total,

          currentLocation:
            order.currentLocation,

          trackingNumber:
            order.trackingNumber,

          expectedDelivery:
            order.expectedDelivery,

          trackingHistory:
            order.trackingHistory,
        },
      });
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Unable to cancel order.",
      });
    }
  };

// =========================================================
// GET MY ORDERS
// =========================================================

const getMyOrders =
  async (
    req,
    res
  ) => {
    try {
      const orders =
        await Order.find({
          user:
            req.user._id,
        })
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
        "Get orders error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to load orders.",
      });
    }
  };

// =========================================================
// GET SINGLE ORDER
// =========================================================

const getOrderById =
  async (
    req,
    res
  ) => {
    try {
      const order =
        await Order.findOne({
          orderId:
            req.params.orderId,

          user:
            req.user._id,
        }).lean();

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      return res.status(200).json({
        success: true,

        order,
      });
    } catch (error) {
      console.error(
        "Get single order error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to load order.",
      });
    }
  };

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
};