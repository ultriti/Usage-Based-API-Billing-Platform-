const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const apiSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
  baseUrl: {
    type: String,
    required: true,
  },
  platformUrl: {
    type: String,
    required: true,
    default: "import.meta.env.BACKEND_URL_RD/",
  },
  status: {
    type: String,
    enum: ["active", "revoked"],
    default: "active",
  },

  subscriptionPlan: {
    subscriptionType: {
      type: String,
      enum: ["basic", "pro","Model","Heavy Model","Ultra Heavy","custom"],
      default: "basic",
    },
    price: {
      partialpayment: {
        amount:{
          type: Number,
        default: 20,
        },
        requestLimit: {
          type: Number,
          default: 1000,
        },
        timeLimit: {
          type: Date,
          default: Date.now,
        },
      },
      monthlypayment: {
        amount: {
          type: Number,
          default: 499,
        },
        requestLimit: {
          type: Number,
          default: 25000,
        },
        timeLimit: {  
          type: Date,
          default: Date.now,
        },
      },
      annualpayment: {
        amount: {
          type: Number,
          default: 12000,
        },
        requestLimit: {
          type: Number,
          default: 500000,
        },
        timeLimit: {
          type: Date,
          default: Date.now,
        },
      },
    },
  },

  // API Keys
  apiKeys: [
    {
      consumerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      key: {
        type: String,
        required: true,
        unique: true,
      },
      status: {
        type: String,
        enum: ["active", "revoked"],
        default: "active",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Usage Logs
  usageLogs: [
    {
      apiKey: {
        type: String,
      },
      endpoint: {
        type: String,
      },
      timestamp: [
        {
          type: Date,
          default: Date.now,
        },
      ],
      status: [
        {
          type: Number,
          default: 0,
        },
      ],
      latency: [
        {
          type: Number,
          default: 0,
        },
      ],
    },
  ],

  categories: {
    type: String,
    enum: [
      "development",
      "LLM Model",
      "character",
      "design",
      "testing",
      "documentation",
      "analytics",
      "security",
      "billing",
      "support",
      "marketing",
      "operations",
    ],
    default: "development",
  },

  // Billing info
  billing: {
    totalRequests: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    consumerDetail: [
      {
        customerId: mongoose.Schema.Types.ObjectId,
        ammountPaid: {
          type: Number,
          default: 0,
        },
        paidAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "paid"],
          default: "pending",
        },
      },
    ],
  },

  createdAt: { type: Date, default: Date.now },
});

// key hasging
apiSchema.methods.hashKeys = async function (keyId) {
  return await bcrypt.hash(keyId, 10);
};

apiSchema.methods.compareKeys = async function (keys, consumerKeys) {
  return await bcrypt.compare(String(keys), String(consumerKeys));
};

module.exports = mongoose.model("API", apiSchema);
