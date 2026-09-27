import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Borrower,
  CollectionNote,
  EnterpriseSettings,
  Loan,
  LoanProduct,
  LoanStatus,
  RepaymentTransaction,
} from '../types/loan';
import {
  defaultBorrowers,
  defaultEnterpriseSettings,
  defaultLoanProducts,
  defaultTransactions,
  generateSeedLoans,
} from '../data/seedData';
import { generateAmortizationSchedule } from '../utils/financial';

interface LoanContextType {
  loans: Loan[];
  borrowers: Borrower[];
  products: LoanProduct[];
  transactions: RepaymentTransaction[];
  settings: EnterpriseSettings;
  updateSettings: (settings: EnterpriseSettings) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLoanId: string | null;
  setSelectedLoanId: (id: string | null) => void;
  selectedBorrowerId: string | null;
  setSelectedBorrowerId: (id: string | null) => void;
  isRecordPaymentOpen: boolean;
  paymentTargetLoanId: string | null;
  openRecordPaymentModal: (loanId?: string) => void;
  closeRecordPaymentModal: () => void;
  createLoan: (newLoanData: Partial<Loan> & { borrowerId: string; productId: string; principal: number; termMonths: number; interestRate: number }) => Loan;
  recordPayment: (paymentData: {
    loanId: string;
    amount: number;
    paymentMethod: RepaymentTransaction['paymentMethod'];
    referenceNumber: string;
    notes?: string;
  }) => RepaymentTransaction | null;
  updateLoanStatus: (loanId: string, status: LoanStatus, underwriterNotes?: string) => void;
  addCollectionNote: (loanId: string, note: Omit<CollectionNote, 'id'>) => void;
  createBorrower: (borrowerData: Omit<Borrower, 'id' | 'registeredAt'>) => Borrower;
  updateBorrower: (borrower: Borrower) => void;
  restructureLoan: (loanId: string, newTermMonths: number, newRate: number, reason: string) => void;
  resetAllData: () => void;
  exportDataBackup: () => void;
  importDataBackup: (jsonStr: string) => boolean;
  exportLedgerCSV: () => void;
  exportLoansCSV: () => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

const STORAGE_KEY_LOANS = 'danitos_enterprise_loans_v1';
const STORAGE_KEY_BORROWERS = 'danitos_enterprise_borrowers_v1';
const STORAGE_KEY_TRANSACTIONS = 'danitos_enterprise_transactions_v1';
const STORAGE_KEY_SETTINGS = 'danitos_enterprise_settings_v1';

export const LoanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loans, setLoans] = useState<Loan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOANS);
      return saved ? JSON.parse(saved) : generateSeedLoans();
    } catch {
      return generateSeedLoans();
    }
  });

  const [borrowers, setBorrowers] = useState<Borrower[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BORROWERS);
      return saved ? JSON.parse(saved) : defaultBorrowers;
    } catch {
      return defaultBorrowers;
    }
  });

  const [products] = useState<LoanProduct[]>(defaultLoanProducts);

  const [transactions, setTransactions] = useState<RepaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      return saved ? JSON.parse(saved) : defaultTransactions;
    } catch {
      return defaultTransactions;
    }
  });

  const [settings, setSettings] = useState<EnterpriseSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : defaultEnterpriseSettings;
    } catch {
      return defaultEnterpriseSettings;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState<boolean>(false);
  const [paymentTargetLoanId, setPaymentTargetLoanId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BORROWERS, JSON.stringify(borrowers));
  }, [borrowers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: EnterpriseSettings) => {
    setSettings(newSettings);
  };

  const openRecordPaymentModal = (loanId?: string) => {
    setPaymentTargetLoanId(loanId || null);
    setIsRecordPaymentOpen(true);
  };

  const closeRecordPaymentModal = () => {
    setIsRecordPaymentOpen(false);
    setPaymentTargetLoanId(null);
  };

  const createBorrower = (borrowerData: Omit<Borrower, 'id' | 'registeredAt'>): Borrower => {
    const newBorrower: Borrower = {
      ...borrowerData,
      id: `bor-${Date.now().toString().slice(-4)}`,
      registeredAt: new Date().toISOString().split('T')[0],
    };
    setBorrowers(prev => [newBorrower, ...prev]);
    return newBorrower;
  };

  const updateBorrower = (updated: Borrower) => {
    setBorrowers(prev => prev.map(b => (b.id === updated.id ? updated : b)));
  };

  const createLoan = (data: Partial<Loan> & { borrowerId: string; productId: string; principal: number; termMonths: number; interestRate: number }): Loan => {
    const borrower = borrowers.find(b => b.id === data.borrowerId);
    const product = products.find(p => p.id === data.productId) || products[0];

    const disbursementDate = data.disbursementDate || new Date().toISOString().split('T')[0];
    const calc = generateAmortizationSchedule(
      data.principal,
      data.interestRate,
      data.termMonths,
      disbursementDate,
      product.interestType,
      data.repaymentFrequency || 'monthly'
    );

    const firstDueDate = calc.schedule[0]?.dueDate || disbursementDate;
    const maturityDate = calc.schedule[calc.schedule.length - 1]?.dueDate || disbursementDate;
    const processingFee = (data.principal * (product.processingFeePercent || 1.5)) / 100;

    const newLoan: Loan = {
      id: `DE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      borrowerId: data.borrowerId,
      borrowerName: borrower ? (borrower.type === 'business' && borrower.businessName ? `${borrower.name} (${borrower.businessName})` : borrower.name) : 'Unknown Borrower',
      productId: product.id,
      productName: product.name,
      principal: data.principal,
      interestRate: data.interestRate,
      termMonths: data.termMonths,
      repaymentFrequency: data.repaymentFrequency || 'monthly',
      interestType: product.interestType,
      disbursementDate,
      firstPaymentDate: firstDueDate,
      maturityDate,
      status: data.status || 'active',
      riskGrade: data.riskGrade || 'B',
      purpose: data.purpose || 'Commercial Financing',
      collateral: data.collateral,
      guarantor: data.guarantor,
      processingFee: Math.round(processingFee * 100) / 100,
      totalInterest: calc.totalInterest,
      totalPayable: calc.totalPayable,
      monthlyInstallment: calc.periodicInstallment,
      totalPaid: 0,
      remainingBalance: calc.totalPayable,
      nextDueDate: firstDueDate,
      overdueAmount: 0,
      daysInArrears: 0,
      underwriterNotes: data.underwriterNotes,
      approvedBy: settings.authorizedSignatory,
      disbursedBy: 'Treasury Desk',
      schedule: calc.schedule,
      collectionNotes: [],
    };

    setLoans(prev => [newLoan, ...prev]);
    return newLoan;
  };

  const recordPayment = (paymentData: {
    loanId: string;
    amount: number;
    paymentMethod: RepaymentTransaction['paymentMethod'];
    referenceNumber: string;
    notes?: string;
  }): RepaymentTransaction | null => {
    const targetLoan = loans.find(l => l.id === paymentData.loanId);
    if (!targetLoan) return null;

    const amount = Number(paymentData.amount);
    if (amount <= 0) return null;

    let unallocated = amount;
    let penaltyPortion = 0;
    let interestPortion = 0;
    let principalPortion = 0;

    // Apply first to late penalty if any, then interest, then principal
    const updatedSchedule = targetLoan.schedule.map(inst => ({ ...inst }));
    
    // Sort or iterate through unpaid installments
    for (let i = 0; i < updatedSchedule.length; i++) {
      const inst = updatedSchedule[i];
      if (inst.status !== 'paid' && unallocated > 0) {
        // Late fee payoff
        if (inst.lateFee > 0) {
          const feeCovered = Math.min(unallocated, inst.lateFee);
          penaltyPortion += feeCovered;
          unallocated -= feeCovered;
          inst.lateFee -= feeCovered;
        }

        const remainingInstTotal = inst.totalInstallment - inst.paidAmount;
        if (unallocated >= remainingInstTotal) {
          // Full installment satisfied
          inst.paidAmount = inst.totalInstallment;
          inst.status = 'paid';
          inst.paidDate = new Date().toISOString().split('T')[0];
          interestPortion += inst.interestDue;
          principalPortion += inst.principalDue;
          unallocated -= remainingInstTotal;
        } else {
          // Partial payment
          inst.paidAmount += unallocated;
          inst.status = 'partial';
          // Proportionally assign
          const interestShare = (inst.interestDue / inst.totalInstallment) * unallocated;
          const principalShare = unallocated - interestShare;
          interestPortion += interestShare;
          principalPortion += principalShare;
          unallocated = 0;
        }
      }
    }

    const newTotalPaid = Math.round((targetLoan.totalPaid + amount) * 100) / 100;
    const newRemainingBalance = Math.max(0, Math.round((targetLoan.totalPayable - newTotalPaid) * 100) / 100);

    // Determine next pending installment
    const nextPending = updatedSchedule.find(inst => inst.status === 'pending' || inst.status === 'partial' || inst.status === 'overdue');
    const isFullyPaid = newRemainingBalance <= 0 || !nextPending;

    // Recalculate overdue amount and status
    const overdueInsts = updatedSchedule.filter(inst => inst.status === 'overdue');
    const totalOverdue = overdueInsts.reduce((acc, curr) => acc + (curr.totalInstallment - curr.paidAmount) + curr.lateFee, 0);

    let nextStatus: LoanStatus = targetLoan.status;
    if (isFullyPaid) {
      nextStatus = 'fully_paid';
    } else if (totalOverdue > 0) {
      nextStatus = 'in_arrears';
    } else if (targetLoan.status === 'in_arrears') {
      nextStatus = 'active';
    }

    const updatedLoan: Loan = {
      ...targetLoan,
      totalPaid: newTotalPaid,
      remainingBalance: newRemainingBalance,
      status: nextStatus,
      overdueAmount: Math.round(totalOverdue * 100) / 100,
      daysInArrears: totalOverdue > 0 ? targetLoan.daysInArrears : 0,
      nextDueDate: isFullyPaid ? '—' : (nextPending?.dueDate || targetLoan.nextDueDate),
      schedule: updatedSchedule,
    };

    setLoans(prev => prev.map(l => (l.id === updatedLoan.id ? updatedLoan : l)));

    const newTx: RepaymentTransaction = {
      id: `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      loanId: targetLoan.id,
      borrowerId: targetLoan.borrowerId,
      borrowerName: targetLoan.borrowerName,
      paymentDate: new Date().toISOString().split('T')[0],
      amount: Math.round(amount * 100) / 100,
      principalPortion: Math.round(principalPortion * 100) / 100,
      interestPortion: Math.round(interestPortion * 100) / 100,
      penaltyPortion: Math.round(penaltyPortion * 100) / 100,
      paymentMethod: paymentData.paymentMethod,
      referenceNumber: paymentData.referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      processedBy: settings.authorizedSignatory,
      notes: paymentData.notes,
      status: 'completed',
    };

    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  };

  const updateLoanStatus = (loanId: string, status: LoanStatus, underwriterNotes?: string) => {
    setLoans(prev =>
      prev.map(l => {
        if (l.id === loanId) {
          return {
            ...l,
            status,
            underwriterNotes: underwriterNotes !== undefined ? underwriterNotes : l.underwriterNotes,
          };
        }
        return l;
      })
    );
  };

  const addCollectionNote = (loanId: string, note: Omit<CollectionNote, 'id'>) => {
    const newNote: CollectionNote = {
      ...note,
      id: `cn-${Date.now().toString().slice(-4)}`,
    };

    setLoans(prev =>
      prev.map(l => {
        if (l.id === loanId) {
          const currentNotes = l.collectionNotes || [];
          return {
            ...l,
            collectionNotes: [newNote, ...currentNotes],
          };
        }
        return l;
      })
    );
  };

  const restructureLoan = (loanId: string, newTermMonths: number, newRate: number, reason: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const remainingPrincipal = Math.max(1000, loan.remainingBalance);
    const startDate = new Date().toISOString().split('T')[0];
    const calc = generateAmortizationSchedule(remainingPrincipal, newRate, newTermMonths, startDate, loan.interestType, loan.repaymentFrequency);

    const restructuredLoan: Loan = {
      ...loan,
      principal: remainingPrincipal,
      interestRate: newRate,
      termMonths: newTermMonths,
      totalInterest: calc.totalInterest,
      totalPayable: calc.totalPayable,
      monthlyInstallment: calc.periodicInstallment,
      totalPaid: 0,
      remainingBalance: calc.totalPayable,
      status: 'active',
      overdueAmount: 0,
      daysInArrears: 0,
      nextDueDate: calc.schedule[0].dueDate,
      maturityDate: calc.schedule[calc.schedule.length - 1].dueDate,
      schedule: calc.schedule,
      underwriterNotes: `${loan.underwriterNotes || ''}\n[RESTRUCTURED on ${startDate}]: ${reason}`,
      collectionNotes: [
        {
          id: `cn-res-${Date.now().toString().slice(-4)}`,
          date: startDate,
          officer: settings.authorizedSignatory,
          type: 'restructure_discussion',
          details: `Loan restructured: Tenor extended to ${newTermMonths} months at ${newRate}% APR. Arrears cleared. Reason: ${reason}`,
        },
        ...(loan.collectionNotes || []),
      ],
    };

    setLoans(prev => prev.map(l => (l.id === loanId ? restructuredLoan : l)));
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY_LOANS);
    localStorage.removeItem(STORAGE_KEY_BORROWERS);
    localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);

    setLoans(generateSeedLoans());
    setBorrowers(defaultBorrowers);
    setTransactions(defaultTransactions);
    setSettings(defaultEnterpriseSettings);
  };

  const exportDataBackup = () => {
    const backup = {
      enterprise: settings,
      loans,
      borrowers,
      transactions,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danitos_Enterprise_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataBackup = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.loans && Array.isArray(data.loans)) {
        setLoans(data.loans);
        if (data.borrowers) setBorrowers(data.borrowers);
        if (data.transactions) setTransactions(data.transactions);
        if (data.enterprise) setSettings(data.enterprise);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const exportLedgerCSV = () => {
    const headers = ['Transaction ID', 'Loan Ref', 'Borrower', 'Payment Date', 'Total Amount', 'Principal', 'Interest', 'Late Penalty', 'Method', 'Reference #', 'Status'];
    const rows = transactions.map(t => [
      t.id,
      t.loanId,
      `"${t.borrowerName.replace(/"/g, '""')}"`,
      t.paymentDate,
      t.amount.toFixed(2),
      t.principalPortion.toFixed(2),
      t.interestPortion.toFixed(2),
      t.penaltyPortion.toFixed(2),
      t.paymentMethod,
      t.referenceNumber,
      t.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danitos_Transactions_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportLoansCSV = () => {
    const headers = ['Loan ID', 'Borrower', 'Product', 'Principal', 'APR %', 'Term (Months)', 'Disbursement Date', 'Maturity Date', 'Status', 'Risk Grade', 'Monthly Payment', 'Total Paid', 'Remaining Balance', 'Overdue Amount', 'Days in Arrears'];
    const rows = loans.map(l => [
      l.id,
      `"${l.borrowerName.replace(/"/g, '""')}"`,
      `"${l.productName.replace(/"/g, '""')}"`,
      l.principal.toFixed(2),
      l.interestRate.toFixed(2),
      l.termMonths,
      l.disbursementDate,
      l.maturityDate,
      l.status,
      l.riskGrade,
      l.monthlyInstallment.toFixed(2),
      l.totalPaid.toFixed(2),
      l.remainingBalance.toFixed(2),
      l.overdueAmount.toFixed(2),
      l.daysInArrears,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danitos_Loans_Portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LoanContext.Provider
      value={{
        loans,
        borrowers,
        products,
        transactions,
        settings,
        updateSettings,
        activeTab,
        setActiveTab,
        selectedLoanId,
        setSelectedLoanId,
        selectedBorrowerId,
        setSelectedBorrowerId,
        isRecordPaymentOpen,
        paymentTargetLoanId,
        openRecordPaymentModal,
        closeRecordPaymentModal,
        createLoan,
        recordPayment,
        updateLoanStatus,
        addCollectionNote,
        createBorrower,
        updateBorrower,
        restructureLoan,
        resetAllData,
        exportDataBackup,
        importDataBackup,
        exportLedgerCSV,
        exportLoansCSV,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoanContext = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoanContext must be used within a LoanProvider');
  }
  return context;
};
