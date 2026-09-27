import React from 'react';
import { Borrower, Loan } from '../types/loan';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency, formatDate } from '../utils/financial';
import { Printer, X } from 'lucide-react';
import { logoPath } from '../data/seedData';

interface Props {
  loan: Loan;
  borrower?: Borrower;
  onClose: () => void;
}

export const LoanStatementModal: React.FC<Props> = ({ loan, borrower, onClose }) => {
  const { settings } = useLoanContext();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print-area">
        {/* Print Action Bar */}
        <div className="no-print flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Statement of Account Preview
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-400 text-slate-950 rounded hover:bg-amber-300 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document */}
        <div className="p-8 sm:p-12 overflow-y-auto text-slate-800 font-sans space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-6">
            <div className="flex items-center gap-4">
              <img
                src={logoPath}
                alt="Emblem"
                className="w-12 h-12 rounded border border-slate-200 object-cover"
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {settings.enterpriseName}
                </h1>
                <div className="text-xs text-slate-500">{settings.tagline}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Reg: {settings.registrationNumber} · Tax ID: {settings.taxNumber}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Official Account Statement
              </div>
              <div className="text-xs text-slate-600 font-mono mt-0.5">
                Ref: STMT-{loan.id}-{new Date().toISOString().split('T')[0]}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Statement Date: {formatDate(new Date().toISOString().split('T')[0])}
              </div>
            </div>
          </div>

          {/* Account & Borrower Summary Grid */}
          <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Client / Borrower
              </div>
              <div className="font-bold text-slate-900 text-sm">{loan.borrowerName}</div>
              {borrower?.businessName && (
                <div className="font-medium text-slate-700">{borrower.businessName}</div>
              )}
              <div className="text-slate-600 mt-1">{borrower?.address}</div>
              <div className="text-slate-600">Tax / National ID: {borrower?.nationalId}</div>
            </div>

            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Credit Facility Summary
              </div>
              <div className="space-y-0.5 text-slate-700">
                <div>Facility ID: <span className="font-mono font-bold text-slate-900">{loan.id}</span></div>
                <div>Product: <span className="font-medium text-slate-900">{loan.productName}</span></div>
                <div>Disbursed Principal: <span className="font-mono font-semibold">{formatCurrency(loan.principal, settings.currencySymbol)}</span></div>
                <div>Annual APR: <span className="font-mono">{loan.interestRate}%</span></div>
                <div>Term Tenor: <span>{loan.termMonths} Months</span></div>
                <div>Total Remaining Balance: <span className="font-mono font-bold text-slate-900">{formatCurrency(loan.remainingBalance, settings.currencySymbol)}</span></div>
              </div>
            </div>
          </div>

          {/* Installment History Table */}
          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-wider text-slate-900 font-bold">
              Installment Schedule & Status
            </h2>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Due Date</th>
                  <th className="px-3 py-2 text-right">Principal</th>
                  <th className="px-3 py-2 text-right">Interest</th>
                  <th className="px-3 py-2 text-right">Installment</th>
                  <th className="px-3 py-2 text-right">Paid Amount</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loan.schedule.map((inst) => (
                  <tr key={inst.installmentNumber} className={inst.status === 'paid' ? 'bg-slate-50/50' : ''}>
                    <td className="px-3 py-1.5 font-mono text-slate-500">{inst.installmentNumber}</td>
                    <td className="px-3 py-1.5 font-mono">{formatDate(inst.dueDate)}</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">{formatCurrency(inst.principalDue, settings.currencySymbol)}</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">{formatCurrency(inst.interestDue, settings.currencySymbol)}</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums font-semibold">{formatCurrency(inst.totalInstallment, settings.currencySymbol)}</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums text-emerald-700">{inst.paidAmount > 0 ? formatCurrency(inst.paidAmount, settings.currencySymbol) : '—'}</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums text-slate-600">{formatCurrency(inst.remainingPrincipal, settings.currencySymbol)}</td>
                    <td className="px-3 py-1.5 capitalize font-medium">
                      {inst.status === 'paid' ? (
                        <span className="text-emerald-700">Paid</span>
                      ) : inst.status === 'overdue' ? (
                        <span className="text-rose-700">Overdue</span>
                      ) : (
                        <span className="text-slate-500">Scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer & Certification */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <div>{settings.address}</div>
              <div>Tel: {settings.phone} · Email: {settings.email}</div>
            </div>
            <div className="text-right">
              <div className="w-48 border-b border-slate-400 pb-1 mb-1 font-serif text-slate-800 italic">
                {settings.authorizedSignatory}
              </div>
              <div className="font-semibold text-slate-800">{settings.signatoryTitle}</div>
              <div className="text-[11px] text-slate-400">Danito's Enterprise Servicing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
