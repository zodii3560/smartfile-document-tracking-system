import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Bootstrap seed — needed because Sprint 1 locked POST /api/users to ADMIN-only
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_ADMIN = {
  name: "System Admin",
  email: "admin@smartfile.local",
  password: "Admin@123",
  role: UserRole.ADMIN,
};

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: SEED_ADMIN.email },
  });

  if (existing) {
    console.log(`Seed skipped: ${SEED_ADMIN.email} already exists.`);
    return;
  }

  await prisma.user.create({
    data: {
      ...SEED_ADMIN,
      password: await bcrypt.hash(SEED_ADMIN.password, 12),
    },
  });

  console.log(`Seeded admin user: ${SEED_ADMIN.email} (password: ${SEED_ADMIN.password})`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
