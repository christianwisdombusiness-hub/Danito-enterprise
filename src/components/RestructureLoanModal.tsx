import React, { useState, useMemo } from 'react';
import { Loan } from '../types/loan';
import { useLoanContext } from '../context/LoanContext';
import {
  calculateAmortizedMonthlyPayment,
  formatCurrency,
  generateAmortizationSchedule,
} from '../utils/financial';
import { X, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  loan: Loan;
  onClose: () => void;
}

export const RestructureLoanModal: React.FC<Props> = ({ loan, onClose }) => {
  const { settings, restructureLoan } = useLoanContext();

  const [newTermMonths, setNewTermMonths] = useState<number>(loan.termMonths + 12);
  const [newRate, setNewRate] = useState<number>(loan.interestRate);
  const [reason, setReason] = useState<string>(
    'Extended repayment tenor to lower periodic debt-service burden following borrower cashflow review.'
  );

  const remainingPrincipal = Math.max(1000, loan.remainingBalance);

  const preview = useMemo(() => {
    return generateAmortizationSchedule(
      remainingPrincipal,
      newRate,
      newTermMonths,
      new Date().toISOString().split('T')[0],
      loan.interestType,
      loan.repaymentFrequency
    );
  }, [remainingPrincipal, newRate, newTermMonths, loan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    restructureLoan(loan.id, newTermMonths, newRate, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">
              Restructure Loan {loan.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2.5 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              Restructuring will re-amortize the current outstanding balance of{' '}
              <span className="font-mono font-bold">
                {formatCurrency(remainingPrincipal, settings.currencySymbol)}
              </span>
              , clear historical arrears, and generate a new installment schedule.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                New Tenor (Months)
              </label>
              <input
                type="number"
                min={3}
                max={120}
                value={newTermMonths}
                onChange={(e) => setNewTermMonths(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                required
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Original: {loan.termMonths} mos
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Adjusted APR (%)
              </label>
              <input
                type="number"
                step={0.1}
                min={1}
                max={50}
                value={newRate}
                onChange={(e) => setNewRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                required
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Current: {loan.interestRate}%
              </div>
            </div>
          </div>

          {/* Comparison Preview */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Restructured Payment Impact
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Monthly Due:</span>
              <span className="text-rose-400 font-mono line-through">
                {formatCurrency(loan.monthlyInstallment, settings.currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">New Monthly Due:</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">
                {formatCurrency(preview.periodicInstallment, settings.currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-400">Monthly Cashflow Relief:</span>
              <span className="text-amber-400 font-mono font-medium">
                {formatCurrency(
                  Math.max(0, loan.monthlyInstallment - preview.periodicInstallment),
                  settings.currencySymbol
                )}
                /month
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Credit Committee Justification / Reason
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              Confirm Restructuring
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
