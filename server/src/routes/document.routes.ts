import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { createDocument } from '../controllers/document.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

// Sprint 1: only registry staff (and admins) may register new documents
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.REGISTRY_OFFICER), createDocument);

export default router;