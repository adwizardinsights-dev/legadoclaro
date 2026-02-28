import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";
import type {
  PersonalInfoData,
  ExecutorInfoData,
  BeneficiaryData,
  GuardianshipData,
  AssetData,
} from "@/types/will";
import { formatDate } from "@/lib/utils";

// ──────────────────────────────────────────
// Styles
// ──────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    paddingTop: 72,
    paddingBottom: 72,
    paddingHorizontal: 80,
    color: "#1a1a1a",
    lineHeight: 1.6,
  },
  watermark: {
    position: "absolute",
    top: 300,
    left: 80,
    right: 80,
    textAlign: "center",
    fontSize: 48,
    color: "#e0e0e0",
    transform: "rotate(-30deg)",
    fontFamily: "Times-Roman",
    opacity: 0.3,
  },
  header: {
    marginBottom: 32,
    borderBottomWidth: 2,
    borderBottomColor: "#1B2A4A",
    paddingBottom: 16,
    textAlign: "center",
  },
  title: {
    fontFamily: "Times-Bold",
    fontSize: 20,
    color: "#1B2A4A",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  draftBanner: {
    backgroundColor: "#FFF3CD",
    borderWidth: 1,
    borderColor: "#C9A84C",
    padding: 8,
    marginBottom: 24,
    textAlign: "center",
  },
  draftText: {
    fontSize: 10,
    color: "#856404",
    fontFamily: "Times-Bold",
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 13,
    color: "#1B2A4A",
    marginTop: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#C9A84C",
    paddingBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  clause: {
    marginBottom: 10,
    textAlign: "justify",
  },
  clauseLabel: {
    fontFamily: "Times-Bold",
    fontSize: 11,
  },
  field: {
    flexDirection: "row",
    marginBottom: 4,
  },
  fieldLabel: {
    width: 160,
    fontFamily: "Times-Bold",
    fontSize: 10,
    color: "#444",
  },
  fieldValue: {
    flex: 1,
    fontSize: 10,
  },
  beneficiaryRow: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginBottom: 6,
    borderRadius: 2,
  },
  signatureSection: {
    marginTop: 48,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 24,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 4,
    marginTop: 24,
    width: 280,
  },
  signatureLabel: {
    fontSize: 10,
    color: "#666",
  },
  disclaimer: {
    marginTop: 32,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 3,
    borderLeftColor: "#C9A84C",
    fontSize: 9,
    color: "#666",
    lineHeight: 1.5,
  },
  pageNumber: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: "#aaa",
  },
});

// ──────────────────────────────────────────
// Helper Components
// ──────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | null }) {
  return React.createElement(
    View,
    { style: styles.field },
    React.createElement(Text, { style: styles.fieldLabel }, label),
    React.createElement(Text, { style: styles.fieldValue }, value || "Not provided")
  );
}

// ──────────────────────────────────────────
// Main PDF Document
// ──────────────────────────────────────────

interface WillPDFProps {
  documentId: string;
  personalInfo: PersonalInfoData;
  executorInfo: ExecutorInfoData;
  beneficiaries: BeneficiaryData[];
  guardianship: GuardianshipData | null;
  assets: AssetData[];
  generatedAt: Date;
}

