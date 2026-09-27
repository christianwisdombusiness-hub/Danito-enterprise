import React from 'react';
import { RepaymentTransaction } from '../types/loan';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency, formatDate } from '../utils/financial';
import { Printer, X } from 'lucide-react';
import { logoPath } from '../data/seedData';

interface Props {
  transaction: RepaymentTransaction;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<Props> = ({ transaction, onClose }) => {
  const { settings } = useLoanContext();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-white text-slate-900 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden print-area">
        {/* Header Actions */}
        <div className="no-print flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Official Receipt Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-400 text-slate-950 rounded hover:bg-amber-300"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Slip */}
        <div className="p-8 space-y-5 text-xs text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <img
                src={logoPath}
                alt="Logo"
                className="w-10 h-10 rounded border border-slate-200 object-cover"
              />
              <div>
                <h1 className="font-bold text-sm text-slate-900">{settings.enterpriseName}</h1>
                <div className="text-[11px] text-slate-500">Official Payment Receipt</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-slate-900">{transaction.id}</div>
              <div className="text-[11px] text-slate-500">{formatDate(transaction.paymentDate)}</div>
            </div>
          </div>

          <div className="space-y-2 py-2 border-b border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Received From:</span>
              <span className="font-semibold text-slate-900">{transaction.borrowerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Facility Reference:</span>
              <span className="font-mono font-medium">{transaction.loanId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction Reference:</span>
              <span className="font-mono">{transaction.referenceNumber}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Applied to Principal:</span>
              <span>{formatCurrency(transaction.principalPortion, settings.currencySymbol)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Applied to Interest:</span>
              <span>{formatCurrency(transaction.interestPortion, settings.currencySymbol)}</span>
            </div>
            {transaction.penaltyPortion > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Applied to Late Fees:</span>
                <span>{formatCurrency(transaction.penaltyPortion, settings.currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-300">
              <span>Total Received:</span>
              <span>{formatCurrency(transaction.amount, settings.currencySymbol)}</span>
            </div>
          </div>

          {transaction.notes && (
            <div className="text-[11px] text-slate-500 italic">
              Note: {transaction.notes}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-400">
            <div>Processed by: {transaction.processedBy}</div>
            <div className="text-right">Authorized Servicing Stamp</div>
          </div>
        </div>
      </div>
    </div>
  );
};
