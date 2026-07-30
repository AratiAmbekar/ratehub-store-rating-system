import { Router } from 'express';
import { getStoresList, submitRating } from '../controllers/user.controller';
import { authenticateUser, requireRole } from '../middleware/auth';


const router = Router();

router.get(
  '/stores',
  authenticateUser,
  requireRole(['NORMAL_USER']),
  getStoresList
);

router.post(
  '/ratings',
  authenticateUser,
  requireRole(['NORMAL_USER']),
  submitRating
);

export default router;