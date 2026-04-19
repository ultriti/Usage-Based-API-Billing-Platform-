const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User model
 *
 * Modifications (2026-04-19):
 * - Hash passwords on save using bcryptjs.
 * - Default `password` to `select: false` so it's not returned by queries.
 * - Added `comparePassword()` instance method.
 * - Added `toJSON` transform to sanitize output: map `_id` -> `id`, remove `password` and `verificationCode`, drop `__v`.
 * - Fixed `api.url` property to use `required: true`.
 * - Added unique indexes for `email` and `username`.
 *
 * Notes for controllers:
 * - When verifying password (login/delete), query with `.select('+password')` and use `user.comparePassword(candidate)`.
 * - Do not return verification codes in API responses.
 * - Install dependency: `npm install bcryptjs`
 */

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
    profilePicture:{
        url:{
            type:String,
            default:""
        },
        imageId:{
            type:String,
            default:""
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
    api : [
        {
            url : {
                type:String,
                default:"",
                required : true
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
    membership:{
        type:Boolean,
        default:false
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
    }


}, { timestamps: true });

// Hash password before save if modified
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Sanitize output when converting to JSON
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        if (ret.verificationCode) delete ret.verificationCode;
        return ret;
    }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;