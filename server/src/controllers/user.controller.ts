// src/controllers/user.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../config/prisma";

const SALT_ROUNDS = 12;

// ================================================================
// CREATE USER
// ================================================================
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, departmentId } = req.body;

  // Validation is now handled by Zod middleware
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      ...(departmentId !== undefined && {
        departmentId: departmentId === null ? null : Number(departmentId),
      }),
    },
    include: {
      department: { select: { id: true, name: true } },
    },
  });

  const { password: _, ...userWithoutPassword } = user;

  return res.status(201).json({ success: true, data: userWithoutPassword });
});

// ================================================================
// GET ALL USERS
// ================================================================
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true, // Admins need visibility into deactivated accounts
      department: { select: { id: true, name: true } },
      createdAt: true,
    },
    orderBy: { id: "asc" },
  });

  return res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});

// ================================================================
// GET USER BY ID
// ================================================================
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      department: { select: { id: true, name: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ success: true, data: user });
});

// ================================================================
// UPDATE USER  (Phase 1)
// Password changes require a separate dedicated endpoint in a later sprint.
// ================================================================
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  const { name, email, role, departmentId } = req.body;

  // Require at least one field — reject empty patch bodies
  if (!name && !email && !role && departmentId === undefined) {
    return res.status(400).json({
      success: false,
      message: "At least one field must be provided: name, email, role, departmentId.",
    });
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!existing) {
    return res.status(404).json({ success: false, message: `User ${userId} not found.` });
  }

  // Email uniqueness check only when it's actually changing
  if (email && email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email } });
    if (emailTaken) {
      return res.status(409).json({ success: false, message: "Email address is already in use." });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(departmentId !== undefined && {
        departmentId: departmentId === null ? null : Number(departmentId),
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      department: { select: { id: true, name: true } },
      updatedAt: true,
    },
  });

  return res.status(200).json({ success: true, data: updatedUser });
});

// ================================================================
// DEACTIVATE USER — soft delete  (Phase 1)
// Hard deletes are never permitted: audit logs reference userId and
// a missing FK would corrupt the audit trail permanently.
// ================================================================
export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  // Self-deactivation would lock out the acting admin immediately
  if (req.user?.id === userId) {
    return res.status(400).json({
      success: false,
      message: "You cannot deactivate your own account.",
    });
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, isActive: true },
  });

  if (!existing) {
    return res.status(404).json({ success: false, message: `User ${userId} not found.` });
  }

  if (!existing.isActive) {
    return res.status(409).json({ success: false, message: "User account is already deactivated." });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return res.status(200).json({
    success: true,
    message: `User account ${existing.email} has been deactivated.`,
  });
});