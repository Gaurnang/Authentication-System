import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { sendEmail } from '../middleware/sendEmail.js';

export const signup = async (req, res) => {
    try {
        const {email, name, password} = req.body;

        if(!email || !name || !password ) {
            return res.status(400).json({ success : false, message: 'Email, name, and password are required' });
        }

        if(password.length < 6) {
            return res.status(400).json({ success : false, message: 'Password must be at least 6 characters long' });
        }
        
        const existUser = await User.findOne({ email });

        if(existUser) {
            return res.status(400).json({ success : false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);// OTP expires in 15 minutes

        const newUser = new User({
            email, 
            username: name,
            password: hashedPassword,
            verifyEmailOtp: otp,
            verifyEmailOtpExpiresAt: expiresAt
        });

        await newUser.save();
        const {password : pass, verifyEmailOtp, verifyEmailOtpExpiresAt, ...userData} = newUser._doc;

        const data = {
            email: newUser.email,
            subject: 'Email Verification Request',
            message: `Please verify your email address using the following OTP: ${otp}. This OTP will expire in 15 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2>Verify Your Email</h2>
                    <p>Please use this OTP to verify your email address. It is valid for 15 minutes.</p>
                    <div style="margin: 20px auto; padding: 10px 20px; background: #f3f4f6; display: inline-block; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 2px;">
                        ${otp}
                    </div>
                </div>
            `
        };

        await sendEmail(data);
        res.status(201).json({ success: true, message: 'User created successfully', user: userData });

    } 
    catch (error) {
        res.status(500).json({ success : false, message: 'Signup failed', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password ) {
            return res.status(400).json({ success : false, message: 'Email and password are required' });
        }
        
        const existUser = await User.findOne({ email });

        if(!existUser) {
            return res.status(400).json({ success : false, message: 'User not found' });
        }

        if (!existUser.password) {
            return res.status(400).json({
                success: false,
                message: 'No password is set for this account. Use Forgot password to create one.',
            });
        }

        const isMatch = await bcrypt.compare(password, existUser.password);

        if(!isMatch) {
            return res.status(400).json({ success : false, message: 'Invalid credentials' });
        }

        if(!existUser.isVerified) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);// OTP expires in 15 minutes
            existUser.verifyEmailOtp = otp;
            existUser.verifyEmailOtpExpiresAt = expiresAt;

            await existUser.save();

            const data = {
            email: existUser.email,
            subject: 'Email Verification Request',
            message: `Please verify your email address using the following OTP: ${otp}. This OTP will expire in 15 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2>Verify Your Email</h2>
                    <p>We noticed your email isn't verified yet. Please use this OTP to verify your email address. It is valid for 15 minutes.</p>
                    <div style="margin: 20px auto; padding: 10px 20px; background: #f3f4f6; display: inline-block; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 2px;">
                        ${otp}
                    </div>
                </div>
            `
            };

            await sendEmail(data);

            return res.status(403).json({
                success : false, 
                message: 'Email not verified. A new OTP has been sent to your email address for verification.'
            })

        }

        const accessToken = jwt.sign(
            { id: existUser._id }, 
            process.env.JWT_SECRET,  
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: existUser._id }, 
            process.env.JWT_REFRESH_SECRET,  
            { expiresIn: '7d' }
        );

        existUser.refreshToken = refreshToken;
        await existUser.save();

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000,
        }); 

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: pass, verifyEmailOtp, verifyEmailOtpExpiresAt, refreshToken: rfToken, ...userData } = existUser.toObject();
        res.status(200).json({ success: true, message: 'Login successful', user: userData });
    } 
    catch (error) {
        res.status(500).json({ success : false, message: 'Login failed', error: error.message });
    }
};

