import { Router } from 'express';
import { getStats, getUsers, getStores, getUserById, createUser } from '../controllers/admin.controller';
import { authenticateUser, requireRole } from '../middleware/auth';
import { validateAdminUserCreate } from '../middleware/validation';

const router = Router();

router.use(authenticateUser, requireRole(['ADMIN']));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/stores', getStores);

router.get('/users/:id', getUserById);
router.get('/stores/:id', getUserById);

router.post('/users', validateAdminUserCreate, createUser);


export default router;
