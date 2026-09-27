import { Borrower, EnterpriseSettings, Loan, LoanProduct, RepaymentTransaction } from '../types/loan';
import { generateAmortizationSchedule } from '../utils/financial';

import logoPath from '../assets/images/danitos_logo_1790533733957.jpg';
import avatarSarah from '../assets/images/borrower_sarah_1790533747680.jpg';
import avatarMarcus from '../assets/images/borrower_marcus_1790533757769.jpg';

export { logoPath, avatarSarah, avatarMarcus };

export const defaultEnterpriseSettings: EnterpriseSettings = {
  enterpriseName: "Danito's Enterprise",
  tagline: "Commercial Lending & Enterprise Portfolio Management",
  currencySymbol: "$",
  currencyCode: "USD",
  registrationNumber: "DE-FIN-2024-99814",
  taxNumber: "US-EIN-94-8271049",
  address: "450 Financial Boulevard, Suite 1200, Metro Financial Center",
  phone: "+1 (800) 555-3264",
  email: "servicing@danitosenterprise.com",
  authorizedSignatory: "Danito Vance",
  signatoryTitle: "Chief Credit Officer & Managing Principal",
  defaultLateGraceDays: 5,
};

export const defaultLoanProducts: LoanProduct[] = [
  {
    id: 'prod-sme-working-capital',
    name: 'SME Working Capital',
    code: 'SWC-01',
    description: 'Short to medium term liquidity financing for operational cashflow, inventory, and supplier payments.',
    minAmount: 10000,
    maxAmount: 250000,
    defaultInterestRate: 11.5,
    minTermMonths: 6,
    maxTermMonths: 36,
    interestType: 'amortized_reducing',
    processingFeePercent: 1.5,
    latePenaltyRatePercent: 3.0,
    collateralRequired: true,
  },
  {
    id: 'prod-asset-financing',
    name: 'Equipment & Asset Financing',
    code: 'EAF-02',
    description: 'Secured term facility to acquire commercial machinery, vehicles, and technology infrastructure.',
    minAmount: 25000,
    maxAmount: 500000,
    defaultInterestRate: 9.8,
    minTermMonths: 12,
    maxTermMonths: 60,
    interestType: 'amortized_reducing',
    processingFeePercent: 1.25,
    latePenaltyRatePercent: 2.5,
    collateralRequired: true,
  },
  {
    id: 'prod-micro-business',
    name: 'Micro-Enterprise Growth Boost',
    code: 'MEG-03',
    description: 'Agile fast-track microloan for sole proprietorships and retail operators with flexible terms.',
    minAmount: 2000,
    maxAmount: 25000,
    defaultInterestRate: 14.0,
    minTermMonths: 3,
    maxTermMonths: 18,
    interestType: 'amortized_reducing',
    processingFeePercent: 2.0,
    latePenaltyRatePercent: 4.0,
    collateralRequired: false,
  },
  {
    id: 'prod-invoice-discounting',
    name: 'Invoice Factoring & Discounting',
    code: 'IFD-04',
    description: 'Immediate advances against verified corporate accounts receivable invoices up to 85% face value.',
    minAmount: 15000,
    maxAmount: 350000,
    defaultInterestRate: 8.5,
    minTermMonths: 2,
    maxTermMonths: 12,
    interestType: 'flat_rate',
    processingFeePercent: 1.0,
    latePenaltyRatePercent: 2.0,
    collateralRequired: true,
  },
  {
    id: 'prod-commercial-bridge',
    name: 'Commercial Real Estate Bridge',
    code: 'CRE-05',
    description: 'Interim financing for commercial property acquisition, warehouse buildout, or facility retrofits.',
    minAmount: 50000,
    maxAmount: 1000000,
    defaultInterestRate: 10.2,
    minTermMonths: 12,
    maxTermMonths: 84,
    interestType: 'amortized_reducing',
    processingFeePercent: 1.5,
    latePenaltyRatePercent: 3.5,
    collateralRequired: true,
  },
  {
    id: 'prod-executive-personal',
    name: 'Executive & Professional Credit',
    code: 'EPC-06',
    description: 'Unsecured structured personal lines for qualified business executives and licensed professionals.',
    minAmount: 5000,
    maxAmount: 75000,
    defaultInterestRate: 13.0,
    minTermMonths: 6,
    maxTermMonths: 36,
    interestType: 'amortized_reducing',
    processingFeePercent: 1.75,
    latePenaltyRatePercent: 3.0,
    collateralRequired: false,
  },
];

