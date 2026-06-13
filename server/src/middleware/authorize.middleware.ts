import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../config/prisma";

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

/**
 * ADMIN-only authorization - ADMIN has full access to all resources
 */
export const authorizeAdmin = authorize(UserRole.ADMIN);

/**
 * REGISTRY_OFFICER authorization - can register and transfer documents
 * ADMIN also has access for oversight
 */
export const authorizeRegistryOfficer = authorize(UserRole.REGISTRY_OFFICER, UserRole.ADMIN);

/**
 * DEPARTMENT_OFFICER authorization - can view and receive documents in their department
 * ADMIN also has access for oversight
 */
export const authorizeDepartmentOfficer = authorize(UserRole.DEPARTMENT_OFFICER, UserRole.ADMIN);

/**
 * MANAGER authorization - can approve and reject documents
 * ADMIN also has access for oversight
 */
export const authorizeManager = authorize(UserRole.MANAGER, UserRole.ADMIN);

/**
 * Resource-level authorization - ensures user can only access documents in their department
 * ADMIN bypasses this check
 * @param documentIdParam - The parameter name containing the document ID (default: 'id')
 */
export const authorizeDepartmentAccess = (documentIdParam: string = 'id') =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authorized: Authentication required." },
      });
    }

    // ADMIN bypasses department access checks
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // DEPARTMENT_OFFICER and MANAGER must have a department assigned
    if (!req.user.departmentId) {
      return res.status(403).json({
        success: false,
        error: { message: "Forbidden: User must be assigned to a department." },
      });
    }

    const documentId = req.params[documentIdParam];
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: { message: "Bad Request: Document ID parameter is required." },
      });
    }

    // Fetch document to check department ownership
    const document = await prisma.document.findUnique({
      where: { id: Number(documentId) },
      select: { currentDepartmentId: true },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: { message: "Not Found: Document does not exist." },
      });
    }

    // Check if user's department matches document's current department
    if (document.currentDepartmentId !== req.user.departmentId) {
      return res.status(403).json({
        success: false,
        error: { message: "Forbidden: You do not have access to documents in this department." },
      });
    }

    return next();
  });

/**
 * Action-based authorization - checks if user role can perform specific document actions
 * @param action - The action being performed (e.g., 'approve', 'reject', 'transfer', 'register')
 */
export const authorizeDocumentAction = (action: string) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authorized: Authentication required." },
      });
    }

    // ADMIN can perform all actions
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    const userRole = req.user.role;
    const allowedActions: Record<UserRole, string[]> = {
      [UserRole.ADMIN]: ['*'],
      [UserRole.REGISTRY_OFFICER]: ['register', 'transfer', 'view'],
      [UserRole.DEPARTMENT_OFFICER]: ['view', 'receive'],
      [UserRole.MANAGER]: ['approve', 'reject', 'view'],
    };

    const roleAllowedActions = allowedActions[userRole];

    if (!roleAllowedActions.includes(action) && !roleAllowedActions.includes('*')) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Forbidden: Role '${userRole}' is not permitted to perform action '${action}'.`,
        },
      });
    }

    return next();
  });
