import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

// 1. Initialize the PostgreSQL adapter with your connection string
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});

// 2. Pass the adapter into the PrismaClient constructor with logging configuration
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn']
});

export default prisma;