export const defaultBorrowers: Borrower[] = [
  {
    id: 'bor-001',
    name: 'Sarah Jenkins',
    type: 'business',
    businessName: 'Apex Cold-Chain Logistics LLC',
    email: 's.jenkins@apexlogistics.io',
    phone: '+1 (555) 349-2184',
    nationalId: 'US-DL-9821441',
    taxId: 'XX-7489201',
    creditScore: 785,
    monthlyIncome: 38500,
    employmentStatus: 'business_owner',
    employerName: 'Apex Cold-Chain Logistics LLC',
    avatarUrl: avatarSarah,
    address: '1420 Harbor Industrial Parkway, Dock 14, Chicago, IL',
    registeredAt: '2024-03-15',
    kycStatus: 'verified',
    notes: 'Long-standing corporate client with 4 successfully retired facilities. Flawless on-time payment track record.',
  },
  {
    id: 'bor-002',
    name: 'Marcus Adebayo',
    type: 'business',
    businessName: 'Nexus Solar & Microgrid Systems',
    email: 'm.adebayo@nexussolar.com',
    phone: '+1 (555) 892-4412',
    nationalId: 'US-DL-4129983',
    taxId: 'XX-3918204',
    creditScore: 742,
    monthlyIncome: 29000,
    employmentStatus: 'business_owner',
    employerName: 'Nexus Solar & Microgrid Systems',
    avatarUrl: avatarMarcus,
    address: '880 Clean Energy Blvd, Austin, TX',
    registeredAt: '2024-08-10',
    kycStatus: 'verified',
    notes: 'Renewable energy engineering contractor with guaranteed municipal utility purchase orders.',
  },
  {
    id: 'bor-003',
    name: 'Dr. Elena Rostova',
    type: 'business',
    businessName: 'BrightPath Diagnostics & Medical Clinic',
    email: 'elena@brightpathclinics.org',
    phone: '+1 (555) 723-9910',
    nationalId: 'US-MD-881203',
    taxId: 'XX-5582910',
    creditScore: 810,
    monthlyIncome: 52000,
    employmentStatus: 'business_owner',
    employerName: 'BrightPath Diagnostics',
    address: '320 Medical Center Dr, Suite 400, Boston, MA',
    registeredAt: '2023-11-20',
    kycStatus: 'verified',
    notes: 'Healthcare multi-suite practice expanding radiological imaging equipment.',
  },
  {
    id: 'bor-004',
    name: 'David Chen',
    type: 'business',
    businessName: 'Chen Artisan Roastery & Coffee Labs',
    email: 'd.chen@chenroasters.com',
    phone: '+1 (555) 601-3829',
    nationalId: 'US-DL-3810294',
    taxId: 'XX-1982740',
    creditScore: 660,
    monthlyIncome: 14200,
    employmentStatus: 'business_owner',
    employerName: 'Chen Artisan Roastery',
    address: '55 Warehouse District Alley, Seattle, WA',
    registeredAt: '2025-01-14',
    kycStatus: 'verified',
    notes: 'Coffee wholesale distributor currently experiencing seasonal accounts receivable payment delays.',
  },
  {
    id: 'bor-005',
    name: 'Amara Kalu',
    type: 'individual',
    email: 'amara.kalu@fintechpartners.net',
    phone: '+1 (555) 449-1123',
    nationalId: 'US-PASSPORT-K98214',
    creditScore: 760,
    monthlyIncome: 18500,
    employmentStatus: 'employed',
    employerName: 'Beacon Cloud Systems Inc',
    address: '710 Skyline Terrace, Apt 19B, San Francisco, CA',
    registeredAt: '2025-04-18',
    kycStatus: 'verified',
    notes: 'Senior VP of Engineering seeking short-term capital for professional investment portfolio expansion.',
  },
  {
    id: 'bor-006',
    name: 'Carlos Mendoza',
    type: 'business',
    businessName: 'Vanguard Precision Fabrication Ltd',
    email: 'cmendoza@vanguardprecision.com',
    phone: '+1 (555) 231-7789',
    nationalId: 'US-DL-1994821',
    taxId: 'XX-9018472',
    creditScore: 618,
    monthlyIncome: 21500,
    employmentStatus: 'business_owner',
    employerName: 'Vanguard Precision Fabrication',
    address: '10 Industrial Beltway Way, Detroit, MI',
    registeredAt: '2024-09-02',
    kycStatus: 'verified',
    notes: 'CNC manufacturing shop. Facing supply-chain transition. Under collection review for past due cycle.',
  },
  {
    id: 'bor-007',
    name: 'Lillian Ward',
    type: 'individual',
    email: 'lillian.ward@wardarchitects.com',
    phone: '+1 (555) 918-3304',
    nationalId: 'US-DL-7729104',
    creditScore: 735,
    monthlyIncome: 12800,
    employmentStatus: 'self_employed',
    employerName: 'Ward Studio Architecture',
    address: '404 Birch Street, Portland, OR',
    registeredAt: '2025-06-11',
    kycStatus: 'verified',
    notes: 'Principal architect funding CAD 3D workstation upgrades and license renewals.',
  },
  {
    id: 'bor-008',
    name: 'Tariq Al-Mansoor',
    type: 'business',
    businessName: 'Oasis Wholesale Produce & Grocers',
    email: 'tariq@oasisproduce.net',
    phone: '+1 (555) 882-9901',
    nationalId: 'US-DL-5529183',
    taxId: 'XX-4820194',
    creditScore: 695,
    monthlyIncome: 34000,
    employmentStatus: 'business_owner',
    employerName: 'Oasis Wholesale Produce',
    address: '1900 Market Wholesale Terminal, Atlanta, GA',
    registeredAt: '2025-08-22',
    kycStatus: 'verified',
    notes: 'Regional fresh produce distributor servicing 45 restaurants and supermarkets.',
  },
];

