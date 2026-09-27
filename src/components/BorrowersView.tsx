import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency, formatDate } from '../utils/financial';
import { Search, UserPlus, User, Building, Phone, Mail, ChevronRight, Eye } from 'lucide-react';
import { Borrower } from '../types/loan';
import { NewBorrowerModal } from './NewBorrowerModal';
import { BorrowerDetailModal } from './BorrowerDetailModal';

export const BorrowersView: React.FC = () => {
  const { borrowers, loans, settings, setActiveTab } = useLoanContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'business' | 'individual'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);

  const filteredBorrowers = borrowers.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.name.toLowerCase().includes(q) ||
      (b.businessName && b.businessName.toLowerCase().includes(q)) ||
      b.email.toLowerCase().includes(q) ||
      b.nationalId.toLowerCase().includes(q);

    const matchesType = typeFilter === 'all' || b.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Borrowers CRM Directory</h1>
          <p className="text-sm text-slate-400">
            Registered commercial and individual client profiles, credit scores, and exposure history.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Onboard Borrower</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, email, ID ref..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-700/80 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Clients' },
            { id: 'business', label: 'Commercial / SME' },
            { id: 'individual', label: 'Individual' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id as any)}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                typeFilter === tab.id
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Borrowers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBorrowers.map((borrower) => {
          const clientLoans = loans.filter((l) => l.borrowerId === borrower.id);
          const activeExposure = clientLoans
            .filter((l) => l.status === 'active' || l.status === 'in_arrears')
            .reduce((acc, curr) => acc + curr.remainingBalance, 0);

          const hasArrears = clientLoans.some((l) => l.status === 'in_arrears');

          return (
            <div
              key={borrower.id}
              onClick={() => setSelectedBorrower(borrower)}
              className="bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-xl p-5 space-y-4 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {borrower.avatarUrl ? (
                      <img
                        src={borrower.avatarUrl}
                        alt={borrower.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-600"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
                        {borrower.type === 'business' ? (
                          <Building className="w-6 h-6 text-amber-400/80" />
                        ) : (
                          <User className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {borrower.name}
                      </h3>
                      {borrower.businessName && (
                        <div className="text-xs text-amber-400/90 font-medium truncate max-w-[180px]">
                          {borrower.businessName}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {borrower.id}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">FICO</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {borrower.creditScore}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Active Exposure</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatCurrency(activeExposure, settings.currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Facilities</span>
                    <span className="font-medium text-slate-200">
                      {clientLoans.length} total{' '}
                      {hasArrears && (
                        <span className="text-rose-400 font-medium text-[11px] block">
                          (1 In Arrears)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-3 text-[11px] text-slate-400 border-t border-slate-700/60 mt-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{borrower.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{borrower.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform">
                <span>View Full Account Profile</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {isAddModalOpen && <NewBorrowerModal onClose={() => setIsAddModalOpen(false)} />}
      {selectedBorrower && (
        <BorrowerDetailModal
          borrower={selectedBorrower}
          onClose={() => setSelectedBorrower(null)}
        />
      )}
    </div>
  );
};
