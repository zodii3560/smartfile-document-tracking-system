import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";

// Typed JWT payload — role uses Prisma UserRole so authorize() can compare safely
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole;
        departmentId: number | null;
      };
    }
  }
}

interface DecodedToken {
  id: number;
  role: UserRole;
  departmentId: number | null;
  iat: number;
  exp: number;
}

/**
 * @desc    Middleware to guard protected routes by validating incoming JWTs
 */
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1. Check for the token in the HTTP Authorization Header (Bearer scheme)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract the raw token string from: "Bearer eyJhbGci..."
      token = req.headers.authorization.split(" ")[1];

      // 2. Decode and verify the cryptographic signature of the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

      // 3. Attach the decoded payload data directly to the request object
      req.user = {
        id: decoded.id,
        role: decoded.role,
        departmentId: decoded.departmentId,
      };

      // 4. Hand off execution control to the next controller in line
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authorized: Token signature verification failed." },
      });
    }
  }

  // 5. Catch edge case where no authorization header was supplied
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: "Not authorized: No token provided in headers." },
    });
  }
});