import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './utils/db.js';
import userRoutes from './routes/user.auth.js';

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: "*",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', userRoutes);

connectDB();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});