export const logout = async (req, res) => {
    try{
        if (req.cookies?.refreshToken) {
            try {
                const decoded = jwt.decode(req.cookies.refreshToken);
                if (decoded && decoded.id) {
                    await User.findByIdAndUpdate(decoded.id, { $set: { refreshToken: null } });
                }
            } catch (err) {
                console.error("Error decoding refresh token during logout", err);
            }
        }
        
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        };
        res.clearCookie('accessToken', options);
        res.clearCookie('refreshToken', options);
        res.status(200).json({ success: true, message: 'Logout successful' });
    }
    catch (error) {        
        res.status(500).json({ success : false, message: 'Logout failed', error: error.message });
    }
   
};

export const profileUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        if(!user) {
            return res.status(404).json({ success : false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success : false, message: 'Failed to fetch user profile', error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        if(!users) {
            return res.status(404).json({ success : false, message: 'No users found' });
        }
        res.status(200).json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ success : false, message: 'Failed to fetch users', error: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be user or admin' });
        }

        const user = await User.findByIdAndUpdate( id, { $set: { role } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Role updated', user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update role', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }

        // Prevent admin from deleting their own account
        if (req.user._id.toString() === id) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully', deletedUser: { id: user._id, email: user.email, username: user.username } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
    }
};

export const emailVerification = async (req, res) => {
    try {
        const {otp} = req.body;

        if(!otp) {
            return res.status(400).json({ success : false, message: 'OTP is required' });
        }
        
        const existUser = await User.findOne({ verifyEmailOtp: otp });

        if(!existUser) {
            return res.status(400).json({ success : false, message: 'Invalid OTP' });
        }

        if(existUser.verifyEmailOtp !== otp || existUser.verifyEmailOtpExpiresAt < new Date()) {
            return res.status(400).json({ success : false, message: 'OTP is invalid or has expired' });
        }

        existUser.isVerified = true;
        existUser.verifyEmailOtp = null;
        existUser.verifyEmailOtpExpiresAt = null;
        await existUser.save();

        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } 
    catch (error) {
        res.status(500).json({ success : false, message: 'Email verification failed', error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        if(!email) {
            return res.status(400).json({ success : false, message: 'Email is required' });
        }
        const existUser = await User.findOne({ email });

        if(!existUser) {
            return res.status(400).json({ success : false, message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        existUser.resetPasswordOtp = otp;
        existUser.resetPasswordOtpExpiry = expiresAt;

        await existUser.save({validateBeforeSave: false});
        
        const resetPasswordUrl = `${process.env.FRONTEND_URL}/login?token=${existUser.resetPasswordOtp}`;

        const data = {
            email: existUser.email,
            subject: 'Password Reset Request',
            message: `Please use the following link to reset your password: ${resetPasswordUrl}. This link will expire in 15 minutes.`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; text-align: center; padding: 40px 20px; background-color: #f9fafb; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb;">
                    <h2 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Reset Your Password</h2>
                    <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">You requested a password reset. Click the button below to set a new securely protected password.</p>
                    <a href="${resetPasswordUrl}" style="display: inline-block; padding: 14px 28px; background-color: #1e293b; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                        Reset Password
                    </a>
                    <p style="margin-top: 30px; font-size: 13px; color: #9ca3af;">This highly secure link is valid for exactly 15 minutes.<br/>If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        }; 
        await sendEmail(data);
        res.status(200).json({ success: true, message: 'Password reset OTP sent to email if email exists' });
    }
    catch (error) {
        res.status(500).json({ success : false, message: 'Failed to send password reset OTP', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const {password, confirmPassword} = req.body;
        if(!password || !confirmPassword) {
            return res.status(400).json({ success : false, message: 'Password and confirmation password are required' });
        }

        const user = await User.findOne({ resetPasswordOtp: req.params.token, resetPasswordOtpExpiry: { $gt: new Date() } });

        if(!user) {
            return res.status(400).json({ success : false, message: 'Invalid or expired OTP' });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({ success : false, message: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpiry = null;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    }
    catch (error) {
        res.status(500).json({ success : false, message: 'Failed to reset password', error: error.message });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ success: false, message: 'Unauthorized request' });
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decodedToken?.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token is expired or used' });
        }

        const accessToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET,  
            { expiresIn: '15m' }
        );

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({ success: true, message: 'Access token refreshed', accessToken });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token', error: error.message });
    }
};
