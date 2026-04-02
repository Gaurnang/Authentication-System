import { Router } from 'express';
import {
    signup,
    login,
    logout,
    profileUser,
    resetPassword,
    getAllUsers,
    emailVerification,
    forgotPassword,
    updateUserRole,
    deleteUser,
    refreshAccessToken
} from '../controllers/user.controllers.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
const router = Router();

router.post('/signup', signup);
router.post('/email-verification', emailVerification);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authMiddleware, profileUser);
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.patch('/users/:id/role', authMiddleware, adminMiddleware, updateUserRole);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshAccessToken);

export default router;