// Helper to construct realistic initial loans with amortized schedules
export function generateSeedLoans(): Loan[] {
  // Loan 1: Sarah Jenkins - Equipment Financing (Active, good standing)
  const l1Calculations = generateAmortizationSchedule(120000, 9.8, 36, '2025-03-01', 'amortized_reducing', 'monthly');
  // Mark first 6 installments as paid
  let l1Paid = 0;
  l1Calculations.schedule.forEach((inst, idx) => {
    if (idx < 6) {
      inst.status = 'paid';
      inst.paidAmount = inst.totalInstallment;
      inst.paidDate = inst.dueDate;
      l1Paid += inst.totalInstallment;
    } else if (idx === 6) {
      inst.status = 'pending';
    }
  });

  const loan1: Loan = {
    id: 'DE-2025-014',
    borrowerId: 'bor-001',
    borrowerName: 'Sarah Jenkins (Apex Cold-Chain Logistics LLC)',
    productId: 'prod-asset-financing',
    productName: 'Equipment & Asset Financing',
    principal: 120000,
    interestRate: 9.8,
    termMonths: 36,
    repaymentFrequency: 'monthly',
    interestType: 'amortized_reducing',
    disbursementDate: '2025-03-01',
    firstPaymentDate: '2025-04-01',
    maturityDate: '2028-03-01',
    status: 'active',
    riskGrade: 'A',
    purpose: 'Acquisition of two Carrier Transicold refrigerated semi-trailers',
    collateral: {
      type: 'Vehicle',
      description: '2x 2024 Great Dane 53ft Reefer Semi-Trailers (VIN 1GRAA0625P1982)',
      appraisedValue: 185000,
      documentRef: 'DOT-TIT-99182',
      lienHolder: "Danito's Enterprise",
    },
    guarantor: {
      name: 'Robert Jenkins',
      relationship: 'Managing Partner / Spouse',
      phone: '+1 (555) 349-2185',
      email: 'r.jenkins@apexlogistics.io',
      annualIncome: 140000,
      nationalId: 'US-DL-9821442',
    },
    processingFee: 1500,
    totalInterest: l1Calculations.totalInterest,
    totalPayable: l1Calculations.totalPayable,
    monthlyInstallment: l1Calculations.periodicInstallment,
    totalPaid: Math.round(l1Paid * 100) / 100,
    remainingBalance: Math.round((l1Calculations.totalPayable - l1Paid) * 100) / 100,
    nextDueDate: l1Calculations.schedule[6].dueDate,
    overdueAmount: 0,
    daysInArrears: 0,
    underwriterNotes: 'Strong corporate cash flows, audited statements provided, clear collateral title.',
    approvedBy: 'Danito Vance (CCO)',
    disbursedBy: 'Operations Treasury Desk',
    schedule: l1Calculations.schedule,
    collectionNotes: [],
  };

  // Loan 2: Marcus Adebayo - Working Capital (Active)
  const l2Calculations = generateAmortizationSchedule(75000, 11.5, 24, '2025-06-15', 'amortized_reducing', 'monthly');
  let l2Paid = 0;
  l2Calculations.schedule.forEach((inst, idx) => {
    if (idx < 3) {
      inst.status = 'paid';
      inst.paidAmount = inst.totalInstallment;
      inst.paidDate = inst.dueDate;
      l2Paid += inst.totalInstallment;
    }
  });

  const loan2: Loan = {
    id: 'DE-2025-042',
    borrowerId: 'bor-002',
    borrowerName: 'Marcus Adebayo (Nexus Solar & Microgrid Systems)',
    productId: 'prod-sme-working-capital',
    productName: 'SME Working Capital',
    principal: 75000,
    interestRate: 11.5,
    termMonths: 24,
    repaymentFrequency: 'monthly',
    interestType: 'amortized_reducing',
    disbursementDate: '2025-06-15',
    firstPaymentDate: '2025-07-15',
    maturityDate: '2027-06-15',
    status: 'active',
    riskGrade: 'A',
    purpose: 'Bulk purchase of Tier-1 solar photovoltaic inverters and battery packs for municipal contract',
    collateral: {
      type: 'Inventory',
      description: 'Solar Edge & Enphase commercial inverter inventory located at Warehouse Bay 4',
      appraisedValue: 110000,
      documentRef: 'UCC-1-TX-849201',
      lienHolder: "Danito's Enterprise",
    },
    processingFee: 1125,
    totalInterest: l2Calculations.totalInterest,
    totalPayable: l2Calculations.totalPayable,
    monthlyInstallment: l2Calculations.periodicInstallment,
    totalPaid: Math.round(l2Paid * 100) / 100,
    remainingBalance: Math.round((l2Calculations.totalPayable - l2Paid) * 100) / 100,
    nextDueDate: l2Calculations.schedule[3].dueDate,
    overdueAmount: 0,
    daysInArrears: 0,
    underwriterNotes: 'Verified municipal purchase orders with City of Austin Public Works.',
    approvedBy: 'Danito Vance (CCO)',
    schedule: l2Calculations.schedule,
    collectionNotes: [],
  };

  // Loan 3: Carlos Mendoza - Vanguard Precision (In Arrears - 34 days overdue)
  const l3Calculations = generateAmortizationSchedule(85000, 12.0, 36, '2024-11-01', 'amortized_reducing', 'monthly');
  let l3Paid = 0;
  l3Calculations.schedule.forEach((inst, idx) => {
    if (idx < 9) {
      inst.status = 'paid';
      inst.paidAmount = inst.totalInstallment;
      inst.paidDate = inst.dueDate;
      l3Paid += inst.totalInstallment;
    } else if (idx === 9) {
      inst.status = 'overdue';
      inst.lateFee = 150;
    } else if (idx === 10) {
      inst.status = 'pending';
    }
  });

  const overdueInst = l3Calculations.schedule[9];
  const overdueAmt = overdueInst.totalInstallment + overdueInst.lateFee;

  const loan3: Loan = {
    id: 'DE-2024-098',
    borrowerId: 'bor-006',
    borrowerName: 'Carlos Mendoza (Vanguard Precision Fabrication Ltd)',
    productId: 'prod-asset-financing',
    productName: 'Equipment & Asset Financing',
    principal: 85000,
    interestRate: 12.0,
    termMonths: 36,
    repaymentFrequency: 'monthly',
    interestType: 'amortized_reducing',
    disbursementDate: '2024-11-01',
    firstPaymentDate: '2024-12-01',
    maturityDate: '2027-11-01',
    status: 'in_arrears',
    riskGrade: 'C',
    purpose: 'Haas VF-4SS CNC 5-Axis Vertical Machining Center',
    collateral: {
      type: 'Machinery',
      description: 'Haas VF-4SS CNC Machine Serial # HAAS-2024-VF4-8812',
      appraisedValue: 95000,
      documentRef: 'UCC-1-MI-772910',
      lienHolder: "Danito's Enterprise",
    },
    processingFee: 1062.5,
    totalInterest: l3Calculations.totalInterest,
    totalPayable: l3Calculations.totalPayable,
    monthlyInstallment: l3Calculations.periodicInstallment,
    totalPaid: Math.round(l3Paid * 100) / 100,
    remainingBalance: Math.round((l3Calculations.totalPayable - l3Paid) * 100) / 100,
    nextDueDate: overdueInst.dueDate,
    overdueAmount: Math.round(overdueAmt * 100) / 100,
    daysInArrears: 34,
    underwriterNotes: 'Industrial manufacturing facility. Retains strong equipment liquidation backstop.',
    approvedBy: 'Danito Vance (CCO)',
    schedule: l3Calculations.schedule,
    collectionNotes: [
      {
        id: 'cn-01',
        date: '2026-09-18',
        officer: 'Marcus Wright (Collections)',
        type: 'phone_call',
        details: 'Spoke with CFO Carlos Mendoza. Delay caused by deferred OEM invoice clearing. Promised payment within 10 days.',
        promisedPaymentDate: '2026-09-28',
        promisedAmount: overdueAmt,
      },
      {
        id: 'cn-02',
        date: '2026-09-08',
        officer: 'Automated Servicing Engine',
        type: 'formal_notice',
        details: 'First formal Notice of Arrears and late fee assessment transmitted via certified electronic delivery.',
      }
    ],
  };

  // Loan 4: David Chen - Chen Artisan Roastery (In Arrears - 18 days overdue)
  const l4Calculations = generateAmortizationSchedule(35000, 13.5, 18, '2025-02-15', 'amortized_reducing', 'monthly');
  let l4Paid = 0;
  l4Calculations.schedule.forEach((inst, idx) => {
    if (idx < 5) {
      inst.status = 'paid';
      inst.paidAmount = inst.totalInstallment;
      inst.paidDate = inst.dueDate;
      l4Paid += inst.totalInstallment;
    } else if (idx === 5) {
      inst.status = 'overdue';
      inst.lateFee = 85;
    }
  });

  const loan4: Loan = {
    id: 'DE-2025-031',
    borrowerId: 'bor-004',
    borrowerName: 'David Chen (Chen Artisan Roastery & Coffee Labs)',
    productId: 'prod-sme-working-capital',
    productName: 'SME Working Capital',
    principal: 35000,
    interestRate: 13.5,
    termMonths: 18,
    repaymentFrequency: 'monthly',
    interestType: 'amortized_reducing',
    disbursementDate: '2025-02-15',
    firstPaymentDate: '2025-03-15',
    maturityDate: '2026-08-15',
    status: 'in_arrears',
    riskGrade: 'B',
    purpose: 'Green coffee bean container import financing and retail packaging run',
    processingFee: 525,
    totalInterest: l4Calculations.totalInterest,
    totalPayable: l4Calculations.totalPayable,
    monthlyInstallment: l4Calculations.periodicInstallment,
    totalPaid: Math.round(l4Paid * 100) / 100,
    remainingBalance: Math.round((l4Calculations.totalPayable - l4Paid) * 100) / 100,
    nextDueDate: l4Calculations.schedule[5].dueDate,
    overdueAmount: Math.round((l4Calculations.schedule[5].totalInstallment + 85) * 100) / 100,
    daysInArrears: 18,
    schedule: l4Calculations.schedule,
    collectionNotes: [
      {
        id: 'cn-03',
        date: '2026-09-22',
        officer: 'Marcus Wright (Collections)',
        type: 'phone_call',
        details: 'Borrower confirmed that accounts receivable from regional grocery chain will settle on October 1st.',
        promisedPaymentDate: '2026-10-01',
        promisedAmount: 2200,
      }
    ],
  };

  // Loan 5: Dr. Elena Rostova - Commercial Real Estate Bridge (Active, large)
  const l5Calculations = generateAmortizationSchedule(350000, 9.5, 60, '2024-05-01', 'amortized_reducing', 'monthly');
  let l5Paid = 0;
  l5Calculations.schedule.forEach((inst, idx) => {
    if (idx < 16) {
      inst.status = 'paid';
      inst.paidAmount = inst.totalInstallment;
      inst.paidDate = inst.dueDate;
      l5Paid += inst.totalInstallment;
    }
  });

  const loan5: Loan = {
    id: 'DE-2024-039',
    borrowerId: 'bor-003',
    borrowerName: 'Dr. Elena Rostova (BrightPath Diagnostics & Medical Clinic)',
    productId: 'prod-commercial-bridge',
    productName: 'Commercial Real Estate Bridge',
    principal: 350000,
    interestRate: 9.5,
    termMonths: 60,
    repaymentFrequency: 'monthly',
    interestType: 'amortized_reducing',
    disbursementDate: '2024-05-01',
    firstPaymentDate: '2024-06-01',
    maturityDate: '2029-05-01',
    status: 'active',
    riskGrade: 'A',
    purpose: 'Medical building floor expansion and MRI magnetic shielding renovation',
    collateral: {
      type: 'Real Estate',
      description: 'Commercial Condominium Suites 401-404, Boston Medical Center Square',
      appraisedValue: 680000,
      documentRef: 'SUFFOLK-DEED-BK-9182-PG-110',
      lienHolder: "Danito's Enterprise (First Mortgagee)",
    },
    processingFee: 5250,
    totalInterest: l5Calculations.totalInterest,
    totalPayable: l5Calculations.totalPayable,
    monthlyInstallment: l5Calculations.periodicInstallment,
    totalPaid: Math.round(l5Paid * 100) / 100,
    remainingBalance: Math.round((l5Calculations.totalPayable - l5Paid) * 100) / 100,
    nextDueDate: l5Calculations.schedule[16].dueDate,
    overdueAmount: 0,
    daysInArrears: 0,
    approvedBy: 'Danito Vance (CCO)',
    schedule: l5Calculations.schedule,
    collectionNotes: [],
  };

  // Loan 6: Amara Kalu - Executive Personal Credit (Active)
  const l6Calculations = generateAmortizationSchedule(40000, 12.5, 24, '2025-05-01', 'amortized_reducing', 'monthly');
  let l6Paid = 0;
  l6Calculations.schedule.forEach((inst, idx) => {
    if (idx < 4) {
      inst.status = 'paid';
      inst.paidAmount = inst.totalInstallment;
      inst.paidDate = inst.dueDate;
      l6Paid += inst.totalInstallment;
    }
  });

  const loan6: Loan = {
    id: 'DE-2025-055',
    borrowerId: 'bor-005',
    borrowerName: 'Amara Kalu',
    productId: 'prod-executive-personal',
    productName: 'Executive & Professional Credit',
    principal: 40000,
    interestRate: 12.5,
    termMonths: 24,
    repaymentFrequency: 'monthly',
    interestType: 'amortized_reducing',
    disbursementDate: '2025-05-01',
    firstPaymentDate: '2025-06-01',
    maturityDate: '2027-05-01',
    status: 'active',
    riskGrade: 'A',
    purpose: 'Portfolio liquidity financing',
    processingFee: 700,
    totalInterest: l6Calculations.totalInterest,
    totalPayable: l6Calculations.totalPayable,
    monthlyInstallment: l6Calculations.periodicInstallment,
    totalPaid: Math.round(l6Paid * 100) / 100,
    remainingBalance: Math.round((l6Calculations.totalPayable - l6Paid) * 100) / 100,
    nextDueDate: l6Calculations.schedule[4].dueDate,
    overdueAmount: 0,
    daysInArrears: 0,
    schedule: l6Calculations.schedule,
  };

  // Loan 7: Tariq Al-Mansoor - Produce Factoring (Fully Paid)
  const l7Calculations = generateAmortizationSchedule(60000, 8.5, 6, '2025-01-01', 'flat_rate', 'monthly');
  l7Calculations.schedule.forEach((inst) => {
    inst.status = 'paid';
    inst.paidAmount = inst.totalInstallment;
    inst.paidDate = inst.dueDate;
  });

  const loan7: Loan = {
    id: 'DE-2025-003',
    borrowerId: 'bor-008',
    borrowerName: 'Tariq Al-Mansoor (Oasis Wholesale Produce & Grocers)',
    productId: 'prod-invoice-discounting',
    productName: 'Invoice Factoring & Discounting',
    principal: 60000,
    interestRate: 8.5,
    termMonths: 6,
    repaymentFrequency: 'monthly',
    interestType: 'flat_rate',
    disbursementDate: '2025-01-01',
    firstPaymentDate: '2025-02-01',
    maturityDate: '2025-07-01',
    status: 'fully_paid',
    riskGrade: 'A',
    purpose: 'Seasonal citrus harvest factoring facility',
    processingFee: 600,
    totalInterest: l7Calculations.totalInterest,
    totalPayable: l7Calculations.totalPayable,
    monthlyInstallment: l7Calculations.periodicInstallment,
    totalPaid: l7Calculations.totalPayable,
    remainingBalance: 0,
    nextDueDate: '—',
    overdueAmount: 0,
    daysInArrears: 0,
    schedule: l7Calculations.schedule,
  };

  // Loan 8: Lillian Ward - Micro-Enterprise Boost (Under Review / New Origination)
  const l8Calculations = generateAmortizationSchedule(18000, 14.0, 12, '2026-10-01', 'amortized_reducing', 'monthly');
  const loan8: Loan = {
    id: 'DE-2026-081',
    borrowerId: 'bor-007',
    borrowerName: 'Lillian Ward (Ward Studio Architecture)',
    productId: 'prod-micro-business',
    productName: 'Micro-Enterprise Growth Boost',
    principal: 18000,
    interestRate: 14.0,
    termMonths: 12,
    repaymentFrequency: 'monthly',
    interestType: 'amortized_reducing',
    disbursementDate: '2026-10-01',
    firstPaymentDate: '2026-11-01',
    maturityDate: '2027-10-01',
    status: 'under_review',
    riskGrade: 'B',
    purpose: 'Architectural render servers and high-speed BIM license upgrades',
    processingFee: 360,
    totalInterest: l8Calculations.totalInterest,
    totalPayable: l8Calculations.totalPayable,
    monthlyInstallment: l8Calculations.periodicInstallment,
    totalPaid: 0,
    remainingBalance: l8Calculations.totalPayable,
    nextDueDate: '2026-11-01',
    overdueAmount: 0,
    daysInArrears: 0,
    underwriterNotes: 'Applicant provided 12 months verified client retainer fee statements.',
    schedule: l8Calculations.schedule,
  };

  return [loan1, loan2, loan3, loan4, loan5, loan6, loan7, loan8];
}

