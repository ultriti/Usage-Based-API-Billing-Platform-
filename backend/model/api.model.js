const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")


const apiSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  baseUrl: {
    type: String,
    required: true
  },
  platformUrl: {
    type: String,
    required: true,
    default : "http://localhost:3000/"
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active'
  },

  // API Keys 
  apiKeys: [{
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    key: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Usage Logs 
  usageLogs: [{
    apiKey: {
      type: String
    },
    endpoint: {
      type: String
    },
    timestamp: [{
      type: Date,
      default: Date.now
    }],
    status: [{
      type: Number,
      default: 0
    }]
    ,
    latency: [{
      type: Number,
      default: 0
    }]
  }],

  // Billing info 
  billing: {
    totalRequests: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    invoiceDate: {
      type: Date,
      default: Date.now
    },
    consumerDetail: [
      {
        customerId: mongoose.Schema.Types.ObjectId,
        ammountPaid: {
          type: Number,
          default: 0
        },
        paidAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['pending', 'paid'],
          default: 'pending'
        },
      }
    ]
  },

  createdAt: { type: Date, default: Date.now }
});


// key hasging
apiSchema.methods.hashKeys = async function (keyId) {
  return await bcrypt.hash(keyId, 10);
};

apiSchema.methods.compareKeys = async function (keys, consumerKeys) {
  return await bcrypt.compare(String(keys), String(consumerKeys));
};


module.exports = mongoose.model('API', apiSchema);
