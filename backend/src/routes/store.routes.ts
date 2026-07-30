import { Router } from 'express';
import { getStoreDashboard } from '../controllers/store.controller';
import { authenticateUser, requireRole } from '../middleware/auth';

const router = Router();

router.get(
  '/dashboard',
  authenticateUser,
  requireRole(['STORE_OWNER']),
  getStoreDashboard
);

export default router;