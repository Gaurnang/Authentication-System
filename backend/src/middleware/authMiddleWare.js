import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        
        const user = await User.findById(decoded.id).select('-password');

        if(!user) {
            return res.status(404).json({ success : false, message: 'User not found' });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};