import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../config/prisma";

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Guard clause: Check for input fields
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide an email and password.");
  }

  // 2. Locate user in database
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 3. Verify user existence and compare bcrypt hash
  if (user && (await bcrypt.compare(password, user.password))) {
   // 4. Generate JWT payload
    const token = jwt.sign(
      { id: user.id, role: user.role, departmentId: user.departmentId },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "30d") as any }
    );

    // 5. Respond with profile metadata and token
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        token, // Client will store this token for subsequent requests
      },
    });
  } else {
    // MODIFIED: Return 401 directly to prevent global middleware overrides
    return res.status(401).json({
      success: false,
      error: { message: "Invalid email or password." }
    });
  }
});