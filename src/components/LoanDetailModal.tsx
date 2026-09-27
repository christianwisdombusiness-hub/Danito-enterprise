import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency, formatDate } from '../utils/financial';
import {
  X,
  Printer,
  FileText,
  CreditCard,
  Shield,
  Phone,
  Mail,
  User,
  AlertCircle,
  Plus,
  RefreshCw,
  Building,
} from 'lucide-react';
import { LoanContractModal } from './LoanContractModal';
import { LoanStatementModal } from './LoanStatementModal';
import { RestructureLoanModal } from './RestructureLoanModal';

interface Props {
  loanId: string;
  onClose: () => void;
}

export const LoanDetailModal: React.FC<Props> = ({ loanId, onClose }) => {
  const {
    loans,
    borrowers,
    settings,
    openRecordPaymentModal,
    addCollectionNote,
    updateLoanStatus,
  } = useLoanContext();

  const loan = loans.find((l) => l.id === loanId);
  const borrower = borrowers.find((b) => b.id === loan?.borrowerId);

  // Modals for Statement, Contract, and Restructure
  const [showStatement, setShowStatement] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [showRestructure, setShowRestructure] = useState(false);

  // Collection Note logging
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteType, setNoteType] = useState<any>('phone_call');
  const [noteDetails, setNoteDetails] = useState('');
  const [ptpDate, setPtpDate] = useState('');
  const [ptpAmount, setPtpAmount] = useState<number>(0);

  if (!loan) return null;

  const paidPct = loan.totalPayable > 0 ? (loan.totalPaid / loan.totalPayable) * 100 : 0;

  const handleSaveCollectionNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteDetails.trim()) return;

    addCollectionNote(loan.id, {
      date: new Date().toISOString().split('T')[0],
      officer: settings.authorizedSignatory,
      type: noteType,
      details: noteDetails,
      promisedPaymentDate: ptpDate || undefined,
      promisedAmount: ptpAmount > 0 ? ptpAmount : undefined,
    });

    setNoteDetails('');
    setPtpDate('');
    setPtpAmount(0);
    setIsAddingNote(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold font-mono text-amber-400">{loan.id}</span>
              <span className="text-slate-500">·</span>
              <span className="text-sm font-medium text-slate-200">{loan.productName}</span>
              <span className="text-slate-500">·</span>
              <span
                className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                  loan.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : loan.status === 'in_arrears'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {loan.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStatement(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                title="Print Official Statement of Account"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Statement</span>
              </button>

              <button
                onClick={() => setShowContract(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                title="View Loan Agreement Document"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Agreement</span>
              </button>

              {loan.status !== 'fully_paid' && (
                <button
                  onClick={() => setShowRestructure(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  title="Restructure Loan Tenor & Rate"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restructure</span>
                </button>
              )}

              {loan.status !== 'fully_paid' && (
                <button
                  onClick={() => openRecordPaymentModal(loan.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Collect Payment</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content Scrollable Area */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Top Financial Breakdown Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div>
                <div className="text-xs text-slate-400 font-medium">Disbursed Principal</div>
                <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                  {formatCurrency(loan.principal, settings.currencySymbol)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {loan.interestRate}% APR · {loan.termMonths} mos
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium">Total Paid to Date</div>
                <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
                  {formatCurrency(loan.totalPaid, settings.currencySymbol)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {paidPct.toFixed(1)}% of total payable
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium">Remaining Balance</div>
                <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                  {formatCurrency(loan.remainingBalance, settings.currencySymbol)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {loan.status === 'fully_paid' ? 'Zero balance' : `Next: ${formatDate(loan.nextDueDate)}`}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 font-medium">Monthly Installment</div>
                <div className="text-lg font-bold text-amber-400 font-mono tabular-nums mt-0.5">
                  {formatCurrency(loan.monthlyInstallment, settings.currencySymbol)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {loan.overdueAmount > 0 ? (
                    <span className="text-rose-400 font-mono font-medium">
                      +{formatCurrency(loan.overdueAmount, settings.currencySymbol)} past due ({loan.daysInArrears}d)
                    </span>
                  ) : (
                    'Account in good standing'
                  )}
                </div>
              </div>
            </div>

            {/* Repayment Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Principal Recovery Progress</span>
                <span className="font-mono">{paidPct.toFixed(1)}% Satisfied</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(1, paidPct))}%` }}
                />
              </div>
            </div>

            {/* Borrower & Security Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Borrower Profile Card */}
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Borrower Information
                </div>
                <div className="flex items-center gap-3 pt-1">
                  {borrower?.avatarUrl ? (
                    <img
                      src={borrower.avatarUrl}
                      alt={borrower.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-white">{loan.borrowerName}</div>
                    <div className="text-xs text-slate-400">{borrower?.address}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{borrower?.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{borrower?.email || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Collateral & Underwriting Security Card */}
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Facility Security & Collateral
                </div>
                {loan.collateral ? (
                  <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Asset Category:</span>
                      <span className="font-medium text-white">{loan.collateral.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Description:</span>
                      <span className="truncate max-w-[240px] text-right">
                        {loan.collateral.description}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Appraised Valuation:</span>
                      <span className="font-mono font-semibold text-emerald-400">
                        {formatCurrency(loan.collateral.appraisedValue, settings.currencySymbol)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lien Registration:</span>
                      <span className="font-mono text-slate-400">{loan.collateral.documentRef}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-3">
                    Unsecured Facility (No specific asset pledge registered).
                  </div>
                )}
              </div>
            </div>

            {/* Complete Amortization Schedule Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Amortization Schedule</h3>
                <span className="text-xs text-slate-400 font-mono">
                  {loan.schedule.filter((s) => s.status === 'paid').length} of{' '}
                  {loan.schedule.length} installments settled
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 sticky top-0 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2.5">#</th>
                      <th className="px-3 py-2.5">Due Date</th>
                      <th className="px-3 py-2.5 text-right">Principal</th>
                      <th className="px-3 py-2.5 text-right">Interest</th>
                      <th className="px-3 py-2.5 text-right">Total Installment</th>
                      <th className="px-3 py-2.5 text-right">Paid</th>
                      <th className="px-3 py-2.5 text-right">Balance</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {loan.schedule.map((inst) => (
                      <tr key={inst.installmentNumber} className="hover:bg-slate-800/30">
                        <td className="px-3 py-2 font-mono text-slate-400">
                          {inst.installmentNumber}
                        </td>
                        <td className="px-3 py-2 font-mono">{formatDate(inst.dueDate)}</td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {formatCurrency(inst.principalDue, settings.currencySymbol)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-amber-400/80">
                          {formatCurrency(inst.interestDue, settings.currencySymbol)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-white">
                          {formatCurrency(inst.totalInstallment, settings.currencySymbol)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-emerald-400">
                          {inst.paidAmount > 0
                            ? formatCurrency(inst.paidAmount, settings.currencySymbol)
                            : '—'}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-400">
                          {formatCurrency(inst.remainingPrincipal, settings.currencySymbol)}
                        </td>
                        <td className="px-3 py-2">
                          {inst.status === 'paid' ? (
                            <span className="text-emerald-400 font-medium">Paid</span>
                          ) : inst.status === 'overdue' ? (
                            <span className="text-rose-400 font-semibold font-mono">
                              Overdue (+{formatCurrency(inst.lateFee, settings.currencySymbol)})
                            </span>
                          ) : inst.status === 'partial' ? (
                            <span className="text-amber-400 font-medium">Partial</span>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Collection Notes Log */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    Collections & Servicing Log
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    ({loan.collectionNotes?.length || 0} entries)
                  </span>
                </div>
                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Note</span>
                </button>
              </div>

              {isAddingNote && (
                <form
                  onSubmit={handleSaveCollectionNote}
                  className="p-4 bg-slate-950 border border-slate-700 rounded-lg space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Contact Method</label>
                      <select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                      >
                        <option value="phone_call">Phone Call</option>
                        <option value="formal_notice">Formal Demand Notice</option>
                        <option value="in_person_visit">In-Person Audit Visit</option>
                        <option value="promise_to_pay">Promise to Pay (PTP)</option>
                        <option value="restructure_discussion">Restructure Discussion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        PTP Settlement Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={ptpDate}
                        onChange={(e) => setPtpDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                      >
                      </input>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Promised Amount ({settings.currencySymbol})
                      </label>
                      <input
                        type="number"
                        value={ptpAmount}
                        onChange={(e) => setPtpAmount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Servicing Note Details
                    </label>
                    <textarea
                      rows={2}
                      value={noteDetails}
                      onChange={(e) => setNoteDetails(e.target.value)}
                      placeholder="Record discussion with borrower, commitments made, or reasons for delay..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded"
                    >
                      Save Entry
                    </button>
                  </div>
                </form>
              )}

              {loan.collectionNotes && loan.collectionNotes.length > 0 ? (
                <div className="space-y-2">
                  {loan.collectionNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200 capitalize">
                            {note.type.replace('_', ' ')}
                          </span>
                          <span>·</span>
                          <span>{formatDate(note.date)}</span>
                          <span>·</span>
                          <span className="text-slate-400">{note.officer}</span>
                        </div>
                        {note.promisedAmount && (
                          <span className="text-amber-400 font-mono font-medium">
                            PTP: {formatCurrency(note.promisedAmount, settings.currencySymbol)} by{' '}
                            {formatDate(note.promisedPaymentDate || '')}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300">{note.details}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2">
                  No servicing or collection notes recorded for this facility yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Child Modals */}
      {showStatement && (
        <LoanStatementModal loan={loan} borrower={borrower} onClose={() => setShowStatement(false)} />
      )}

      {showContract && (
        <LoanContractModal loan={loan} borrower={borrower} onClose={() => setShowContract(false)} />
      )}

      {showRestructure && (
        <RestructureLoanModal loan={loan} onClose={() => setShowRestructure(false)} />
      )}
    </>
  );
};
