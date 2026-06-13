import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes"; // Add this import
import departmentRoutes from "./routes/department.routes"; // Added the 's' to match your actual file name
import userRoutes from "./routes/user.route";
import documentRoutes from "./routes/document.routes"; // 1. Add this import
import { errorHandler } from "./middleware/error.middleware";
import prisma from "./config/prisma";
import { env } from "./config/env";

const app: Application = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Global Middlewares with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      environment: env.NODE_ENV
    });
  }
});

// Application API Routes
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
// Fallback Route for unmatched endpoints (404 Handler)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot match requested route: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware (MUST be registered last)
app.use(errorHandler);

export default app;