export const defaultTransactions: RepaymentTransaction[] = [
  {
    id: 'TX-2026-9901',
    loanId: 'DE-2025-014',
    borrowerId: 'bor-001',
    borrowerName: 'Sarah Jenkins',
    paymentDate: '2026-09-01',
    amount: 3861.24,
    principalPortion: 3012.44,
    interestPortion: 848.80,
    penaltyPortion: 0,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'ACH-FED-99821044',
    processedBy: 'Danito Vance',
    notes: 'Auto-debit clearing on scheduled date.',
    status: 'completed',
  },
  {
    id: 'TX-2026-9892',
    loanId: 'DE-2025-042',
    borrowerId: 'bor-002',
    borrowerName: 'Marcus Adebayo',
    paymentDate: '2026-09-15',
    amount: 3514.88,
    principalPortion: 2840.12,
    interestPortion: 674.76,
    penaltyPortion: 0,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'WIRE-BOA-4482019',
    processedBy: 'Danito Vance',
    notes: 'Direct wire received and reconciled.',
    status: 'completed',
  },
  {
    id: 'TX-2026-9884',
    loanId: 'DE-2024-039',
    borrowerId: 'bor-003',
    borrowerName: 'Dr. Elena Rostova',
    paymentDate: '2026-09-01',
    amount: 7354.10,
    principalPortion: 5120.30,
    interestPortion: 2233.80,
    penaltyPortion: 0,
    paymentMethod: 'direct_debit',
    referenceNumber: 'ACH-BOS-2918401',
    processedBy: 'Danito Vance',
    notes: 'Monthly clinic mortgage installment.',
    status: 'completed',
  },
  {
    id: 'TX-2026-9871',
    loanId: 'DE-2025-055',
    borrowerId: 'bor-005',
    borrowerName: 'Amara Kalu',
    paymentDate: '2026-09-01',
    amount: 1892.40,
    principalPortion: 1520.10,
    interestPortion: 372.30,
    penaltyPortion: 0,
    paymentMethod: 'card',
    referenceNumber: 'AUTH-STRIPE-489201',
    processedBy: 'Danito Vance',
    notes: 'Online borrower portal card processing.',
    status: 'completed',
  },
  {
    id: 'TX-2026-9855',
    loanId: 'DE-2025-003',
    borrowerId: 'bor-008',
    borrowerName: 'Tariq Al-Mansoor',
    paymentDate: '2025-07-01',
    amount: 10425.00,
    principalPortion: 10000.00,
    interestPortion: 425.00,
    penaltyPortion: 0,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'WIRE-WF-901844',
    processedBy: 'Danito Vance',
    notes: 'Final installment payment. Facility fully retired with zero balance.',
    status: 'completed',
  },
];
