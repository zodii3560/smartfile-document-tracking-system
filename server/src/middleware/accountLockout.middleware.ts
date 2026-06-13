import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// Store failed login attempts in memory (in production, use Redis)
const failedAttempts = new Map<string, { count: number; lockUntil: number }>();

const MAX_ATTEMPTS = 10;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const checkAccountLockout = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  
  if (!email) {
    return next();
  }

  const now = Date.now();
  const record = failedAttempts.get(email);

  if (record && record.lockUntil > now) {
    const remainingTime = Math.ceil((record.lockUntil - now) / 1000 / 60);
    return res.status(429).json({
      success: false,
      message: `Account locked due to too many failed attempts. Please try again in ${remainingTime} minutes.`
    });
  }

  next();
};

export const recordFailedAttempt = (email: string) => {
  const now = Date.now();
  const record = failedAttempts.get(email) || { count: 0, lockUntil: 0 };

  // Reset if lockout period has expired
  if (record.lockUntil > 0 && record.lockUntil < now) {
    record.count = 0;
    record.lockUntil = 0;
  }

  record.count++;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockUntil = now + LOCKOUT_DURATION;
  }

  failedAttempts.set(email, record);
};

export const resetFailedAttempts = (email: string) => {
  failedAttempts.delete(email);
};
