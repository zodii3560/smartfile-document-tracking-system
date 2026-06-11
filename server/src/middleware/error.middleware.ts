import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the complete stack trace for internal debugging
  console.error("Internal Log ->", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Prisma Specific Engine Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint violation
        statusCode = 409;
        const targetField = (err.meta?.target as string[])?.join(", ") || "Field";
        message = `Conflict: A record with this ${targetField} already exists.`;
        break;
      case "P2025": // Record not found
        statusCode = 404;
        message = "Resource Not Found: The requested operational record does not exist.";
        break;
      default:
        statusCode = 400;
        message = `Database Error: ${err.message}`;
        break;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};