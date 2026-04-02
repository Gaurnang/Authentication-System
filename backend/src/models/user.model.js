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
        default: null,
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
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    refreshToken: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);