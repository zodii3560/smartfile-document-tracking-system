// src/routes/user.route.ts
import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validation.middleware";
import { createUserSchema, updateUserSchema } from "../validators/auth.validator";

const router = Router();

router
  .route("/")
  .post(protect, authorize(UserRole.ADMIN), validate(createUserSchema), createUser)
  .get(protect, authorize(UserRole.ADMIN), getUsers);

router
  .route("/:id")
  .get(protect, authorize(UserRole.ADMIN), getUserById)
  .put(protect, authorize(UserRole.ADMIN), validate(updateUserSchema), updateUser)
  .delete(protect, authorize(UserRole.ADMIN), deactivateUser);

export default router;