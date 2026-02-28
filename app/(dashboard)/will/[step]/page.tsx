import { notFound, redirect } from "next/navigation";
import { getOrCreateWillDocument } from "@/actions/will";
import WizardLayout from "@/components/will/wizard-layout";
import Step1Personal from "@/components/will/steps/step-1-personal";
import Step2Executor from "@/components/will/steps/step-2-executor";
import Step3Beneficiaries from "@/components/will/steps/step-3-beneficiaries";
import Step4Guardianship from "@/components/will/steps/step-4-guardianship";
import Step5Assets from "@/components/will/steps/step-5-assets";
import Step6Review from "@/components/will/steps/step-6-review";

const TOTAL_STEPS = 6;

export async function generateMetadata({ params }: { params: { step: string } }) {
  const stepNum = parseInt(params.step);
  const titles: Record<number, string> = {
    1: "Personal Information",
    2: "Executor Selection",
    3: "Beneficiaries",
    4: "Guardianship",
    5: "Assets Overview",
    6: "Final Review",
  };
  return { title: `Will Wizard — Step ${stepNum}: ${titles[stepNum] ?? ""}` };
}

export default async function WillStepPage({
  params,
}: {
  params: { step: string };
}) {
  const stepNum = parseInt(params.step);

  if (isNaN(stepNum) || stepNum < 1 || stepNum > TOTAL_STEPS) {
    notFound();
  }

  const result = await getOrCreateWillDocument();
  if (!result.success) redirect("/dashboard");

  const { data: willState } = result;

  // Prevent skipping steps
  if (stepNum > willState.currentStep + 1) {
    redirect(`/will/${willState.currentStep}`);
  }

  // Completed wills can't be re-edited via wizard
  // (they can be edited from the review page still)

  const stepComponent = {
    1: <Step1Personal documentId={willState.documentId} defaultValues={willState.personalInfo} defaultState={willState.state} />,
    2: <Step2Executor documentId={willState.documentId} defaultValues={willState.executorInfo} />,
    3: <Step3Beneficiaries documentId={willState.documentId} defaultValues={willState.beneficiaries} />,
    4: <Step4Guardianship documentId={willState.documentId} defaultValues={willState.guardianship} hasMinors={willState.personalInfo?.children?.some((c) => c.isMinor) ?? false} />,
    5: <Step5Assets documentId={willState.documentId} defaultValues={willState.assetsOverview} />,
    6: <Step6Review documentId={willState.documentId} willState={willState} />,
  }[stepNum];

  return (
    <WizardLayout currentStep={stepNum} totalSteps={TOTAL_STEPS} documentId={willState.documentId}>
      {stepComponent}
    </WizardLayout>
  );
}
