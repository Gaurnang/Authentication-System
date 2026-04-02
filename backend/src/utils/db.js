import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

dotenv.config();

async function migrateLegacyRoles() {
    await User.updateMany(
        { $or: [{ role: { $exists: false } }, { role: null }, { role: '' }] },
        { $set: { role: 'user' } }
    );
}

async function syncAdminFromEnv() {
    const email = process.env.ADMIN_EMAIL?.trim();
    if (!email) return;
    const result = await User.updateOne({ email }, { $set: { role: 'admin' } });
}

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
        await migrateLegacyRoles();
        await syncAdminFromEnv();
    }
    catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};
