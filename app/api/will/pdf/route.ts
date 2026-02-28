import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWillPDF } from "@/lib/pdf";
import type {
  PersonalInfoData,
  ExecutorInfoData,
  BeneficiaryData,
  GuardianshipData,
  AssetData,
} from "@/types/will";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documentId = request.nextUrl.searchParams.get("documentId");
  if (!documentId) {
    return NextResponse.json({ error: "documentId required" }, { status: 400 });
  }

  const doc = await prisma.willDocument.findFirst({
    where: { id: documentId, userId: session.user.id },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!doc.personalInfo || !doc.executorInfo) {
    return NextResponse.json(
      { error: "Document is incomplete. Please finish the wizard first." },
      { status: 422 }
    );
  }

  try {
    const pdfBuffer = await generateWillPDF({
      documentId: doc.id,
      personalInfo: doc.personalInfo as unknown as PersonalInfoData,
      executorInfo: doc.executorInfo as unknown as ExecutorInfoData,
      beneficiaries: (doc.beneficiaries as unknown as BeneficiaryData[]) ?? [],
      guardianship: (doc.guardianship as unknown as GuardianshipData) ?? null,
      assets: (doc.assetsOverview as unknown as AssetData[]) ?? [],
      generatedAt: new Date(),
    });

    const personalInfo = doc.personalInfo as unknown as PersonalInfoData;
    const fileName = `LegadoClaro_Will_${personalInfo.lastName}_${personalInfo.firstName}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Convert Buffer to Uint8Array for the Web Streams API used by Next.js
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[PDF Generation Error]", err);
    return NextResponse.json(
      { error: "Failed to generate PDF. Please try again." },
      { status: 500 }
    );
  }
}
