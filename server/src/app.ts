import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes"; // Add this import
import departmentRoutes from "./routes/department.routes"; // Added the 's' to match your actual file name
import userRoutes from "./routes/user.route";
import documentRoutes from "./routes/document.routes"; // 1. Add this import
import { errorHandler } from "./middleware/error.middleware";

const app: Application = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

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