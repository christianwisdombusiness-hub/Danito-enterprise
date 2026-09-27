import { AmortizationInstallment, InterestType, RepaymentFrequency, RiskGrade } from '../types/loan';

/**
 * Calculates equal monthly installment (EMI) using standard French amortization formula
 */
export function calculateAmortizedMonthlyPayment(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  frequency: RepaymentFrequency = 'monthly'
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (annualRatePct <= 0) return principal / termMonths;

  let periodsPerYear = 12;
  let totalPeriods = termMonths;

  if (frequency === 'weekly') {
    periodsPerYear = 52;
    totalPeriods = Math.round(termMonths * 4.333);
  } else if (frequency === 'bi-weekly') {
    periodsPerYear = 26;
    totalPeriods = Math.round(termMonths * 2.166);
  }

  const periodicRate = (annualRatePct / 100) / periodsPerYear;
  const factor = Math.pow(1 + periodicRate, totalPeriods);
  const payment = (principal * periodicRate * factor) / (factor - 1);

  return Math.round(payment * 100) / 100;
}

/**
 * Generates detailed amortization installment schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  startDateStr: string,
  interestType: InterestType = 'amortized_reducing',
  frequency: RepaymentFrequency = 'monthly'
): {
  schedule: AmortizationInstallment[];
  totalInterest: number;
  totalPayable: number;
  periodicInstallment: number;
} {
  const schedule: AmortizationInstallment[] = [];
  const startDate = new Date(startDateStr || new Date().toISOString().split('T')[0]);

  let periodsCount = termMonths;
  let daysIncrement = 30; // standard 30-day month approximation

  if (frequency === 'weekly') {
    periodsCount = Math.round(termMonths * 4.333);
    daysIncrement = 7;
  } else if (frequency === 'bi-weekly') {
    periodsCount = Math.round(termMonths * 2.166);
    daysIncrement = 14;
  }

  let remainingPrincipal = principal;
  let totalInterest = 0;

  if (interestType === 'flat_rate') {
    // Flat rate: Total interest is calculated on initial principal
    const totalFlatInterest = principal * (annualRatePct / 100) * (termMonths / 12);
    const periodicInterest = totalFlatInterest / periodsCount;
    const periodicPrincipal = principal / periodsCount;
    const periodicInstallment = periodicPrincipal + periodicInterest;

    for (let i = 1; i <= periodsCount; i++) {
      const dueDate = new Date(startDate);
      if (frequency === 'monthly') {
        dueDate.setMonth(dueDate.getMonth() + i);
      } else {
        dueDate.setDate(dueDate.getDate() + (i * daysIncrement));
      }

      const pDue = i === periodsCount ? remainingPrincipal : Math.round(periodicPrincipal * 100) / 100;
      remainingPrincipal = Math.max(0, remainingPrincipal - pDue);

      schedule.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principalDue: pDue,
        interestDue: Math.round(periodicInterest * 100) / 100,
        totalInstallment: Math.round((pDue + periodicInterest) * 100) / 100,
        remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
        paidAmount: 0,
        status: 'pending',
        lateFee: 0,
      });
      totalInterest += periodicInterest;
    }

    return {
      schedule,
      totalInterest: Math.round(totalFlatInterest * 100) / 100,
      totalPayable: Math.round((principal + totalFlatInterest) * 100) / 100,
      periodicInstallment: Math.round(periodicInstallment * 100) / 100,
    };
  }

  // Standard Amortized Reducing Balance (French Amortization)
  const periodicRate = (annualRatePct / 100) / (frequency === 'weekly' ? 52 : frequency === 'bi-weekly' ? 26 : 12);
  const factor = Math.pow(1 + periodicRate, periodsCount);
  const periodicInstallment = (principal * periodicRate * factor) / (factor - 1);

  for (let i = 1; i <= periodsCount; i++) {
    const dueDate = new Date(startDate);
    if (frequency === 'monthly') {
      dueDate.setMonth(dueDate.getMonth() + i);
    } else {
      dueDate.setDate(dueDate.getDate() + (i * daysIncrement));
    }

    const interestDue = remainingPrincipal * periodicRate;
    let principalDue = periodicInstallment - interestDue;

    if (i === periodsCount || principalDue > remainingPrincipal) {
      principalDue = remainingPrincipal;
    }

    remainingPrincipal = Math.max(0, remainingPrincipal - principalDue);
    const totalInst = principalDue + interestDue;
    totalInterest += interestDue;

    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString().split('T')[0],
      principalDue: Math.round(principalDue * 100) / 100,
      interestDue: Math.round(interestDue * 100) / 100,
      totalInstallment: Math.round(totalInst * 100) / 100,
      remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
      paidAmount: 0,
      status: 'pending',
      lateFee: 0,
    });
  }

  return {
    schedule,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayable: Math.round((principal + totalInterest) * 100) / 100,
    periodicInstallment: Math.round(periodicInstallment * 100) / 100,
  };
}

/**
 * Calculates Debt-to-Income (DTI) ratio
 */
export function calculateDTI(monthlyDebtObligations: number, grossMonthlyIncome: number): number {
  if (grossMonthlyIncome <= 0) return 100;
  return Math.round((monthlyDebtObligations / grossMonthlyIncome) * 1000) / 10;
}

/**
 * Calculates Loan-to-Value (LTV) ratio
 */
export function calculateLTV(loanAmount: number, collateralAppraisedValue: number): number {
  if (!collateralAppraisedValue || collateralAppraisedValue <= 0) return 0;
  return Math.round((loanAmount / collateralAppraisedValue) * 1000) / 10;
}

/**
 * Underwrites and assesses risk grade
 */
export function determineRiskGrade(
  creditScore: number,
  dtiRatio: number,
  hasCollateral: boolean,
  ltvRatio?: number
): RiskGrade {
  let scorePoints = 0;

  // Credit Score weighting
  if (creditScore >= 750) scorePoints += 45;
  else if (creditScore >= 680) scorePoints += 35;
  else if (creditScore >= 600) scorePoints += 20;
  else scorePoints += 5;

  // DTI weighting
  if (dtiRatio <= 30) scorePoints += 35;
  else if (dtiRatio <= 42) scorePoints += 25;
  else if (dtiRatio <= 50) scorePoints += 15;
  else scorePoints += 5;

  // Collateral / LTV weighting
  if (hasCollateral) {
    if (ltvRatio && ltvRatio <= 65) scorePoints += 20;
    else scorePoints += 10;
  }

  if (scorePoints >= 80) return 'A';
  if (scorePoints >= 65) return 'B';
  if (scorePoints >= 45) return 'C';
  return 'D';
}

/**
 * Currency formatter with configurable currency code
 */
export function formatCurrency(amount: number, symbol = '$'): string {
  const rounded = Math.round(amount * 100) / 100;
  return `${symbol}${rounded.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats a short date: YYYY-MM-DD to "Sep 28, 2026"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
