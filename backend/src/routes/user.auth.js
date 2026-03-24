import express, { Router } from 'express';
import { signup, login, logout, profileUser } from '../controllers/user.controllers.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';
import { getAllUsers } from '../controllers/user.controllers.js';


const router = Router();


router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authMiddleware, profileUser);
router.get('/users', getAllUsers);

export default router;