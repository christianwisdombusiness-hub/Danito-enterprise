import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency, formatDate } from '../utils/financial';
import {
  Search,
  Download,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  CreditCard,
} from 'lucide-react';
import { LoanStatus, RiskGrade } from '../types/loan';

export const LoansPortfolioView: React.FC = () => {
  const {
    loans,
    products,
    settings,
    setSelectedLoanId,
    openRecordPaymentModal,
    setActiveTab,
    exportLoansCSV,
  } = useLoanContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Filter loans
  const filteredLoans = loans.filter((loan) => {
    // Search query matches ID, borrower name, or purpose
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      loan.id.toLowerCase().includes(q) ||
      loan.borrowerName.toLowerCase().includes(q) ||
      loan.purpose.toLowerCase().includes(q);

    // Status filter
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;

    // Product filter
    const matchesProduct = productFilter === 'all' || loan.productId === productFilter;

    // Risk filter
    const matchesRisk = riskFilter === 'all' || loan.riskGrade === riskFilter;

    return matchesSearch && matchesStatus && matchesProduct && matchesRisk;
  });

  const getStatusLabel = (status: LoanStatus) => {
    switch (status) {
      case 'active':
        return <span className="text-emerald-400 font-medium">Active (Current)</span>;
      case 'in_arrears':
        return <span className="text-rose-400 font-medium">In Arrears</span>;
      case 'under_review':
        return <span className="text-amber-400 font-medium">Under Review</span>;
      case 'fully_paid':
        return <span className="text-slate-400 font-medium">Fully Paid Off</span>;
      case 'defaulted':
        return <span className="text-rose-500 font-medium">Defaulted</span>;
      case 'approved':
        return <span className="text-sky-400 font-medium">Approved / Pending Disbursement</span>;
      default:
        return <span className="text-slate-400 font-medium">{status}</span>;
    }
  };

  const getRiskBadge = (grade: RiskGrade) => {
    switch (grade) {
      case 'A':
        return <span className="text-xs font-mono font-semibold text-emerald-400">Grade A</span>;
      case 'B':
        return <span className="text-xs font-mono font-semibold text-sky-400">Grade B</span>;
      case 'C':
        return <span className="text-xs font-mono font-semibold text-amber-400">Grade C</span>;
      case 'D':
        return <span className="text-xs font-mono font-semibold text-rose-400">Grade D</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Loans Portfolio</h1>
          <p className="text-sm text-slate-400">
            Active facilities, amortized principal balances, and borrower credit agreements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportLoansCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('origination')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Live Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, borrower, purpose..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Status Select */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Statuses ({loans.length})</option>
              <option value="active">Active Current</option>
              <option value="in_arrears">In Arrears</option>
              <option value="under_review">Under Review</option>
              <option value="fully_paid">Fully Paid</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Product Select */}
          <div className="relative">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Products ({products.length})</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Risk Grade Select */}
          <div className="relative">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Risk Grades</option>
              <option value="A">Grade A (Prime)</option>
              <option value="B">Grade B (Standard)</option>
              <option value="C">Grade C (Watchlist)</option>
              <option value="D">Grade D (Subprime)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Quick Segmented Status Buttons */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-700/60 overflow-x-auto text-xs">
          <span className="text-slate-400 mr-2 text-[11px] uppercase tracking-wider font-semibold">
            Quick Filter:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'in_arrears', label: 'In Arrears' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'fully_paid', label: 'Paid Off' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main High-Density Data Grid */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3">Facility ID</th>
                <th scope="col" className="px-4 py-3">Borrower Entity</th>
                <th scope="col" className="px-4 py-3">Product / Term</th>
                <th scope="col" className="px-4 py-3 text-right">Principal</th>
                <th scope="col" className="px-4 py-3 text-right">Balance</th>
                <th scope="col" className="px-4 py-3 text-right">Monthly Due</th>
                <th scope="col" className="px-4 py-3">Next Due</th>
                <th scope="col" className="px-4 py-3">Risk</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    No loan facilities match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-slate-700/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedLoanId(loan.id)}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-amber-400 whitespace-nowrap">
                      {loan.id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-100 truncate max-w-[200px]">
                        {loan.borrowerName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {loan.purpose}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-slate-200">{loan.productName}</div>
                      <div className="text-[11px] text-slate-400">
                        {loan.termMonths} mos @ {loan.interestRate}% APR
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                      {formatCurrency(loan.principal, settings.currencySymbol)}
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-white whitespace-nowrap">
                      {loan.status === 'fully_paid' ? (
                        <span className="text-slate-400">$0.00</span>
                      ) : (
                        formatCurrency(loan.remainingBalance, settings.currencySymbol)
                      )}
                      {loan.overdueAmount > 0 && (
                        <div className="text-[11px] text-rose-400 font-mono">
                          +{formatCurrency(loan.overdueAmount, settings.currencySymbol)} past due
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                      {loan.status === 'fully_paid'
                        ? '—'
                        : formatCurrency(loan.monthlyInstallment, settings.currencySymbol)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {loan.status === 'fully_paid' ? '—' : formatDate(loan.nextDueDate)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {getRiskBadge(loan.riskGrade)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusLabel(loan.status)}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {loan.status !== 'fully_paid' && (
                          <button
                            onClick={() => openRecordPaymentModal(loan.id)}
                            className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-900 rounded transition-colors"
                            title="Record Repayment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedLoanId(loan.id)}
                          className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-900 rounded transition-colors"
                          title="Open Facility Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{filteredLoans.length}</span> of{' '}
            <span className="font-semibold text-slate-200">{loans.length}</span> facilities
          </div>
          <div className="font-mono tabular-nums">
            Filtered Balance:{' '}
            <span className="text-white font-semibold">
              {formatCurrency(
                filteredLoans.reduce((acc, curr) => acc + curr.remainingBalance, 0),
                settings.currencySymbol
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
