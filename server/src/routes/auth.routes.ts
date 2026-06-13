import { Router } from "express";
import { loginUser } from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import { loginSchema } from "../validators/auth.validator";
import rateLimit from "express-rate-limit";
import { checkAccountLockout } from "../middleware/accountLockout.middleware";

const router = Router();

// Rate limiting for login endpoint: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, checkAccountLockout, validate(loginSchema), loginUser);

export default router;