import React, { useState, useMemo } from 'react';
import { useLoanContext } from '../context/LoanContext';
import {
  calculateDTI,
  calculateLTV,
  determineRiskGrade,
  formatCurrency,
  formatDate,
  generateAmortizationSchedule,
} from '../utils/financial';
import {
  Check,
  ChevronRight,
  Calculator,
  Shield,
  User,
  DollarSign,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { RepaymentFrequency } from '../types/loan';

export const LoanOriginationWizard: React.FC = () => {
  const { borrowers, products, settings, createLoan, setActiveTab, setSelectedLoanId } = useLoanContext();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>(borrowers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [principal, setPrincipal] = useState<number>(50000);
  const [interestRate, setInterestRate] = useState<number>(products[0]?.defaultInterestRate || 10);
  const [termMonths, setTermMonths] = useState<number>(24);
  const [repaymentFrequency, setRepaymentFrequency] = useState<RepaymentFrequency>('monthly');
  const [disbursementDate, setDisbursementDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [purpose, setPurpose] = useState<string>('Operational working capital and inventory bulk procurement');

  // Collateral & Guarantor
  const [hasCollateral, setHasCollateral] = useState<boolean>(true);
  const [collateralType, setCollateralType] = useState<any>('Vehicle');
  const [collateralDesc, setCollateralDesc] = useState<string>('2023 Commercial Delivery Van (VIN: 1FTFW1ED4NFA982)');
  const [collateralValue, setCollateralValue] = useState<number>(75000);
  const [collateralDocRef, setCollateralDocRef] = useState<string>('TIT-REG-981244');

  const [hasGuarantor, setHasGuarantor] = useState<boolean>(false);
  const [guarantorName, setGuarantorName] = useState<string>('');
  const [guarantorRelation, setGuarantorRelation] = useState<string>('');
  const [guarantorPhone, setGuarantorPhone] = useState<string>('');
  const [guarantorIncome, setGuarantorIncome] = useState<number>(0);

  const [underwriterNotes, setUnderwriterNotes] = useState<string>('');
  const [disbursementAction, setDisbursementAction] = useState<'active' | 'under_review'>('active');

  const currentBorrower = useMemo(
    () => borrowers.find((b) => b.id === selectedBorrowerId),
    [borrowers, selectedBorrowerId]
  );

  const currentProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  // When product changes, update default interest rate and terms
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setInterestRate(prod.defaultInterestRate);
      setTermMonths(prod.minTermMonths || 12);
      setHasCollateral(prod.collateralRequired);
    }
  };

  // Calculations
  const calcResults = useMemo(() => {
    return generateAmortizationSchedule(
      principal,
      interestRate,
      termMonths,
      disbursementDate,
      currentProduct?.interestType || 'amortized_reducing',
      repaymentFrequency
    );
  }, [principal, interestRate, termMonths, disbursementDate, currentProduct, repaymentFrequency]);

  // Risk Calculations
  const monthlyIncome = currentBorrower?.monthlyIncome || 10000;
  const dti = calculateDTI(calcResults.periodicInstallment, monthlyIncome);
  const ltv = hasCollateral ? calculateLTV(principal, collateralValue) : 0;
  const riskGrade = determineRiskGrade(
    currentBorrower?.creditScore || 700,
    dti,
    hasCollateral,
    ltv
  );

  const handleOriginate = () => {
    if (!currentBorrower || !currentProduct) return;

    const newLoan = createLoan({
      borrowerId: selectedBorrowerId,
      productId: selectedProductId,
      principal,
      interestRate,
      termMonths,
      repaymentFrequency,
      disbursementDate,
      purpose,
      status: disbursementAction,
      riskGrade,
      collateral: hasCollateral
        ? {
            type: collateralType,
            description: collateralDesc,
            appraisedValue: collateralValue,
            documentRef: collateralDocRef,
            lienHolder: settings.enterpriseName,
          }
        : undefined,
      guarantor: hasGuarantor
        ? {
            name: guarantorName,
            relationship: guarantorRelation,
            phone: guarantorPhone,
            email: '',
            annualIncome: guarantorIncome,
            nationalId: 'US-ID-VERIFIED',
          }
        : undefined,
      underwriterNotes: underwriterNotes || `Originated under standard credit policy. DTI: ${dti}%, LTV: ${ltv}%`,
    });

    setSelectedLoanId(newLoan.id);
    setActiveTab('loans');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Loan Origination & Underwriting
          </h1>
          <p className="text-sm text-slate-400">
            Originate a new credit facility with real-time risk grading and amortization schedule.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: 'Borrower' },
            { num: 2, label: 'Terms' },
            { num: 3, label: 'Security' },
            { num: 4, label: 'Schedule' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                currentStep === s.num
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : currentStep > s.num
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              <span>{s.num}.</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Body */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6">
        {/* STEP 1: Borrower Selection */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <User className="w-4 h-4" />
              <span>Step 1: Client Account & Identity Verification</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Registered Borrower Entity
                </label>
                <select
                  value={selectedBorrowerId}
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {borrowers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.businessName ? `(${b.businessName})` : ''} — Score: {b.creditScore}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Or add a new borrower in the Borrowers tab before originating.
                </p>
              </div>

              {currentBorrower && (
                <div className="p-4 bg-slate-900/80 border border-slate-700/80 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {currentBorrower.name}
                      </div>
                      {currentBorrower.businessName && (
                        <div className="text-xs text-amber-400 font-medium">
                          {currentBorrower.businessName}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Credit Score</div>
                      <div className="text-base font-bold font-mono text-emerald-400">
                        {currentBorrower.creditScore}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400">Verified Income:</span>{' '}
                      <span className="text-slate-200 font-mono">
                        {formatCurrency(currentBorrower.monthlyIncome, settings.currencySymbol)}/mo
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">KYC Status:</span>{' '}
                      <span className="text-emerald-400 font-medium capitalize">
                        {currentBorrower.kycStatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">ID Ref:</span>{' '}
                      <span className="text-slate-200 font-mono">{currentBorrower.nationalId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Phone:</span>{' '}
                      <span className="text-slate-200">{currentBorrower.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-700/60">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
              >
                <span>Continue to Loan Terms</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Loan Product & Financial Terms */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <DollarSign className="w-4 h-4" />
              <span>Step 2: Loan Product & Facility Terms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Credit Facility Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.defaultInterestRate}% APR)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Principal Facility Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Annual Interest Rate (APR %)
                </label>
                <input
                  type="number"
                  step={0.1}
                  min={1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tenor / Term (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={termMonths}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Repayment Cadence
                </label>
                <select
                  value={repaymentFrequency}
                  onChange={(e) => setRepaymentFrequency(e.target.value as RepaymentFrequency)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="monthly">Monthly Equal Installment (Standard)</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Disbursement Date
                </label>
                <input
                  type="date"
                  value={disbursementDate}
                  onChange={(e) => setDisbursementDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Loan Purpose / Commercial Justification
              </label>
              <textarea
                rows={2}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="State the commercial purpose and repayment source..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick Live Calc Banner */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-400">Projected Monthly Payment:</span>{' '}
                <span className="text-white font-bold font-mono tabular-nums text-sm">
                  {formatCurrency(calcResults.periodicInstallment, settings.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Total Interest Yield:</span>{' '}
                <span className="text-amber-400 font-bold font-mono tabular-nums text-sm">
                  {formatCurrency(calcResults.totalInterest, settings.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Total Capital Repayable:</span>{' '}
                <span className="text-emerald-400 font-bold font-mono tabular-nums text-sm">
                  {formatCurrency(calcResults.totalPayable, settings.currencySymbol)}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-700/60">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
              >
                <span>Continue to Security & Risk</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Collateral, Guarantor & Underwriting */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <Shield className="w-4 h-4" />
              <span>Step 3: Security, Collateral Registry & Risk Assessment</span>
            </div>

            {/* Collateral Toggle & Inputs */}
            <div className="p-4 bg-slate-900/60 border border-slate-700/70 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white">Collateral Asset Pledge</h3>
                  <p className="text-[11px] text-slate-400">
                    Registered lien against tangible borrower assets
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCollateral}
                    onChange={(e) => setHasCollateral(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
                </label>
              </div>

              {hasCollateral && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Asset Category</label>
                    <select
                      value={collateralType}
                      onChange={(e) => setCollateralType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="Real Estate">Commercial Real Estate</option>
                      <option value="Vehicle">Vehicle / Fleet</option>
                      <option value="Machinery">Industrial Machinery</option>
                      <option value="Inventory">Inventory / Stock</option>
                      <option value="Securities">Securities / Escrow</option>
                      <option value="Other">Other Asset</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Appraised Value ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      value={collateralValue}
                      onChange={(e) => setCollateralValue(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Asset Description & Serial / VIN</label>
                    <input
                      type="text"
                      value={collateralDesc}
                      onChange={(e) => setCollateralDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Guarantor Details */}
            <div className="p-4 bg-slate-900/60 border border-slate-700/70 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white">Personal / Corporate Guarantor</h3>
                  <p className="text-[11px] text-slate-400">
                    Secondary recourse guarantor for the facility
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasGuarantor}
                    onChange={(e) => setHasGuarantor(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400"></div>
                </label>
              </div>

              {hasGuarantor && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Guarantor Full Name</label>
                    <input
                      type="text"
                      value={guarantorName}
                      onChange={(e) => setGuarantorName(e.target.value)}
                      placeholder="e.g. Johnathan Vance"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Relationship to Borrower</label>
                    <input
                      type="text"
                      value={guarantorRelation}
                      onChange={(e) => setGuarantorRelation(e.target.value)}
                      placeholder="e.g. Managing Partner / Director"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Verified Annual Income</label>
                    <input
                      type="number"
                      value={guarantorIncome}
                      onChange={(e) => setGuarantorIncome(Number(e.target.value))}
                      placeholder="85000"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Automated Underwriting Metrics */}
            <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-lg">
              <h3 className="text-xs font-semibold text-amber-400 mb-2">
                Automated Credit Policy & Underwriting Engine
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-400">Debt-to-Income (DTI)</div>
                  <div className={`text-base font-bold font-mono tabular-nums ${dti > 45 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {dti}%
                  </div>
                  <div className="text-[11px] text-slate-400">Threshold: &le; 45%</div>
                </div>

                <div>
                  <div className="text-slate-400">Loan-to-Value (LTV)</div>
                  <div className={`text-base font-bold font-mono tabular-nums ${ltv > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {hasCollateral ? `${ltv}%` : 'Unsecured'}
                  </div>
                  <div className="text-[11px] text-slate-400">Target: &le; 75%</div>
                </div>

                <div>
                  <div className="text-slate-400">Borrower Credit Score</div>
                  <div className="text-base font-bold font-mono tabular-nums text-white">
                    {currentBorrower?.creditScore}
                  </div>
                  <div className="text-[11px] text-slate-400">FICO Score Tier</div>
                </div>

                <div>
                  <div className="text-slate-400">Assigned Risk Grade</div>
                  <div className="text-base font-bold font-mono tabular-nums text-amber-400">
                    Grade {riskGrade}
                  </div>
                  <div className="text-[11px] text-slate-400">Danito Underwriting Index</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-700/60">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
              >
                <span>Preview Amortization Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Amortization Schedule & Origination Action */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <Calculator className="w-4 h-4" />
              <span>Step 4: Amortization Schedule Review & Disbursement</span>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900 rounded-lg text-xs">
              <div>
                <span className="text-slate-400">Facility Principal</span>
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  {formatCurrency(principal, settings.currencySymbol)}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Total Interest</span>
                <div className="text-base font-bold text-amber-400 font-mono tabular-nums">
                  {formatCurrency(calcResults.totalInterest, settings.currencySymbol)}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Periodic Installment</span>
                <div className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                  {formatCurrency(calcResults.periodicInstallment, settings.currencySymbol)}
                </div>
              </div>
              <div>
                <span className="text-slate-400">First Installment Due</span>
                <div className="text-base font-bold text-slate-200 font-mono">
                  {formatDate(calcResults.schedule[0]?.dueDate)}
                </div>
              </div>
            </div>

            {/* Installments Table Preview */}
            <div className="border border-slate-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 sticky top-0 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-700">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Due Date</th>
                    <th className="px-3 py-2 text-right">Principal</th>
                    <th className="px-3 py-2 text-right">Interest</th>
                    <th className="px-3 py-2 text-right">Total Installment</th>
                    <th className="px-3 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {calcResults.schedule.map((inst) => (
                    <tr key={inst.installmentNumber} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2 font-mono text-slate-400">
                        {inst.installmentNumber}
                      </td>
                      <td className="px-3 py-2 font-mono">{formatDate(inst.dueDate)}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {formatCurrency(inst.principalDue, settings.currencySymbol)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-amber-400/90">
                        {formatCurrency(inst.interestDue, settings.currencySymbol)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-white">
                        {formatCurrency(inst.totalInstallment, settings.currencySymbol)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-400">
                        {formatCurrency(inst.remainingPrincipal, settings.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Disbursement Execution Controls */}
            <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-white">Origination Execution Status</h3>
                  <p className="text-[11px] text-slate-400">
                    Select immediate capital release or route to underwriting queue
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDisbursementAction('active')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      disbursementAction === 'active'
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Immediate Disbursement (Active)
                  </button>
                  <button
                    onClick={() => setDisbursementAction('under_review')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      disbursementAction === 'under_review'
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Hold for Underwriter Review
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Underwriter Approval Remarks
                </label>
                <input
                  type="text"
                  value={underwriterNotes}
                  onChange={(e) => setUnderwriterNotes(e.target.value)}
                  placeholder="e.g. Approved per Credit Committee Resolution #2026-CC-84..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-700/60">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={handleOriginate}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <FileCheck className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {disbursementAction === 'active'
                    ? 'Disburse Facility & Issue Agreement'
                    : 'Submit to Underwriting Queue'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
