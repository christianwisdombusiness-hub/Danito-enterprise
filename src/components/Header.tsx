import React from 'react';
import { useLoanContext } from '../context/LoanContext';
import { Plus, CreditCard, ArrowDownToLine, RefreshCw } from 'lucide-react';
import { logoPath } from '../data/seedData';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    openRecordPaymentModal,
    exportDataBackup,
    resetAllData,
  } = useLoanContext();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'loans', label: 'Portfolio' },
    { id: 'origination', label: 'Origination' },
    { id: 'borrowers', label: 'Borrowers' },
    { id: 'transactions', label: 'Ledger' },
    { id: 'delinquency', label: 'Delinquency' },
    { id: 'calculator', label: 'Calculator' },
  ];

  const handleReset = () => {
    if (window.confirm('Reset all loans and records to default enterprise seed data?')) {
      resetAllData();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <img
              src={logoPath}
              alt="Danito's Enterprise Emblem"
              className="w-8 h-8 rounded border border-amber-500/30 object-cover"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors cursor-pointer text-left"
            >
              Danito's Enterprise
            </button>
          </div>

          {/* Zone 2: 4-6 Nav links, single line text with subtle hover underlines */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-sm font-medium transition-colors py-1 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openRecordPaymentModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer"
              title="Record loan repayment"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Record Payment</span>
            </button>

            <button
              onClick={() => setActiveTab('origination')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Loan</span>
            </button>

            {/* Subtle auxiliary tools */}
            <div className="hidden lg:flex items-center gap-1 ml-2 border-l border-slate-800 pl-2">
              <button
                onClick={exportDataBackup}
                title="Backup all enterprise data (JSON)"
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowDownToLine className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                title="Reset sample portfolio data"
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-xs font-medium px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
