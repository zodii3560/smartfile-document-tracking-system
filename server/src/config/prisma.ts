import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Initialize the PostgreSQL adapter with your connection string
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

// 2. Pass the adapter into the PrismaClient constructor
const prisma = new PrismaClient({ adapter });

export default prisma;