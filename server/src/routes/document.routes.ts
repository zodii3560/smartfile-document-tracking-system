// src/routes/document.routes.ts
import { Router } from "express";
import { UserRole } from "@prisma/client";
import {
  createDocument,
  getDocuments,
  getDocumentById,
  getDocumentHistory,
  transferDocument,
  updateDocumentStatus,
  searchDocuments,
} from "../controllers/document.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validation.middleware";
import { createDocumentSchema } from "../validators/auth.validator";

const router = Router();

// All document routes require a valid JWT
router.use(protect);

// ── CRITICAL: /search before /:id ──────────────────────────────────
// If /:id is registered first, Express treats "search" as a document ID.
router.get("/search", searchDocuments);

// ── Core document operations ────────────────────────────────────────
router.post(
  "/",
  authorize(UserRole.ADMIN, UserRole.REGISTRY_OFFICER),
  validate(createDocumentSchema),
  createDocument
);
router.get("/", getDocuments);

// ── Single-document operations ──────────────────────────────────────
router.get("/:id", getDocumentById);

// Phase 3: full immutable audit trail for a document
router.get("/:id/history", getDocumentHistory);

// Phase 4: inter-department routing
router.post(
  "/:id/transfer",
  authorize(UserRole.ADMIN, UserRole.REGISTRY_OFFICER),
  transferDocument
);

// Phase 5: status lifecycle
// Fine-grained role checking enforced inside the controller — every role
// has at least one permitted transition so the guard stays at protect level
router.patch("/:id/status", updateDocumentStatus);

export default router;