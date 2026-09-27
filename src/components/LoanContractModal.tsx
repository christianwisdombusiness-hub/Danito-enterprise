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

export const LoanContractModal: React.FC<Props> = ({ loan, borrower, onClose }) => {
  const { settings } = useLoanContext();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print-area">
        {/* Action Header */}
        <div className="no-print flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Legal Loan Agreement & Promissory Note
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-400 text-slate-950 rounded hover:bg-amber-300 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Agreement</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Contract Document */}
        <div className="p-8 sm:p-12 overflow-y-auto text-slate-800 font-sans space-y-6 leading-relaxed text-xs">
          {/* Header */}
          <div className="text-center border-b border-slate-300 pb-6 space-y-2">
            <img
              src={logoPath}
              alt="Logo"
              className="w-14 h-14 mx-auto rounded border border-slate-200 object-cover"
            />
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
              Commercial Credit Facility Agreement
            </h1>
            <p className="text-slate-600 font-medium">
              BETWEEN {settings.enterpriseName.toUpperCase()} ("LENDER") AND{' '}
              {loan.borrowerName.toUpperCase()} ("BORROWER")
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              CONTRACT REF: AGR-{loan.id} · EXECUTION DATE:{' '}
              {formatDate(loan.disbursementDate)}
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h2 className="font-bold text-slate-900 uppercase tracking-wide">
              1. Principal Amount & Interest Terms
            </h2>
            <p>
              Subject to the terms and conditions herein, the Lender hereby advances to the Borrower
              the principal sum of{' '}
              <strong>{formatCurrency(loan.principal, settings.currencySymbol)}</strong> (the
              "Principal Amount"). Interest on the outstanding principal balance shall accrue at the
              annual percentage rate (APR) of <strong>{loan.interestRate}%</strong> per annum,
              calculated on an amortized basis over a tenor of{' '}
              <strong>{loan.termMonths} calendar months</strong>.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h2 className="font-bold text-slate-900 uppercase tracking-wide">
              2. Repayment Obligations & Installments
            </h2>
            <p>
              The Borrower unconditionally promises to repay the total sum of{' '}
              <strong>{formatCurrency(loan.totalPayable, settings.currencySymbol)}</strong> in{' '}
              {loan.termMonths} consecutive periodic installments of{' '}
              <strong>{formatCurrency(loan.monthlyInstallment, settings.currencySymbol)}</strong> each.
              The first installment shall become due on <strong>{formatDate(loan.firstPaymentDate)}</strong>,
              and subsequent installments on the corresponding calendar day of each subsequent month
              until the Maturity Date of <strong>{formatDate(loan.maturityDate)}</strong>.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h2 className="font-bold text-slate-900 uppercase tracking-wide">
              3. Collateral Pledge & Security Interest
            </h2>
            {loan.collateral ? (
              <p>
                To secure prompt payment and performance of all obligations hereunder, the Borrower
                hereby grants the Lender a first-priority security lien and encumbrance in and to the
                following collateral asset:{' '}
                <strong>
                  {loan.collateral.type} — {loan.collateral.description}
                </strong>
                , appraised at{' '}
                <strong>
                  {formatCurrency(loan.collateral.appraisedValue, settings.currencySymbol)}
                </strong>{' '}
                (Registry Ref: {loan.collateral.documentRef}).
              </p>
            ) : (
              <p>
                This facility is executed on a general corporate recourse basis backed by the general
                assets and revenue receivables of the Borrower.
              </p>
            )}
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h2 className="font-bold text-slate-900 uppercase tracking-wide">
              4. Default, Late Penalties & Acceleration
            </h2>
            <p>
              Any installment not received within five (5) business days of its due date shall incur a
              late administrative fee of 3.0% of the overdue installment. In the event of
              non-payment exceeding thirty (30) days, the Lender may declare the entire remaining
              unpaid balance immediately due and payable and initiate enforcement proceedings against
              pledged collateral.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-10 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-4">
              <div className="font-bold text-slate-900 uppercase">For the Lender:</div>
              <div className="font-serif italic text-lg text-slate-800 border-b border-slate-400 pb-2">
                {settings.authorizedSignatory}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{settings.authorizedSignatory}</div>
                <div className="text-slate-500">{settings.signatoryTitle}</div>
                <div className="text-slate-500">{settings.enterpriseName}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-slate-900 uppercase">For the Borrower:</div>
              <div className="font-serif italic text-lg text-slate-800 border-b border-slate-400 pb-2">
                {loan.borrowerName}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{loan.borrowerName}</div>
                <div className="text-slate-500">Authorized Officer / Principal</div>
                <div className="text-slate-500">
                  {borrower?.businessName || 'Borrower Account'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
