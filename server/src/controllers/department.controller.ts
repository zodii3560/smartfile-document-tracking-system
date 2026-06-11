import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../config/prisma";

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Department name is required");
  }

  // 1. Uniqueness check is actually redundant if 'name' has a @unique constraint in Prisma!
  // The global error handler will automatically catch the P2002 error and return a 409 Conflict.
  // We can just go straight to creation for better performance.
  const department = await prisma.department.create({
    data: { name, description },
  });

  return res.status(201).json({
    success: true,
    data: department,
  });
});

export const getDepartments = asyncHandler(async (req: Request, res: Response) => {
  const departments = await prisma.department.findMany({
    orderBy: { id: "asc" },
  });

  return res.json({
    success: true,
    data: departments,
  });
});