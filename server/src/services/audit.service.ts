// src/services/audit.service.ts
import { Prisma } from "@prisma/client";

interface AuditLogInput {
  documentId: number;
  userId: number;
  action: string;
  details: string;
}

/**
 * Writes an immutable audit entry inside a running Prisma transaction.
 * Must always be called within a prisma.$transaction callback — never standalone —
 * so the log and the triggering operation are atomically committed or rolled back together.
 */
export async function writeAuditLog(
  tx: Prisma.TransactionClient,
  input: AuditLogInput
): Promise<void> {
  await tx.auditLog.create({
    data: {
      documentId: input.documentId,
      userId: input.userId,
      action: input.action,
      details: input.details,
    },
  });
}