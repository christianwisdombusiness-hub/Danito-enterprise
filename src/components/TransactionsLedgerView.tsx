import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency, formatDate } from '../utils/financial';
import { Search, Download, CreditCard, Printer, CheckCircle2, Filter } from 'lucide-react';
import { PaymentMethod, RepaymentTransaction } from '../types/loan';
import { PaymentReceiptModal } from './PaymentReceiptModal';

export const TransactionsLedgerView: React.FC = () => {
  const { transactions, settings, openRecordPaymentModal, exportLedgerCSV } = useLoanContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<RepaymentTransaction | null>(null);

  const filteredTx = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      tx.id.toLowerCase().includes(q) ||
      tx.loanId.toLowerCase().includes(q) ||
      tx.borrowerName.toLowerCase().includes(q) ||
      tx.referenceNumber.toLowerCase().includes(q);

    const matchesMethod = methodFilter === 'all' || tx.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollectedFiltered = filteredTx.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPrincipalRecovered = filteredTx.reduce((acc, curr) => acc + curr.principalPortion, 0);
  const totalInterestEarned = filteredTx.reduce((acc, curr) => acc + curr.interestPortion, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Collections Ledger</h1>
          <p className="text-sm text-slate-400">
            Real-time auditable cashflow ledger of principal recovery, accrued interest, and penalty clearing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportLedgerCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger CSV</span>
          </button>
          <button
            onClick={() => openRecordPaymentModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Repayment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Total Volume Collected</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {formatCurrency(totalCollectedFiltered, settings.currencySymbol)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{filteredTx.length} reconciled transactions</div>
        </div>

        <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Principal Reclaimed</div>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {formatCurrency(totalPrincipalRecovered, settings.currencySymbol)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Capital replenishment</div>
        </div>

        <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Gross Interest Revenue</div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {formatCurrency(totalInterestEarned, settings.currencySymbol)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Lending operations yield</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by transaction ID, loan ref, borrower, wire ref..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full sm:w-48 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Payment Channels</option>
            <option value="bank_transfer">ACH / Bank Wire</option>
            <option value="direct_debit">Direct Debit</option>
            <option value="card">Corporate Card</option>
            <option value="cash">Branch Cash Deposit</option>
            <option value="check">Certified Check</option>
            <option value="mobile_money">Mobile Money</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Tx ID</th>
                <th className="px-4 py-3">Facility Ref</th>
                <th className="px-4 py-3">Borrower Entity</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Amount Paid</th>
                <th className="px-4 py-3 text-right">Principal</th>
                <th className="px-4 py-3 text-right">Interest</th>
                <th className="px-4 py-3">Channel / Method</th>
                <th className="px-4 py-3">Reconciliation Ref</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-200 whitespace-nowrap">
                      {tx.id}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-amber-400 whitespace-nowrap">
                      {tx.loanId}
                    </td>
                    <td className="px-4 py-3 font-medium text-white max-w-[180px] truncate">
                      {tx.borrowerName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {formatDate(tx.paymentDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-emerald-400 whitespace-nowrap">
                      +{formatCurrency(tx.amount, settings.currencySymbol)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                      {formatCurrency(tx.principalPortion, settings.currencySymbol)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-amber-400/90 whitespace-nowrap">
                      {formatCurrency(tx.interestPortion, settings.currencySymbol)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap capitalize text-slate-300">
                      {tx.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {tx.referenceNumber}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTxForReceipt(tx)}
                        className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-900 rounded transition-colors cursor-pointer"
                        title="Print Official Payment Slip"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {selectedTxForReceipt && (
        <PaymentReceiptModal
          transaction={selectedTxForReceipt}
          onClose={() => setSelectedTxForReceipt(null)}
        />
      )}
    </div>
  );
};
