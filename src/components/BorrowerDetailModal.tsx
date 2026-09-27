import React from 'react';
import { Borrower } from '../types/loan';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency, formatDate } from '../utils/financial';
import { X, User, Phone, Mail, MapPin, Building, CreditCard, Plus } from 'lucide-react';

interface Props {
  borrower: Borrower;
  onClose: () => void;
}

export const BorrowerDetailModal: React.FC<Props> = ({ borrower, onClose }) => {
  const { loans, settings, setSelectedLoanId, setActiveTab, openRecordPaymentModal } = useLoanContext();

  // All loans associated with this borrower
  const borrowerLoans = loans.filter((l) => l.borrowerId === borrower.id);
  const totalPrincipalBorrowed = borrowerLoans.reduce((acc, curr) => acc + curr.principal, 0);
  const currentOutstanding = borrowerLoans.reduce((acc, curr) => acc + curr.remainingBalance, 0);
  const totalPaid = borrowerLoans.reduce((acc, curr) => acc + curr.totalPaid, 0);

  // Overdue count
  const overdueLoans = borrowerLoans.filter((l) => l.status === 'in_arrears');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white">Client Portfolio Profile</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs font-mono text-amber-400">{borrower.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Identity & Top Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-4">
              {borrower.avatarUrl ? (
                <img
                  src={borrower.avatarUrl}
                  alt={borrower.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <User className="w-7 h-7" />
                </div>
              )}
              <div>
                <h2 className="text-base font-bold text-white">{borrower.name}</h2>
                {borrower.businessName && (
                  <div className="text-xs text-amber-400 font-medium">
                    {borrower.businessName}
                  </div>
                )}
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span className="capitalize">{borrower.type} Account</span>
                  <span>·</span>
                  <span>Onboarded: {formatDate(borrower.registeredAt)}</span>
                  <span>·</span>
                  <span className="text-emerald-400 capitalize font-medium">{borrower.kycStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 gap-1">
              <div className="text-slate-400">FICO Score</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {borrower.creditScore}
              </div>
            </div>
          </div>

          {/* Exposure KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-slate-400">Total Borrowed</div>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                {formatCurrency(totalPrincipalBorrowed, settings.currencySymbol)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {borrowerLoans.length} total facilities
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-slate-400">Current Exposure</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatCurrency(currentOutstanding, settings.currencySymbol)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Active balance</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-slate-400">Total Capital Repaid</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {formatCurrency(totalPaid, settings.currencySymbol)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Principal + yield</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-slate-400">Delinquency Count</div>
              <div
                className={`text-base font-bold font-mono mt-0.5 ${
                  overdueLoans.length > 0 ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {overdueLoans.length} Overdue
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {overdueLoans.length === 0 ? 'Good standing' : 'Action required'}
              </div>
            </div>
          </div>

          {/* Contact Details & Verification Data */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg space-y-2">
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Verified KYC Credentials & Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-400">Phone:</span>{' '}
                <span className="text-slate-200">{borrower.phone}</span>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>{' '}
                <span className="text-slate-200">{borrower.email}</span>
              </div>
              <div>
                <span className="text-slate-400">National ID:</span>{' '}
                <span className="text-slate-200 font-mono">{borrower.nationalId}</span>
              </div>
              <div>
                <span className="text-slate-400">Monthly Income:</span>{' '}
                <span className="text-white font-mono font-medium">
                  {formatCurrency(borrower.monthlyIncome, settings.currencySymbol)}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">Address:</span>{' '}
                <span className="text-slate-200">{borrower.address}</span>
              </div>
            </div>
            {borrower.notes && (
              <div className="pt-2 border-t border-slate-800 text-slate-400 italic">
                Credit Notes: {borrower.notes}
              </div>
            )}
          </div>

          {/* Associated Facilities History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Credit Facilities History</h3>
              <button
                onClick={() => {
                  onClose();
                  setActiveTab('origination');
                }}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Originate New Facility</span>
              </button>
            </div>

            {borrowerLoans.length === 0 ? (
              <div className="text-slate-500 py-4 text-center">
                No facilities originated for this client yet.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">Facility ID</th>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2 text-right">Principal</th>
                      <th className="px-3 py-2 text-right">Balance</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {borrowerLoans.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/30">
                        <td className="px-3 py-2 font-mono text-amber-400 font-medium">{l.id}</td>
                        <td className="px-3 py-2 text-slate-200">{l.productName}</td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-200">
                          {formatCurrency(l.principal, settings.currencySymbol)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-white">
                          {formatCurrency(l.remainingBalance, settings.currencySymbol)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`capitalize ${
                              l.status === 'active'
                                ? 'text-emerald-400'
                                : l.status === 'in_arrears'
                                ? 'text-rose-400 font-medium'
                                : 'text-slate-400'
                            }`}
                          >
                            {l.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => {
                              onClose();
                              setSelectedLoanId(l.id);
                              setActiveTab('loans');
                            }}
                            className="text-amber-400 hover:text-amber-300 font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
