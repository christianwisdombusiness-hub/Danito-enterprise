import React from 'react';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency, formatDate } from '../utils/financial';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    loans,
    borrowers,
    transactions,
    settings,
    setActiveTab,
    setSelectedLoanId,
    openRecordPaymentModal,
    updateLoanStatus,
  } = useLoanContext();

  // Metrics computation
  const activeLoans = loans.filter((l) => l.status === 'active' || l.status === 'in_arrears');
  const totalPrincipalDisbursed = loans.reduce((acc, curr) => acc + curr.principal, 0);
  const totalOutstandingBalance = activeLoans.reduce((acc, curr) => acc + curr.remainingBalance, 0);
  const totalCollectedAllTime = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Arrears calculations
  const overdueLoans = loans.filter((l) => l.status === 'in_arrears' || l.overdueAmount > 0);
  const totalOverdueAmount = overdueLoans.reduce((acc, curr) => acc + curr.overdueAmount, 0);
  const par30Loans = loans.filter((l) => l.daysInArrears >= 30);
  const par30Amount = par30Loans.reduce((acc, curr) => acc + curr.remainingBalance, 0);
  const par30Rate = totalOutstandingBalance > 0 ? (par30Amount / totalOutstandingBalance) * 100 : 0;

  // Average APR
  const weightedApr =
    activeLoans.length > 0
      ? activeLoans.reduce((acc, curr) => acc + curr.interestRate * curr.principal, 0) /
        activeLoans.reduce((acc, curr) => acc + curr.principal, 0)
      : 0;

  // Under review
  const pendingUnderwriting = loans.filter((l) => l.status === 'under_review');

  // Breakdown by product
  const productDistribution = loans.reduce((acc: { [key: string]: number }, curr) => {
    acc[curr.productName] = (acc[curr.productName] || 0) + curr.remainingBalance;
    return acc;
  }, {});

  // Risk grade distribution
  const riskDistribution: { [key: string]: number } = { A: 0, B: 0, C: 0, D: 0 };
  activeLoans.forEach((l) => {
    riskDistribution[l.riskGrade] = (riskDistribution[l.riskGrade] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Portfolio Summary */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <span>{settings.enterpriseName}</span>
              <span aria-hidden="true">·</span>
              <span>Portfolio Servicing & Underwriting</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Executive Credit & Portfolio Dashboard
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Real-time capital deployment, repayment collections pipeline, and credit risk
              underwriting across all active facilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('origination')}
              className="px-4 py-2 text-xs font-semibold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer shadow-sm"
            >
              Originate New Facility
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Full Ledger</span>
            </button>
          </div>
        </div>

        {/* 6 Key Enterprise KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-slate-700/60">
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Portfolio</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">
              {formatCurrency(totalOutstandingBalance, settings.currencySymbol)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {activeLoans.length} active facilities
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Total Disbursed</div>
            <div className="text-xl font-bold text-slate-200 font-mono tabular-nums mt-1">
              {formatCurrency(totalPrincipalDisbursed, settings.currencySymbol)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Cumulative originations</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Capital Collected</div>
            <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
              {formatCurrency(totalCollectedAllTime, settings.currencySymbol)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Principal + Interest</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">PAR-30 Exposure</div>
            <div className={`text-xl font-bold font-mono tabular-nums mt-1 ${par30Rate > 5 ? 'text-rose-400' : 'text-amber-400'}`}>
              {par30Rate.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {formatCurrency(par30Amount, settings.currencySymbol)} at risk
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Weighted APR</div>
            <div className="text-xl font-bold text-amber-300 font-mono tabular-nums mt-1">
              {weightedApr.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Portfolio net yield</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Client Accounts</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">
              {borrowers.length}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">100% KYC verified</div>
          </div>
        </div>
      </div>

      {/* Action Center: Delinquencies & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist & Delinquencies */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-white">
                Overdue Installments Watchlist
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('delinquency')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Collections View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {overdueLoans.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <span>All client accounts are current. Zero overdue installments.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-700/70 hover:border-slate-600 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-amber-400">
                        {loan.id}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-rose-400 font-medium font-mono tabular-nums">
                        {loan.daysInArrears} days past due
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-100 truncate mt-0.5">
                      {loan.borrowerName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Overdue amount:{' '}
                      <span className="text-rose-400 font-mono font-medium tabular-nums">
                        {formatCurrency(loan.overdueAmount, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openRecordPaymentModal(loan.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors cursor-pointer"
                    >
                      Collect
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLoanId(loan.id);
                        setActiveTab('loans');
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Facilities Under Review & Underwriting */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-white">
                Underwriting & Approval Queue
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('origination')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Originate</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingUnderwriting.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-80" />
              <span>No facilities currently awaiting underwriting decision.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUnderwriting.map((loan) => (
                <div
                  key={loan.id}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-700/70 hover:border-slate-600 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-amber-400">
                        {loan.id}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-300">{loan.productName}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-100 truncate mt-0.5">
                      {loan.borrowerName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Requested:{' '}
                      <span className="text-white font-mono font-medium tabular-nums">
                        {formatCurrency(loan.principal, settings.currencySymbol)}
                      </span>{' '}
                      at {loan.interestRate}% APR
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateLoanStatus(loan.id, 'active')}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors cursor-pointer"
                    >
                      Approve & Disburse
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLoanId(loan.id);
                        setActiveTab('loans');
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Analysis & Recent Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Allocation */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-3">Product Exposure</h2>
          <div className="space-y-3">
            {Object.entries(productDistribution).map(([productName, balance]) => {
              const pct = totalOutstandingBalance > 0 ? (balance / totalOutstandingBalance) * 100 : 0;
              return (
                <div key={productName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[180px]">{productName}</span>
                    <span className="text-slate-200 font-mono font-medium tabular-nums">
                      {formatCurrency(balance, settings.currencySymbol)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Rating Distribution */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-3">Underwriting Risk Grades</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
              <div className="text-xs text-emerald-400 font-medium">Grade A (Prime)</div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">
                {riskDistribution['A'] || 0}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Low risk / High collateral</div>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
              <div className="text-xs text-sky-400 font-medium">Grade B (Standard)</div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">
                {riskDistribution['B'] || 0}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Moderate risk / Solid DTI</div>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
              <div className="text-xs text-amber-400 font-medium">Grade C (Watch)</div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">
                {riskDistribution['C'] || 0}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Elevated risk monitor</div>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-lg">
              <div className="text-xs text-rose-400 font-medium">Grade D (Subprime)</div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">
                {riskDistribution['D'] || 0}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">High risk / Tight scrutiny</div>
            </div>
          </div>
        </div>

        {/* Recent Repayment Ledger Activity */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Recent Collections</h2>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {transactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50"
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">
                    {tx.borrowerName}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>{formatDate(tx.paymentDate)}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-400">{tx.referenceNumber}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
                    +{formatCurrency(tx.amount, settings.currencySymbol)}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize">
                    {tx.paymentMethod.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
