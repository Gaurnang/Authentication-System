import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
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
    isVerified : {
        type: Boolean,
        default: false
    }, 
    verifyEmailOtp : {
        type: String,
        default: null
    },
    verifyEmailOtpExpiresAt : {
        type: Date,
        default: null
    },
    resetPasswordOtp : {
        type: String,
        default: null
    },
    resetPasswordOtpExpiry : {
        type: Date,
        default: null
    }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);