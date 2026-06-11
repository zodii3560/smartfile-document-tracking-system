import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../config/prisma"; // Ensure this exact line is present

// Your controller functions (createUser, getUsers, getUserById) follow below...

const SALT_ROUNDS = 12;

/**
 * @desc    Create a new system user with hashed credentials
 * @route   POST /api/users
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, departmentId } = req.body;

  // 1. Hash the plaintext password safely
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 2. Persist user into database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      ...(departmentId && { departmentId }), // Optional association
    },
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // 3. Exclude the sensitive password hash from the client response
  const { password: _, ...userWithoutPassword } = user;

  res.status(201).json({
    success: true,
    data: userWithoutPassword,
  });
});

/**
 * @desc    Retrieve all system users
 * @route   GET /api/users
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });

  res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});

/**
 * @desc    Retrieve a single user by ID
 * @route   GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});