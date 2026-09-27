/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LoanProvider, useLoanContext } from './context/LoanContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LoansPortfolioView } from './components/LoansPortfolioView';
import { LoanOriginationWizard } from './components/LoanOriginationWizard';
import { BorrowersView } from './components/BorrowersView';
import { TransactionsLedgerView } from './components/TransactionsLedgerView';
import { DelinquencyRiskView } from './components/DelinquencyRiskView';
import { AmortizationCalculatorView } from './components/AmortizationCalculatorView';
import { LoanDetailModal } from './components/LoanDetailModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';

const AppContent: React.FC = () => {
  const { activeTab, selectedLoanId, setSelectedLoanId, settings } = useLoanContext();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'loans':
        return <LoansPortfolioView />;
      case 'origination':
        return <LoanOriginationWizard />;
      case 'borrowers':
        return <BorrowersView />;
      case 'transactions':
        return <TransactionsLedgerView />;
      case 'delinquency':
        return <DelinquencyRiskView />;
      case 'calculator':
        return <AmortizationCalculatorView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveView()}
      </main>

      {/* Detail Modal */}
      {selectedLoanId && (
        <LoanDetailModal
          loanId={selectedLoanId}
          onClose={() => setSelectedLoanId(null)}
        />
      )}

      {/* Global Payment Recording Modal */}
      <RecordPaymentModal />

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950 text-slate-500 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">{settings.enterpriseName}</span>
            <span>·</span>
            <span>{settings.tagline}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>License: {settings.registrationNumber}</span>
            <span>·</span>
            <span>Servicing Desk: {settings.phone}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LoanProvider>
      <AppContent />
    </LoanProvider>
  );
}
