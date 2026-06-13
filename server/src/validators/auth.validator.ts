import { z } from 'zod';

// Password complexity regex: minimum 12 characters, at least one uppercase, one lowercase, one number, one special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().regex(passwordRegex, 'Password must be at least 12 characters with uppercase, lowercase, number, and special character'),
  role: z.enum(['ADMIN', 'REGISTRY_OFFICER', 'DEPARTMENT_OFFICER', 'MANAGER'], {
    message: 'Invalid role. Must be one of: ADMIN, REGISTRY_OFFICER, DEPARTMENT_OFFICER, MANAGER'
  }),
  departmentId: z.number().optional().nullable()
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'REGISTRY_OFFICER', 'DEPARTMENT_OFFICER', 'MANAGER']).optional(),
  departmentId: z.number().optional().nullable()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(100, 'Department name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional()
});

export const createDocumentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must not exceed 200 characters'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional().default('NORMAL'),
  departmentId: z.number('Department ID must be a number')
});
