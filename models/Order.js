const mongoose = require("mongoose");

// =========================================================
// ORDER ITEM SCHEMA
// =========================================================

const orderItemSchema =
  new mongoose.Schema(
    {
      productId: {
        type: String,
        required: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,

        validate: {
          validator: Number.isInteger,
          message:
            "Quantity must be a whole number.",
        },
      },

      image: {
        type: String,
        default: "",
      },

      size: {
        type: String,
        default: "",
      },

      color: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

// =========================================================
// TRACKING HISTORY SCHEMA
// =========================================================

const trackingHistorySchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      location: {
        type: String,
        default: "",
        trim: true,
      },

      date: {
        type: String,
        default: "",
      },

      time: {
        type: String,
        default: "",
      },

      completed: {
        type: Boolean,
        default: false,
      },
    },
    {
      _id: false,
    }
  );

// =========================================================
// ORDER SCHEMA
// =========================================================

const orderSchema =
  new mongoose.Schema(
    {
      // =====================================================
      // USER
      // =====================================================

      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      // =====================================================
      // SHOP-EASE ORDER ID
      // =====================================================

      orderId: {
        type: String,

        required: true,

        unique: true,

        index: true,

        trim: true,
      },

      // =====================================================
      // ORDER ITEMS
      // =====================================================

      items: {
        type: [orderItemSchema],

        required: true,

        validate: {
          validator: (items) =>
            Array.isArray(items) &&
            items.length > 0,

          message:
            "Order must contain at least one item.",
        },
      },

      // =====================================================
      // AMOUNTS
      // =====================================================

      subtotal: {
        type: Number,

        required: true,

        min: 0,
      },

      shipping: {
        type: Number,

        required: true,

        min: 0,
      },

      total: {
        type: Number,

        required: true,

        min: 0,
      },

      // =====================================================
      // PAYMENT METHOD
      // =====================================================

      paymentMethod: {
        type: String,

        enum: [
          "cod",
          "upi",
          "card",
        ],

        required: true,
      },

      // =====================================================
      // PAYMENT STATUS
      // =====================================================

      paymentStatus: {
        type: String,

        enum: [
          "pending",
          "paid",
          "failed",
        ],

        default: "pending",

        index: true,
      },

      // =====================================================
      // RAZORPAY ORDER ID
      // =====================================================

      razorpayOrderId: {
        type: String,

        default: null,

        trim: true,

        index: true,
      },

      // =====================================================
      // RAZORPAY PAYMENT ID
      // =====================================================
      //
      // IMPORTANT:
      // Do NOT use unique:true here.
      // We create a partial unique index below so
      // only real Razorpay payment IDs are unique.
      //

      razorpayPaymentId: {
        type: String,

        default: null,

        trim: true,
      },

      // =====================================================
      // RAZORPAY SIGNATURE
      // =====================================================

      razorpaySignature: {
        type: String,

        default: null,

        trim: true,
      },

      // =====================================================
      // ORDER STATUS
      // =====================================================

      orderStatus: {
        type: String,

        enum: [
          "Processing",
          "Packed",
          "Shipped",
          "In Transit",
          "Out for Delivery",
          "Delivered",
          "Cancelled",
        ],

        default: "Processing",

        index: true,
      },

      // =====================================================
      // CUSTOMER DETAILS
      // =====================================================

      customer: {
        firstName: {
          type: String,

          required: true,

          trim: true,
        },

        lastName: {
          type: String,

          default: "",

          trim: true,
        },

        email: {
          type: String,

          required: true,

          trim: true,

          lowercase: true,
        },

        phone: {
          type: String,

          required: true,

          trim: true,
        },

        address: {
          type: String,

          required: true,

          trim: true,
        },

        city: {
          type: String,

          required: true,

          trim: true,
        },

        state: {
          type: String,

          required: true,

          trim: true,
        },

        pincode: {
          type: String,

          required: true,

          trim: true,
        },
      },

      // =====================================================
      // COURIER
      // =====================================================

      courier: {
        type: String,

        default: "Delhivery",

        trim: true,
      },

      // =====================================================
      // TRACKING NUMBER
      // =====================================================

      trackingNumber: {
        type: String,

        default: "",

        trim: true,

        index: true,
      },

      // =====================================================
      // CURRENT LOCATION
      // =====================================================

      currentLocation: {
        type: String,

        default:
          "ShopEase Warehouse",

        trim: true,
      },

      // =====================================================
      // EXPECTED DELIVERY
      // =====================================================

      expectedDelivery: {
        type: String,

        default: "",

        trim: true,
      },

      // =====================================================
      // TRACKING HISTORY
      // =====================================================

      trackingHistory: {
        type: [
          trackingHistorySchema,
        ],

        default: [],
      },
    },

    {
      timestamps: true,
    }
  );

// =========================================================
// INDEXES
// =========================================================

// User's latest orders
orderSchema.index({
  user: 1,
  createdAt: -1,
});

// Orders by status
orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

// Orders by payment status
orderSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

// =========================================================
// RAZORPAY PAYMENT ID UNIQUE INDEX
// =========================================================
//
// Only non-empty real payment IDs are unique.
// COD orders with null payment ID are allowed.
//

orderSchema.index(
  {
    razorpayPaymentId: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      razorpayPaymentId: {
        $type: "string",
        $ne: "",
      },
    },
  }
);

// =========================================================
// MODEL
// =========================================================

module.exports =
  mongoose.model(
    "Order",
    orderSchema
  );