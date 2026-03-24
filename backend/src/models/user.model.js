import mongoose from 'mongoose';

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
    isVerified : {
        type: Boolean,
        default: false
    }, 
    verifyEmailOtp : {
        type: String,
        default: null
    },
    verifyEmailOtpExpiry : {
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

export default mongoose.model('User', userSchema);