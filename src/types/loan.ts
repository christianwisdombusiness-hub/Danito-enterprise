export type BorrowerType = 'individual' | 'business';

export interface Borrower {
  id: string;
  name: string;
  type: BorrowerType;
  email: string;
  phone: string;
  nationalId: string;
  businessName?: string;
  taxId?: string;
  creditScore: number;
  monthlyIncome: number;
  employmentStatus: 'employed' | 'self_employed' | 'business_owner' | 'contractor';
  employerName?: string;
  avatarUrl?: string;
  address: string;
  registeredAt: string;
  kycStatus: 'verified' | 'pending' | 'review_required';
  notes?: string;
}

export type InterestType = 'amortized_reducing' | 'flat_rate' | 'balloon_repayment';
export type RepaymentFrequency = 'monthly' | 'bi-weekly' | 'weekly';

export interface LoanProduct {
  id: string;
  name: string;
  code: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  defaultInterestRate: number; // Annual %
  minTermMonths: number;
  maxTermMonths: number;
  interestType: InterestType;
  processingFeePercent: number;
  latePenaltyRatePercent: number;
  collateralRequired: boolean;
}

export type LoanStatus = 
  | 'active'
  | 'in_arrears'
  | 'fully_paid'
  | 'under_review'
  | 'approved'
  | 'defaulted'
  | 'closed';

export type RiskGrade = 'A' | 'B' | 'C' | 'D'; // A: Low, B: Moderate, C: High, D: Speculative

export interface CollateralInfo {
  type: 'Real Estate' | 'Vehicle' | 'Machinery' | 'Inventory' | 'Securities' | 'Other';
  description: string;
  appraisedValue: number;
  documentRef: string;
  lienHolder: string;
}

export interface GuarantorInfo {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  annualIncome: number;
  nationalId: string;
}

export interface AmortizationInstallment {
  installmentNumber: number;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  totalInstallment: number;
  remainingPrincipal: number;
  paidAmount: number;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  lateFee: number;
}

export interface CollectionNote {
  id: string;
  date: string;
  officer: string;
  type: 'phone_call' | 'formal_notice' | 'in_person_visit' | 'promise_to_pay' | 'restructure_discussion';
  details: string;
  promisedPaymentDate?: string;
  promisedAmount?: number;
}

export interface Loan {
  id: string; // e.g. DE-2026-081
  borrowerId: string;
  borrowerName: string;
  productId: string;
  productName: string;
  principal: number;
  interestRate: number; // Annual APR %
  termMonths: number;
  repaymentFrequency: RepaymentFrequency;
  interestType: InterestType;
  disbursementDate: string;
  firstPaymentDate: string;
  maturityDate: string;
  status: LoanStatus;
  riskGrade: RiskGrade;
  purpose: string;
  collateral?: CollateralInfo;
  guarantor?: GuarantorInfo;
  processingFee: number;
  totalInterest: number;
  totalPayable: number;
  monthlyInstallment: number;
  totalPaid: number;
  remainingBalance: number;
  nextDueDate: string;
  overdueAmount: number;
  daysInArrears: number;
  underwriterNotes?: string;
  approvedBy?: string;
  disbursedBy?: string;
  schedule: AmortizationInstallment[];
  collectionNotes?: CollectionNote[];
}

export type PaymentMethod = 
  | 'bank_transfer'
  | 'direct_debit'
  | 'card'
  | 'cash'
  | 'mobile_money'
  | 'check';

export interface RepaymentTransaction {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  paymentDate: string;
  amount: number;
  principalPortion: number;
  interestPortion: number;
  penaltyPortion: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  processedBy: string;
  notes?: string;
  status: 'completed' | 'flagged' | 'reversed';
}

export interface EnterpriseSettings {
  enterpriseName: string;
  tagline: string;
  currencySymbol: string;
  currencyCode: string;
  registrationNumber: string;
  taxNumber: string;
  address: string;
  phone: string;
  email: string;
  authorizedSignatory: string;
  signatoryTitle: string;
  defaultLateGraceDays: number;
}
