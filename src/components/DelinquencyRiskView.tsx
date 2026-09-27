import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency, formatDate } from '../utils/financial';
import {
  AlertTriangle,
  Clock,
  PhoneCall,
  FileWarning,
  RefreshCw,
  CreditCard,
  Eye,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import { RestructureLoanModal } from './RestructureLoanModal';

export const DelinquencyRiskView: React.FC = () => {
  const {
    loans,
    settings,
    openRecordPaymentModal,
    setSelectedLoanId,
    setActiveTab,
    addCollectionNote,
  } = useLoanContext();

  const [selectedLoanForRestructure, setSelectedLoanForRestructure] = useState<any>(null);
  const [activeAgingBucket, setActiveAgingBucket] = useState<'all' | '1-30' | '31-60' | '61-90' | '90+'>('all');

  // Arrears loans
  const overdueLoans = loans.filter((l) => l.status === 'in_arrears' || l.overdueAmount > 0);
  const totalArrearsVolume = overdueLoans.reduce((acc, curr) => acc + curr.overdueAmount, 0);

  // Group by aging buckets
  const bucket1to30 = overdueLoans.filter((l) => l.daysInArrears >= 1 && l.daysInArrears <= 30);
  const bucket31to60 = overdueLoans.filter((l) => l.daysInArrears >= 31 && l.daysInArrears <= 60);
  const bucket61to90 = overdueLoans.filter((l) => l.daysInArrears >= 61 && l.daysInArrears <= 90);
  const bucket90plus = overdueLoans.filter((l) => l.daysInArrears > 90);

  const displayedLoans = overdueLoans.filter((l) => {
    if (activeAgingBucket === '1-30') return l.daysInArrears >= 1 && l.daysInArrears <= 30;
    if (activeAgingBucket === '31-60') return l.daysInArrears >= 31 && l.daysInArrears <= 60;
    if (activeAgingBucket === '61-90') return l.daysInArrears >= 61 && l.daysInArrears <= 90;
    if (activeAgingBucket === '90+') return l.daysInArrears > 90;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Delinquency & PAR Risk Watchlist
        </h1>
        <p className="text-sm text-slate-400">
          Portfolio at Risk surveillance, aging arrears buckets, demand notices, and loan restructuring.
        </p>
      </div>

      {/* Aging Buckets Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveAgingBucket(activeAgingBucket === '1-30' ? 'all' : '1-30')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeAgingBucket === '1-30'
              ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-400'
              : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="text-xs font-semibold text-amber-400 flex items-center justify-between">
            <span>1 – 30 Days Past Due</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(
              bucket1to30.reduce((acc, curr) => acc + curr.overdueAmount, 0),
              settings.currencySymbol
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {bucket1to30.length} account{bucket1to30.length === 1 ? '' : 's'} · Courtesy follow-up
          </div>
        </button>

        <button
          onClick={() => setActiveAgingBucket(activeAgingBucket === '31-60' ? 'all' : '31-60')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeAgingBucket === '31-60'
              ? 'bg-rose-500/10 border-rose-400 ring-1 ring-rose-400'
              : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="text-xs font-semibold text-rose-400 flex items-center justify-between">
            <span>31 – 60 Days (PAR-30)</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(
              bucket31to60.reduce((acc, curr) => acc + curr.overdueAmount, 0),
              settings.currencySymbol
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {bucket31to60.length} account{bucket31to60.length === 1 ? '' : 's'} · Demand notice issued
          </div>
        </button>

        <button
          onClick={() => setActiveAgingBucket(activeAgingBucket === '61-90' ? 'all' : '61-90')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeAgingBucket === '61-90'
              ? 'bg-rose-600/15 border-rose-500 ring-1 ring-rose-500'
              : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="text-xs font-semibold text-rose-400 flex items-center justify-between">
            <span>61 – 90 Days (PAR-60)</span>
            <FileWarning className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(
              bucket61to90.reduce((acc, curr) => acc + curr.overdueAmount, 0),
              settings.currencySymbol
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {bucket61to90.length} account{bucket61to90.length === 1 ? '' : 's'} · Collateral audit
          </div>
        </button>

        <button
          onClick={() => setActiveAgingBucket(activeAgingBucket === '90+' ? 'all' : '90+')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeAgingBucket === '90+'
              ? 'bg-red-700/20 border-red-500 ring-1 ring-red-500'
              : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="text-xs font-semibold text-rose-500 flex items-center justify-between">
            <span>90+ Days (Default Watch)</span>
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(
              bucket90plus.reduce((acc, curr) => acc + curr.overdueAmount, 0),
              settings.currencySymbol
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {bucket90plus.length} account{bucket90plus.length === 1 ? '' : 's'} · Legal recovery
          </div>
        </button>
      </div>

      {/* Main Overdue Action List */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Active Accounts Requiring Servicing Intervention
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Total Past Due Volume: {formatCurrency(totalArrearsVolume, settings.currencySymbol)}
          </span>
        </div>

        {displayedLoans.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <span>No accounts currently fall in this aging delinquency bucket.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-amber-400">
                        {loan.id}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-xs font-semibold text-rose-400 font-mono">
                        {loan.daysInArrears} Days Delinquent
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-xs text-slate-300">{loan.productName}</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1">
                      {loan.borrowerName}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Overdue Installments + Fees</div>
                    <div className="text-lg font-bold font-mono text-rose-400 tabular-nums">
                      {formatCurrency(loan.overdueAmount, settings.currencySymbol)}
                    </div>
                  </div>
                </div>

                {/* Collateral & PTP summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Total Facility Balance</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {formatCurrency(loan.remainingBalance, settings.currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Pledged Collateral</span>
                    <span className="text-slate-200 truncate block">
                      {loan.collateral
                        ? `${loan.collateral.type} (${formatCurrency(
                            loan.collateral.appraisedValue,
                            settings.currencySymbol
                          )})`
                        : 'Unsecured Recourse'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Latest Servicing Action</span>
                    <span className="text-amber-400 truncate block">
                      {loan.collectionNotes && loan.collectionNotes.length > 0
                        ? `${loan.collectionNotes[0].type.replace('_', ' ')}: ${loan.collectionNotes[0].details.slice(0, 35)}...`
                        : 'No direct contact recorded'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedLoanId(loan.id);
                      setActiveTab('loans');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Facility</span>
                  </button>

                  <button
                    onClick={() => setSelectedLoanForRestructure(loan)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restructure Tenor</span>
                  </button>

                  <button
                    onClick={() => openRecordPaymentModal(loan.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Collect Overdue Balance</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restructure Modal */}
      {selectedLoanForRestructure && (
        <RestructureLoanModal
          loan={selectedLoanForRestructure}
          onClose={() => setSelectedLoanForRestructure(null)}
        />
      )}
    </div>
  );
};