function WillPDFDocument({
  documentId,
  personalInfo,
  executorInfo,
  beneficiaries,
  guardianship,
  assets,
  generatedAt,
}: WillPDFProps) {
  const fullName = `${personalInfo.firstName} ${personalInfo.middleName ? personalInfo.middleName + " " : ""}${personalInfo.lastName}`.trim();

  return React.createElement(
    Document,
    { title: `Last Will and Testament — ${fullName}`, author: "LegadoClaro" },
    React.createElement(
      Page,
      { size: "LETTER", style: styles.page },

      // Draft watermark
      React.createElement(Text, { style: styles.watermark }, "DRAFT"),

      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, "Last Will and Testament"),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `of ${fullName} | Document ID: ${documentId}`
        ),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `Generated: ${formatDate(generatedAt)}`
        )
      ),

      // Draft Banner
      React.createElement(
        View,
        { style: styles.draftBanner },
        React.createElement(
          Text,
          { style: styles.draftText },
          "DRAFT — NOT LEGALLY VALID WITHOUT PROPER EXECUTION, WITNESSES, AND NOTARIZATION"
        )
      ),

      // Preamble
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.sectionTitle }, "Article I — Declaration"),
        React.createElement(
          Text,
          { style: styles.clause },
          `I, ${fullName}, residing at ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}, being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all former wills and codicils made by me.`
        )
      ),

      // Personal Information
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.sectionTitle }, "Article II — Testator Information"),
        React.createElement(Field, { label: "Full Legal Name:", value: fullName }),
        React.createElement(Field, { label: "Date of Birth:", value: personalInfo.dateOfBirth }),
        React.createElement(Field, { label: "Address:", value: `${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}` }),
        React.createElement(Field, { label: "Marital Status:", value: personalInfo.maritalStatus }),
        React.createElement(Field, { label: "Spouse/Partner:", value: personalInfo.spouseName }),
        React.createElement(Field, { label: "Children:", value: personalInfo.children?.map((c) => c.name).join(", ") || "None" })
      ),

      // Executor
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.sectionTitle }, "Article III — Appointment of Executor"),
        React.createElement(
          Text,
          { style: styles.clause },
          `I hereby appoint ${executorInfo.primaryExecutorName} as the Executor of this Will. If ${executorInfo.primaryExecutorName} is unable or unwilling to serve, I appoint ${executorInfo.alternateExecutorName || "no alternate designated"} as alternate Executor.`
        ),
        React.createElement(Field, { label: "Primary Executor:", value: executorInfo.primaryExecutorName }),
        React.createElement(Field, { label: "Relationship:", value: executorInfo.primaryExecutorRelationship }),
        React.createElement(Field, { label: "Contact:", value: executorInfo.primaryExecutorEmail }),
        executorInfo.alternateExecutorName
          ? React.createElement(Field, { label: "Alternate Executor:", value: executorInfo.alternateExecutorName })
          : null
      ),

      // Page number
      React.createElement(
        Text,
        {
          style: styles.pageNumber,
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Page ${pageNumber} of ${totalPages}`,
          fixed: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      )
    ),

    // Page 2 — Beneficiaries, Guardianship, Assets
    React.createElement(
      Page,
      { size: "LETTER", style: styles.page },

      React.createElement(Text, { style: styles.watermark }, "DRAFT"),

      // Beneficiaries
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.sectionTitle }, "Article IV — Distribution of Estate"),
        React.createElement(
          Text,
          { style: styles.clause },
          "I give, devise, and bequeath my estate as follows:"
        ),
        ...beneficiaries.map((b, i) =>
          React.createElement(
            View,
            { key: i, style: styles.beneficiaryRow },
            React.createElement(
              Text,
              { style: styles.clauseLabel },
              `${b.firstName} ${b.lastName} (${b.relationship})`
            ),
            React.createElement(
              Text,
              null,
              b.distributionType === "PERCENTAGE"
                ? `Receives ${b.percentage}% of the residuary estate`
                : `Specific bequest: ${b.specificGift}`
            ),
            React.createElement(Field, { label: "Contact:", value: b.email })
          )
        )
      ),

      // Guardianship
      guardianship && guardianship.guardianName
        ? React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.sectionTitle }, "Article V — Guardianship of Minor Children"),
            React.createElement(
              Text,
              { style: styles.clause },
              `I hereby nominate ${guardianship.guardianName} as guardian of the person and property of my minor children. If ${guardianship.guardianName} is unable to serve, I nominate ${guardianship.alternateGuardianName || "no alternate designated"} as alternate guardian.`
            ),
            React.createElement(Field, { label: "Primary Guardian:", value: guardianship.guardianName }),
            React.createElement(Field, { label: "Relationship:", value: guardianship.guardianRelationship }),
            guardianship.alternateGuardianName
              ? React.createElement(Field, { label: "Alternate Guardian:", value: guardianship.alternateGuardianName })
              : null
          )
        : null,

      // Assets
      assets.length > 0
        ? React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.sectionTitle }, "Article VI — Assets Overview"),
            ...assets.map((a, i) =>
              React.createElement(
                View,
                { key: i, style: styles.beneficiaryRow },
                React.createElement(Text, { style: styles.clauseLabel }, `${a.type.replace("_", " ")}: ${a.description}`),
                React.createElement(
                  Text,
                  null,
                  `Estimated Value: ${a.estimatedValue ? `$${a.estimatedValue.toLocaleString()}` : "Not specified"}`
                ),
                a.beneficiaryName
                  ? React.createElement(Text, null, `Designated to: ${a.beneficiaryName}`)
                  : null
              )
            )
          )
        : null,

      // Signature Section
      React.createElement(
        View,
        { style: styles.signatureSection },
        React.createElement(Text, { style: styles.sectionTitle }, "Execution"),
        React.createElement(
          Text,
          { style: styles.clause },
          `IN WITNESS WHEREOF, I, ${fullName}, have hereunto set my hand to this Last Will and Testament, consisting of ${2} pages, on the _____ day of _____________, 20____, declaring it to be my Last Will.`
        ),

        React.createElement(View, { style: styles.signatureLine }),
        React.createElement(Text, { style: styles.signatureLabel }, `${fullName} (Testator)`),

        React.createElement(
          Text,
          { style: { marginTop: 24, fontFamily: "Times-Bold", fontSize: 11 } },
          "Witness Attestation"
        ),
        React.createElement(
          Text,
          { style: styles.clause },
          "The foregoing instrument was subscribed and declared by the above-named Testator as their Last Will, in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses thereto."
        ),

        React.createElement(View, { style: styles.signatureLine }),
        React.createElement(Text, { style: styles.signatureLabel }, "Witness 1 — Name & Address"),

        React.createElement(View, { style: styles.signatureLine }),
        React.createElement(Text, { style: styles.signatureLabel }, "Witness 2 — Name & Address")
      ),

      // Disclaimer
      React.createElement(
        View,
        { style: styles.disclaimer },
        React.createElement(
          Text,
          null,
          "IMPORTANT LEGAL NOTICE: This document is a draft generated by LegadoClaro for informational and planning purposes only. It is NOT a legally executed will. To be valid, this document must be signed by the testator in the presence of two witnesses and, depending on your state, a notary public. This platform does not replace independent legal advice. LegadoClaro strongly recommends having this document reviewed by a licensed attorney in your jurisdiction before execution."
        )
      ),

      React.createElement(
        Text,
        {
          style: styles.pageNumber,
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Page ${pageNumber} of ${totalPages}`,
          fixed: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      )
    )
  );
}

// ──────────────────────────────────────────
// Export Function
// ──────────────────────────────────────────

export async function generateWillPDF(props: WillPDFProps): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(WillPDFDocument, props) as any;
  return await renderToBuffer(element);
}
