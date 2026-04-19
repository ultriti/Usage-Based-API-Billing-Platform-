const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
        required: true
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
        enum: ['consumer', 'admin', "provider"],
        default: 'user'
    },
    api : [
        {
            url : {
                type:String,
                default:"",
                require : true
            },
            purchased : {
                type:Boolean,
                default:false
            }
        }
    ],
    cart:[
        {
            apiId : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Api', 
                required: true
            }
        }
    ],
    wishlist:[
        {
            apiId : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Api', 
                required: true
            }
        }
    ],

}, { timestamps: true });