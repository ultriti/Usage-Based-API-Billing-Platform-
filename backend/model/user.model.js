const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



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
        enum: ['user', 'admin', "provider"],
        default: 'user'
    },
    api: [{
        apiId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "API",
            required: true
        },
        url: {
            type: String,
            default: ""
        },
        purchased: {
            type: Boolean,
            default: false
        },
        partialPayment: {
            type: Boolean,
            default: false
        },
        // keyCode: {
        //     type: String,
        //     default: ""
        // },
        // keyPassword: {
        //     type: String,
        //     default: ""
        // },
        usage: {
            type: Number,
            default: 0
        },
        apiBill: {
            type: Number,
            default: 0
        }
    }],
    // api: [
    //     {
    //         apiId: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: "API"
    //         },
    //         url: {
    //             type: String,
    //             default: "",
    //             required: true
    //         },
    //         purchased: {
    //             type: Boolean,
    //             default: false
    //         },
    //         partialPayment: {
    //             type: Boolean,
    //             default: false
    //         },
    //         keyCode: {
    //             type: String
    //         },
    //         keyPassword: {
    //             type: String
    //         },
    //         usage: {
    //             type: Number,
    //             default: 0
    //         },
    //         apiBill: {
    //             type: Number,
    //             default: 0
    //         }
    //     }
    // ],
    cart: [
        {
            apiId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Api',
                required: true
            }
        }
    ],
    wishlist: [
        {
            apiId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Api',
                required: true
            }
        }
    ],
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

}, { timestamps: true });


userSchema.methods.hashPassword = async function (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}

userSchema.methods.comparePassword = async function (password, userpassword) {
    console.log('String(password), String(userpassword)', String(password), String(userpassword));
    return await bcrypt.compare(String(password), String(userpassword));
}


const userModel = mongoose.model('User', userSchema);
module.exports = userModel;