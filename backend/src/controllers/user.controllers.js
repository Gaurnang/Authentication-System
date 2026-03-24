import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

        const newUser = new User({
            email, 
            username: name,
            password: hashedPassword
        });

        await newUser.save();

        const {password : pass, ...userData} = newUser._doc;
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

        const { password: pass, ...userData } = existUser.toObject();
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