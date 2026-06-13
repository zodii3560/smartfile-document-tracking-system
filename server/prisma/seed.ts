import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// FIX (Critical #1): no hardcoded credential. The seed refuses to run unless
// the operator supplies these via the environment, and the password value
// is never written to logs — even on success.
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

async function main() {
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    throw new Error(
      "Seed aborted: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env file. " +
        "There is no default — this is intentional."
    );
  }

  if (SEED_ADMIN_PASSWORD.length < 12) {
    throw new Error("Seed aborted: SEED_ADMIN_PASSWORD must be at least 12 characters.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: SEED_ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`Seed skipped: ${SEED_ADMIN_EMAIL} already exists.`);
    return;
  }

  await prisma.user.create({
    data: {
      name: "System Admin",
      email: SEED_ADMIN_EMAIL,
      password: await bcrypt.hash(SEED_ADMIN_PASSWORD, 12),
      role: UserRole.ADMIN,
    },
  });

  console.log(`Seeded admin user: ${SEED_ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());