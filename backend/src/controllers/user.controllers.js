import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { sendEmail } from '../middleware/sendEmail.js';

dotenv.config();


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
            };

            await sendEmail(data);

            return res.status(403).json({
                success : false, 
                message: 'Email not verified. A new OTP has been sent to your email address for verification.'
            })

        }

        const token = jwt.sign(
            { id: existUser._id }, 
            process.env.JWT_SECRET,  
            { expiresIn: '7d' }
        );

        res.cookie('token', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        }); 

        const { password: pass, verifyEmailOtp, verifyEmailOtpExpiresAt, ...userData } = existUser.toObject();
        res.status(200).json({ success: true, message: 'Login successful', user: userData });
    } 
    catch (error) {
        res.status(500).json({ success : false, message: 'Login failed', error: error.message });
    }
};

export const logout = async (req, res) => {
    try{
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        }
        res.clearCookie('token', options);
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
        const users = await User.find().select('-password');

        if(!users) {
            return res.status(404).json({ success : false, message: 'No users found' });
        }
        res.status(200).json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ success : false, message: 'Failed to fetch users', error: error.message });
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