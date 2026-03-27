import express, { Router } from 'express';
import { signup, login, logout, profileUser, resetPassword } from '../controllers/user.controllers.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';
import { getAllUsers } from '../controllers/user.controllers.js';
import { emailVerification } from '../controllers/user.controllers.js';
import { forgotPassword} from '../controllers/user.controllers.js';


const router = Router();


router.post('/signup', signup);
router.post('/email-verification', emailVerification);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authMiddleware, profileUser);
router.get('/users', getAllUsers);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
export default router;