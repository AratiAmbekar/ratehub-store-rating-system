import { Router } from 'express';
import { register, login, me, updatePassword, logout } from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRegister, validatePasswordUpdate } from '../middleware/validation';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', login);
router.get('/me', authenticateUser, me);
router.put('/update-password', authenticateUser, validatePasswordUpdate, updatePassword);
router.post('/logout', logout);

export default router;
