const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
  userId: {
     type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
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

  // API Keys 
  apiKeys: [{
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
    timestamp: { 
        type: Date,
         default: Date.now
         },
    status: {
         type: Number }
         , 
    latency: {
         type: Number 
        } 
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
    }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('API', apiSchema);
