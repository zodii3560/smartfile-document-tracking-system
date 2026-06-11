import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  createDepartment,
  getDepartments,
} from "../controllers/department.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// Sprint 1: creating departments requires ADMIN; listing requires any authenticated user
router.post("/", protect, authorize(UserRole.ADMIN), createDepartment);
router.get("/", protect, getDepartments);

export default router;