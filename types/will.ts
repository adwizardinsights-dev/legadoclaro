// ──────────────────────────────────────────
// Will Wizard Step Data Types
// ──────────────────────────────────────────

export type MaritalStatus =
  | "SINGLE"
  | "MARRIED"
  | "DIVORCED"
  | "WIDOWED"
  | "DOMESTIC_PARTNERSHIP";

export interface ChildData {
  name: string;
  dateOfBirth?: string;
  isMinor: boolean;
}

export interface PersonalInfoData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  maritalStatus: MaritalStatus;
  spouseName?: string;
  children: ChildData[];
}

export interface ExecutorInfoData {
  primaryExecutorName: string;
  primaryExecutorRelationship: string;
  primaryExecutorEmail: string;
  primaryExecutorPhone?: string;
  alternateExecutorName?: string;
  alternateExecutorRelationship?: string;
  alternateExecutorEmail?: string;
}

export type DistributionType = "PERCENTAGE" | "SPECIFIC_GIFT";

export interface BeneficiaryData {
  id: string; // client-side UUID for keying
  firstName: string;
  lastName: string;
  relationship: string;
  email?: string;
  distributionType: DistributionType;
  percentage?: number;
  specificGift?: string;
}

export interface GuardianshipData {
  guardianName: string;
  guardianRelationship: string;
  guardianEmail?: string;
  alternateGuardianName?: string;
  alternateGuardianRelationship?: string;
}

export type AssetType =
  | "REAL_ESTATE"
  | "BANK_ACCOUNT"
  | "INVESTMENT"
  | "DIGITAL_ASSET"
  | "VEHICLE"
  | "PERSONAL_PROPERTY"
  | "OTHER";

export interface AssetData {
  id: string;
  type: AssetType;
  description: string;
  estimatedValue?: number;
  location?: string;
  beneficiaryName?: string; // who this specific asset goes to
  notes?: string;
}

// ──────────────────────────────────────────
// Full Will Wizard State
// ──────────────────────────────────────────

export interface WillWizardState {
  documentId: string;
  currentStep: number;
  state?: string; // US state
  personalInfo?: PersonalInfoData;
  executorInfo?: ExecutorInfoData;
  beneficiaries?: BeneficiaryData[];
  guardianship?: GuardianshipData;
  assetsOverview?: AssetData[];
  confirmedAccurate?: boolean;
}

// ──────────────────────────────────────────
// Server Action Results
// ──────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
