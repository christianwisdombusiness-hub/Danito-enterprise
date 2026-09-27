import React, { useState, useEffect } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency } from '../utils/financial';
import { X, CreditCard, CheckCircle2, Printer } from 'lucide-react';
import { PaymentMethod, RepaymentTransaction } from '../types/loan';
import { PaymentReceiptModal } from './PaymentReceiptModal';

export const RecordPaymentModal: React.FC = () => {
  const {
    isRecordPaymentOpen,
    paymentTargetLoanId,
    closeRecordPaymentModal,
    loans,
    settings,
    recordPayment,
  } = useLoanContext();

  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [completedTx, setCompletedTx] = useState<RepaymentTransaction | null>(null);

  // Active or arrears loans only
  const payableLoans = loans.filter((l) => l.status !== 'fully_paid');

  useEffect(() => {
    if (paymentTargetLoanId) {
      setSelectedLoanId(paymentTargetLoanId);
      const target = loans.find((l) => l.id === paymentTargetLoanId);
      if (target) {
        // Default to either overdue amount if > 0 or standard monthly installment
        const suggested = target.overdueAmount > 0 ? target.overdueAmount : target.monthlyInstallment;
        setAmount(suggested);
      }
    } else if (payableLoans.length > 0 && !selectedLoanId) {
      setSelectedLoanId(payableLoans[0].id);
      setAmount(payableLoans[0].monthlyInstallment);
    }
    setReferenceNumber(`ACH-${Date.now().toString().slice(-6)}`);
  }, [paymentTargetLoanId, loans]);

  const handleLoanChange = (id: string) => {
    setSelectedLoanId(id);
    const target = loans.find((l) => l.id === id);
    if (target) {
      const suggested = target.overdueAmount > 0 ? target.overdueAmount : target.monthlyInstallment;
      setAmount(suggested);
    }
  };

  const currentLoan = loans.find((l) => l.id === selectedLoanId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId || amount <= 0) return;

    const tx = recordPayment({
      loanId: selectedLoanId,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
    });

    if (tx) {
      setCompletedTx(tx);
    }
  };

  const handleDone = () => {
    setCompletedTx(null);
    closeRecordPaymentModal();
  };

  if (!isRecordPaymentOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Record Loan Repayment</span>
            </div>
            <button
              onClick={handleDone}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {completedTx ? (
            /* Success State with Receipt Trigger */
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Repayment Successfully Processed</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transaction {completedTx.id} has been ledger-cleared and the facility schedule
                  updated.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1.5 text-left font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Collected:</span>
                  <span className="text-emerald-400 font-bold">
                    {formatCurrency(completedTx.amount, settings.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allocated to Principal:</span>
                  <span className="text-white">
                    {formatCurrency(completedTx.principalPortion, settings.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allocated to Interest:</span>
                  <span className="text-amber-400">
                    {formatCurrency(completedTx.interestPortion, settings.currencySymbol)}
                  </span>
                </div>
                {completedTx.penaltyPortion > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Late Fees Cleared:</span>
                    <span className="text-rose-400">
                      {formatCurrency(completedTx.penaltyPortion, settings.currencySymbol)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Reference:</span>
                  <span className="text-slate-200">{completedTx.referenceNumber}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleDone}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Select Facility / Account
                </label>
                <select
                  value={selectedLoanId}
                  onChange={(e) => handleLoanChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                >
                  {payableLoans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.id} — {l.borrowerName} (Bal:{' '}
                      {formatCurrency(l.remainingBalance, settings.currencySymbol)})
                    </option>
                  ))}
                </select>
              </div>

              {currentLoan && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled Installment:</span>
                    <span className="text-white font-mono font-medium">
                      {formatCurrency(currentLoan.monthlyInstallment, settings.currencySymbol)}
                    </span>
                  </div>
                  {currentLoan.overdueAmount > 0 && (
                    <div className="flex justify-between text-rose-400 font-medium">
                      <span>Overdue Past Due:</span>
                      <span className="font-mono">
                        {formatCurrency(currentLoan.overdueAmount, settings.currencySymbol)} (
                        {currentLoan.daysInArrears} days)
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Outstanding Balance:</span>
                    <span className="text-slate-200 font-mono">
                      {formatCurrency(currentLoan.remainingBalance, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Payment Amount ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step={0.01}
                    min={1}
                    max={currentLoan ? currentLoan.remainingBalance : undefined}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="bank_transfer">ACH / Bank Wire</option>
                    <option value="direct_debit">Direct Debit</option>
                    <option value="card">Corporate Card</option>
                    <option value="cash">Branch Cash Deposit</option>
                    <option value="check">Certified Check</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Bank Reference / Check / Transaction ID
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. WIRE-BOA-894210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Reconciliation Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Regular monthly installment received on due date..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleDone}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
                >
                  Confirm & Clear Repayment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};
