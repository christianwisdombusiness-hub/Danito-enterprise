import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { X, UserPlus } from 'lucide-react';
import { BorrowerType } from '../types/loan';

interface Props {
  onClose: () => void;
}

export const NewBorrowerModal: React.FC<Props> = ({ onClose }) => {
  const { createBorrower, settings } = useLoanContext();

  const [type, setType] = useState<BorrowerType>('business');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [taxId, setTaxId] = useState('');
  const [creditScore, setCreditScore] = useState<number>(720);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(15000);
  const [employmentStatus, setEmploymentStatus] = useState<any>('business_owner');
  const [employerName, setEmployerName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    createBorrower({
      name,
      type,
      businessName: type === 'business' ? businessName : undefined,
      email,
      phone,
      nationalId,
      taxId: type === 'business' ? taxId : undefined,
      creditScore,
      monthlyIncome,
      employmentStatus,
      employerName,
      address,
      kycStatus: 'verified',
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">Register New Borrower Entity</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Entity Type Toggle */}
          <div className="flex items-center gap-3 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setType('business')}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                type === 'business'
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Commercial / SME Business
            </button>
            <button
              type="button"
              onClick={() => setType('individual')}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                type === 'individual'
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Individual / Professional
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Primary Contact Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jessica Sterling"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                required
              />
            </div>

            {type === 'business' && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Registered Business / Corporate Entity
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sterling Industrial Solutions LLC"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required={type === 'business'}
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jessica@sterling.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Direct Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 789-0123"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                National ID / Passport Ref
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="US-DL-991823"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                required
              />
            </div>

            {type === 'business' && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">Corporate Tax ID / EIN</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="XX-8829104"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">Credit Score (FICO)</label>
              <input
                type="number"
                min={300}
                max={850}
                value={creditScore}
                onChange={(e) => setCreditScore(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Verified Monthly Income ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min={0}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Registered Physical / Commercial Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 500 Commerce Way, Suite 300, Dallas, TX"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              KYC & Relationship Background Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note any verified banking relationships, supplier credit checks, or operational history..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              Complete Client Onboarding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
