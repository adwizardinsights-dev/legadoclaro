"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendReviewCompletedEmail } from "@/lib/email";
import type { WillStatus } from "@prisma/client";
import type { ActionResult } from "@/types/will";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session.user;
}

// ──────────────────────────────────────────
// Admin — list all documents
// ──────────────────────────────────────────

export async function getAdminDocuments(status?: WillStatus) {
  await requireAdmin();

  return prisma.willDocument.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
      attorneyReviewRequest: true,
      payments: { where: { status: "COMPLETED" } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// ──────────────────────────────────────────
// Admin — get single document detail
// ──────────────────────────────────────────

export async function getAdminDocument(documentId: string) {
  await requireAdmin();

  return prisma.willDocument.findUnique({
    where: { id: documentId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      attorneyReviewRequest: true,
      payments: true,
    },
  });
}

// ──────────────────────────────────────────
// Admin — update document status
// ──────────────────────────────────────────

export async function updateDocumentStatus(
  documentId: string,
  status: WillStatus,
  adminNotes?: string
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const doc = await prisma.willDocument.findUnique({
      where: { id: documentId },
      include: { user: true, attorneyReviewRequest: true },
    });

    if (!doc) return { success: false, error: "Document not found." };

    await prisma.$transaction(async (tx) => {
      await tx.willDocument.update({
        where: { id: documentId },
        data: {
          status,
          adminNotes: adminNotes ?? doc.adminNotes,
          completedAt:
            status === "APPROVED" || status === "COMPLETED" ? new Date() : undefined,
        },
      });

      // Update attorney review request if exists
      if (doc.attorneyReviewRequest) {
        await tx.attorneyReviewRequest.update({
          where: { id: doc.attorneyReviewRequest.id },
          data: {
            status,
            reviewedBy: admin.id,
            completedAt:
              status === "APPROVED" || status === "NEEDS_REVISION"
                ? new Date()
                : undefined,
            ...(adminNotes ? { attorneyNotes: adminNotes } : {}),
          },
        });
      }
    });

    // Notify user if review is completed
    if (
      doc.user.email &&
      (status === "APPROVED" || status === "NEEDS_REVISION")
    ) {
      sendReviewCompletedEmail(doc.user.email, doc.user.name ?? "").catch(
        console.error
      );
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/documents/${documentId}`);
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[updateDocumentStatus]", err);
    return { success: false, error: "Failed to update document status." };
  }
}

// ──────────────────────────────────────────
// Admin — save internal notes
// ──────────────────────────────────────────

export async function saveAdminNotes(
  documentId: string,
  notes: string
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.willDocument.update({
      where: { id: documentId },
      data: { adminNotes: notes },
    });

    revalidatePath(`/admin/documents/${documentId}`);
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[saveAdminNotes]", err);
    return { success: false, error: "Failed to save notes." };
  }
}

// ──────────────────────────────────────────
// Admin — dashboard stats
// ──────────────────────────────────────────

export async function getAdminStats() {
  await requireAdmin();

  const [total, draft, submitted, underReview, approved, needsRevision, revenue] =
    await Promise.all([
      prisma.willDocument.count(),
      prisma.willDocument.count({ where: { status: "DRAFT" } }),
      prisma.willDocument.count({ where: { status: "SUBMITTED" } }),
      prisma.willDocument.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.willDocument.count({ where: { status: "APPROVED" } }),
      prisma.willDocument.count({ where: { status: "NEEDS_REVISION" } }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

  return {
    total,
    draft,
    submitted,
    underReview,
    approved,
    needsRevision,
    totalRevenueCents: revenue._sum.amount ?? 0,
  };
}
