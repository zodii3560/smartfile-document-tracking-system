-- Sprint 1: Reconcile schema drift between migrations, live DB, and Prisma schema.
-- Uses conditional renames so data is preserved on every environment.

-- Department.code was added manually on some DBs; ensure it exists for fresh installs too.
ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "code" TEXT;

-- Legacy migration used "referenceNumber"; schema now uses "trackingNumber".
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Document' AND column_name = 'referenceNumber'
  ) THEN
    ALTER TABLE "Document" RENAME COLUMN "referenceNumber" TO "trackingNumber";
  END IF;
END $$;

-- Rename FK column to match Prisma field "currentDepartmentId" (was "departmentId").
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Document' AND column_name = 'departmentId'
  ) THEN
    ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_departmentId_fkey";
    ALTER TABLE "Document" RENAME COLUMN "departmentId" TO "currentDepartmentId";
  END IF;
END $$;

-- Ensure FK constraint uses the new column name.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Document_currentDepartmentId_fkey'
  ) THEN
    ALTER TABLE "Document"
      ADD CONSTRAINT "Document_currentDepartmentId_fkey"
      FOREIGN KEY ("currentDepartmentId") REFERENCES "Department"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
