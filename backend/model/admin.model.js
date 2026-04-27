const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    profilePicture: {
        url: {
            type: String,
            default: ""
        },
        imageId: {
            type: String,
            default: ""
        }
    },
    isVerified: {
        email: {
            type: Boolean,
            default: false
        },
        phone: {
            type: Boolean,
            default: false
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'provider'],
        default: 'admin'
    },
    membership: {
        type: Boolean,
        default: false
    },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    subscriptionExpires: {
        type: Date,
        default: null
    },
    verificationCode: {
        email: {
            type: Number,
            default: null
        },
        phone: {
            type: Number,
            default: null
        }
    },
    verificationCodeExpires: {
        email: {
            type: Date,
            default: null
        },
        phone: {
            type: Date,
            default: null
        }
    },
    activityLogs: [{
        action: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });


// Password hasging
AdminSchema.methods.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

AdminSchema.methods.comparePassword = async function (password, userPassword) {
    return await bcrypt.compare(String(password), String(userPassword));
};

// const Provider = mongoose.model('Admin', AdminSchema);
// module.exports = Provider;



const adminModel = mongoose.model('Admin', AdminSchema);
module.exports = adminModel;