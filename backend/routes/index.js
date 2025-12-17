import express from 'express';
import chatRoutes from './chat.js';
import sessionRoutes from './session.js';

const router = express.Router();

router.use('/chats', chatRoutes);
router.use('/session', sessionRoutes);
export default router;

