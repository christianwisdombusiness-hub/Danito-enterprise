import React, { useState, useMemo } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { formatCurrency, formatDate, generateAmortizationSchedule } from '../utils/financial';
import { Calculator, DollarSign, Download, ArrowRight, Zap, TrendingDown } from 'lucide-react';
import { InterestType, RepaymentFrequency } from '../types/loan';

export const AmortizationCalculatorView: React.FC = () => {
  const { settings, setActiveTab } = useLoanContext();

  const [principal, setPrincipal] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(10.5);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [frequency, setFrequency] = useState<RepaymentFrequency>('monthly');
  const [interestType, setInterestType] = useState<InterestType>('amortized_reducing');
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0);

  // Standard Schedule
  const standardCalc = useMemo(() => {
    return generateAmortizationSchedule(
      principal,
      interestRate,
      termMonths,
      new Date().toISOString().split('T')[0],
      interestType,
      frequency
    );
  }, [principal, interestRate, termMonths, interestType, frequency]);

  // Accelerated Schedule with Extra Prepayment
  const acceleratedCalc = useMemo(() => {
    if (extraMonthlyPayment <= 0 || interestType === 'flat_rate') {
      return {
        monthsToPayoff: termMonths,
        totalInterestSaved: 0,
        totalInterest: standardCalc.totalInterest,
      };
    }

    const periodicRate = (interestRate / 100) / 12;
    let balance = principal;
    let totalInt = 0;
    let months = 0;
    const basePayment = standardCalc.periodicInstallment;
    const totalPayment = basePayment + extraMonthlyPayment;

    while (balance > 0 && months < termMonths * 2) {
      months++;
      const interestDue = balance * periodicRate;
      const principalDue = Math.min(balance, totalPayment - interestDue);
      totalInt += interestDue;
      balance = Math.max(0, balance - principalDue);
      if (balance <= 0) break;
    }

    const interestSaved = Math.max(0, standardCalc.totalInterest - totalInt);
    return {
      monthsToPayoff: months,
      totalInterestSaved: Math.round(interestSaved * 100) / 100,
      totalInterest: Math.round(totalInt * 100) / 100,
    };
  }, [principal, interestRate, termMonths, extraMonthlyPayment, standardCalc, interestType]);

  const principalRatio =
    standardCalc.totalPayable > 0
      ? (principal / standardCalc.totalPayable) * 100
      : 100;
  const interestRatio = 100 - principalRatio;

  const downloadScheduleCSV = () => {
    const headers = ['Installment #', 'Due Date', 'Principal Due', 'Interest Due', 'Total Installment', 'Remaining Principal'];
    const rows = standardCalc.schedule.map((inst) => [
      inst.installmentNumber,
      inst.dueDate,
      inst.principalDue.toFixed(2),
      inst.interestDue.toFixed(2),
      inst.totalInstallment.toFixed(2),
      inst.remainingPrincipal.toFixed(2),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Amortization_Schedule_${principal}_${termMonths}M.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Enterprise Financial Amortization Engine
          </h1>
          <p className="text-sm text-slate-400">
            Simulate term facilities, compare reducing balance vs flat interest, and model accelerated debt payoff.
          </p>
        </div>

        <button
          onClick={downloadScheduleCSV}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Schedule CSV</span>
        </button>
      </div>

      {/* Simulator Inputs & Result Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Facility Parameters</span>
          </h2>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Principal Amount</span>
              <span className="font-mono font-bold text-amber-400">
                {formatCurrency(principal, settings.currencySymbol)}
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={1000000}
              step={5000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <input
              type="number"
              step={1000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Annual Interest Rate (APR)</span>
              <span className="font-mono font-bold text-amber-400">{interestRate}%</span>
            </div>
            <input
              type="range"
              min={2}
              max={36}
              step={0.25}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <input
              type="number"
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Tenor / Term (Months)</span>
              <span className="font-mono font-bold text-amber-400">{termMonths} Months</span>
            </div>
            <input
              type="range"
              min={3}
              max={84}
              step={1}
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <input
              type="number"
              min={1}
              max={120}
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Interest Formula</label>
              <select
                value={interestType}
                onChange={(e) => setInterestType(e.target.value as InterestType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
              >
                <option value="amortized_reducing">Amortized Reducing</option>
                <option value="flat_rate">Flat Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Repayment Cadence</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RepaymentFrequency)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
              >
                <option value="monthly">Monthly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Extra Prepayment Simulator */}
          <div className="p-3.5 bg-slate-900 border border-emerald-500/30 rounded-lg space-y-2 mt-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Accelerated Early Payoff Simulator</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Extra monthly principal prepayments:
            </div>
            <input
              type="number"
              min={0}
              step={50}
              value={extraMonthlyPayment}
              onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
              placeholder="e.g. 250"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white font-mono"
            />
            {extraMonthlyPayment > 0 && (
              <div className="text-[11px] text-emerald-300 font-mono pt-1 border-t border-slate-800 space-y-0.5">
                <div>
                  Paid off in:{' '}
                  <span className="font-bold text-white">
                    {acceleratedCalc.monthsToPayoff} months
                  </span>{' '}
                  ({termMonths - acceleratedCalc.monthsToPayoff} months earlier!)
                </div>
                <div>
                  Interest Saved:{' '}
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(acceleratedCalc.totalInterestSaved, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results & Schedule Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Periodic Installment</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
                {formatCurrency(standardCalc.periodicInstallment, settings.currencySymbol)}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 capitalize">Per {frequency} period</div>
            </div>

            <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Total Interest Accrued</div>
              <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums mt-1">
                {formatCurrency(standardCalc.totalInterest, settings.currencySymbol)}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {interestRatio.toFixed(1)}% of total repayment
              </div>
            </div>

            <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Total Repayment Obligation</div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
                {formatCurrency(standardCalc.totalPayable, settings.currencySymbol)}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Principal + Interest</div>
            </div>
          </div>

          {/* Visual Breakdown Bar */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-white">Payment Composition Breakdown</span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-sky-400">Principal: {principalRatio.toFixed(1)}%</span>
                <span className="text-amber-400">Interest: {interestRatio.toFixed(1)}%</span>
              </div>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-3 flex overflow-hidden">
              <div
                className="bg-sky-400 h-full"
                style={{ width: `${principalRatio}%` }}
                title={`Principal: ${principalRatio.toFixed(1)}%`}
              />
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${interestRatio}%` }}
                title={`Interest: ${interestRatio.toFixed(1)}%`}
              />
            </div>
          </div>

          {/* Dynamic Installment Schedule Table */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Calculated Installment Amortization Table
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {standardCalc.schedule.length} Installments
              </span>
            </div>

            <div className="border border-slate-700 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 sticky top-0 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-700">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Due Date</th>
                    <th className="px-3 py-2 text-right">Principal</th>
                    <th className="px-3 py-2 text-right">Interest</th>
                    <th className="px-3 py-2 text-right">Total Installment</th>
                    <th className="px-3 py-2 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {standardCalc.schedule.map((inst) => (
                    <tr key={inst.installmentNumber} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2 font-mono text-slate-400">{inst.installmentNumber}</td>
                      <td className="px-3 py-2 font-mono">{formatDate(inst.dueDate)}</td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-200">
                        {formatCurrency(inst.principalDue, settings.currencySymbol)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-amber-400/90">
                        {formatCurrency(inst.interestDue, settings.currencySymbol)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-white">
                        {formatCurrency(inst.totalInstallment, settings.currencySymbol)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-400">
                        {formatCurrency(inst.remainingPrincipal, settings.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('origination')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                <span>Originate Facility With These Terms</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
