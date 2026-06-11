import { Router } from "express";
import { UserRole } from "@prisma/client";
import { createUser, getUsers, getUserById } from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// Sprint 1: user management is ADMIN-only (was publicly open on POST)
router.route("/")
  .post(protect, authorize(UserRole.ADMIN), createUser)
  .get(protect, authorize(UserRole.ADMIN), getUsers);

router.route("/:id")
  .get(protect, authorize(UserRole.ADMIN), getUserById);

export default router;