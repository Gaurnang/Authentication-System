import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/db.js';
import userRoutes from './routes/user.auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const coresOptions = {
    origin: 'http://localhost:5000',
    credentials: true,
};

app.use(cors(coresOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', userRoutes);

connectDB();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});