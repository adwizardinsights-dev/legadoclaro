"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendDraftSavedEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import type {
  PersonalInfoData,
  ExecutorInfoData,
  BeneficiaryData,
  GuardianshipData,
  AssetData,
  ActionResult,
  WillWizardState,
} from "@/types/will";

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");
  return session.user;
}

// ──────────────────────────────────────────
// Get or create the active will document
// ──────────────────────────────────────────

export async function getOrCreateWillDocument(): Promise<
  ActionResult<WillWizardState>
> {
  try {
    const user = await requireAuth();

    let doc = await prisma.willDocument.findFirst({
      where: { userId: user.id, status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
    });

    if (!doc) {
      doc = await prisma.willDocument.create({
        data: { userId: user.id },
      });
    }

    return {
      success: true,
      data: {
        documentId: doc.id,
        currentStep: doc.currentStep,
        state: doc.state ?? undefined,
        personalInfo: (doc.personalInfo as unknown as PersonalInfoData) ?? undefined,
        executorInfo: (doc.executorInfo as unknown as ExecutorInfoData) ?? undefined,
        beneficiaries: (doc.beneficiaries as unknown as BeneficiaryData[]) ?? undefined,
        guardianship: (doc.guardianship as unknown as GuardianshipData) ?? undefined,
        assetsOverview: (doc.assetsOverview as unknown as AssetData[]) ?? undefined,
      },
    };
  } catch (err) {
    console.error("[getOrCreateWillDocument]", err);
    return { success: false, error: "Failed to load will document." };
  }
}

// ──────────────────────────────────────────
// Autosave a step
// ──────────────────────────────────────────

export async function saveWillStep(
  documentId: string,
  step: number,
  data: Partial<WillWizardState>
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const doc = await prisma.willDocument.findFirst({
      where: { id: documentId, userId: user.id },
    });
    if (!doc) return { success: false, error: "Document not found." };

    const updatePayload: Record<string, unknown> = {
      currentStep: Math.max(doc.currentStep, step),
    };

    if (data.state !== undefined) updatePayload.state = data.state;
    if (data.personalInfo) updatePayload.personalInfo = data.personalInfo;
    if (data.executorInfo) updatePayload.executorInfo = data.executorInfo;
    if (data.beneficiaries) updatePayload.beneficiaries = data.beneficiaries;
    if (data.guardianship) updatePayload.guardianship = data.guardianship;
    if (data.assetsOverview) updatePayload.assetsOverview = data.assetsOverview;

    await prisma.willDocument.update({
      where: { id: documentId },
      data: updatePayload,
    });

    // Non-blocking email on step save
    if (user.email) {
      sendDraftSavedEmail(user.email, user.name ?? "", step).catch(console.error);
    }

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[saveWillStep]", err);
    return { success: false, error: "Failed to save progress." };
  }
}

// ──────────────────────────────────────────
// Submit will for review / PDF generation
// ──────────────────────────────────────────

export async function submitWillDocument(
  documentId: string
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const doc = await prisma.willDocument.findFirst({
      where: { id: documentId, userId: user.id },
    });

    if (!doc) return { success: false, error: "Document not found." };
    if (doc.status !== "DRAFT") {
      return { success: false, error: "Document is already submitted." };
    }

    // Validate required steps are complete
    if (!doc.personalInfo || !doc.executorInfo || !doc.beneficiaries) {
      return {
        success: false,
        error: "Please complete all required steps before submitting.",
      };
    }

    await prisma.willDocument.update({
      where: { id: documentId },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[submitWillDocument]", err);
    return { success: false, error: "Failed to submit document." };
  }
}

// ──────────────────────────────────────────
// Generate PDF (called from API route)
// ──────────────────────────────────────────

export async function getWillDocumentForPDF(documentId: string) {
  const user = await requireAuth();
  return prisma.willDocument.findFirst({
    where: { id: documentId, userId: user.id },
  });
}

// ──────────────────────────────────────────
// Dashboard data fetch
// ──────────────────────────────────────────

export async function getDashboardData() {
  try {
    const user = await requireAuth();

    const [willDocuments, consultations, payments] = await Promise.all([
      prisma.willDocument.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        include: { attorneyReviewRequest: true },
      }),
      prisma.consultation.findMany({
        where: { userId: user.id },
        orderBy: { scheduledAt: "desc" },
      }),
      prisma.payment.findMany({
        where: { userId: user.id, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { success: true as const, data: { willDocuments, consultations, payments } };
  } catch (err) {
    console.error("[getDashboardData]", err);
    return { success: false as const, error: "Failed to load dashboard." };
  }
}
