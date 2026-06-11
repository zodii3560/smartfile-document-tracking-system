import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Role-gate middleware — runs AFTER protect.
 * Sprint 1: enforce permissions per route instead of only checking JWT presence.
 */
export const authorize = (...allowedRoles: UserRole[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authorized: Authentication required before role check." },
      });
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Forbidden: Role '${userRole}' is not permitted for this action.`,
        },
      });
    }

    return next();
  });
