import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { CalculationMethod } from '../types/bhishi';
import { LoanCalculationMethod } from '../types/loan';
import {
  calculateMaturityAmount,
  calculateEMI,
  generateRepaymentSchedule,
  calculateInvestmentReturn,
} from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Calculator, Coins, CreditCard, Percent, ArrowRight, Printer } from 'lucide-react';

export const CalculatorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bhishi' | 'loan' | 'interest'>('bhishi');

  // Bhishi State
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [durationMonths, setDurationMonths] = useState<number>(20);
  const [bhishiRate, setBhishiRate] = useState<number>(12);
  const [bhishiMethod, setBhishiMethod] = useState<CalculationMethod>('simple');

  // Loan State
  const [loanPrincipal, setLoanPrincipal] = useState<number>(100000);
  const [monthlyLoanRate, setMonthlyLoanRate] = useState<number>(2); // 2% per month
  const [loanTenure, setLoanTenure] = useState<number>(12);
  const [loanMethod, setLoanMethod] = useState<LoanCalculationMethod>('flat');
  const [processingFee, setProcessingFee] = useState<number>(1);

  // General Interest State
  const [principalAmount, setPrincipalAmount] = useState<number>(50000);
  const [annualRate, setAnnualRate] = useState<number>(12);
  const [interestPeriodMonths, setInterestPeriodMonths] = useState<number>(12);

  // Calculations
  const bhishiResult = calculateMaturityAmount(
    monthlyContribution,
    durationMonths,
    bhishiRate,
    bhishiMethod
  );

  const loanResult = calculateEMI(
    loanPrincipal,
    monthlyLoanRate,
    loanTenure,
    loanMethod,
    processingFee
  );

  const schedule = generateRepaymentSchedule(
    loanPrincipal,
    monthlyLoanRate,
    loanTenure,
    new Date().toISOString().slice(0, 10),
    loanMethod
  );

  const interestResult = calculateInvestmentReturn(
    principalAmount,
    annualRate,
    interestPeriodMonths,
    'simple'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-card">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Financial Calculation Engines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate Bhishi maturities, generate loan amortization tables, and calculate compound returns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bhishi')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bhishi'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" /> Bhishi Maturity
          </button>

          <button
            onClick={() => setActiveTab('loan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'loan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Loan EMI Schedule
          </button>

          <button
            onClick={() => setActiveTab('interest')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'interest'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Percent className="w-4 h-4" /> Yield Calculator
          </button>
        </div>
      </div>

      {/* 1. BHISHI MATURITY CALCULATOR */}
      {activeTab === 'bhishi' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
              Bhishi Scheme Parameters
            </h2>

            <Input
              label="Monthly Contribution (₹)"
              type="number"
              prefixText="₹"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            />

            <Input
              label="Duration in Months"
              type="number"
              min={1}
              max={60}
              suffixText="Months"
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
            />

            <Input
              label="Annual Return / Interest Rate (%)"
              type="number"
              step="0.1"
              suffixText="% p.a."
              value={bhishiRate}
              onChange={(e) => setBhishiRate(Number(e.target.value))}
            />

            <Select
              label="Return Calculation Method"
              value={bhishiMethod}
              onChange={(e) => setBhishiMethod(e.target.value as any)}
              options={[
                { value: 'simple', label: 'Recurring Simple Interest (Standard)' },
                { value: 'compounded_annual', label: 'Compounded Annual Yield' },
                { value: 'fixed_bonus', label: 'Fixed Completion Bonus %' },
                { value: 'flat_rate', label: 'Flat Proportional Rate' },
              ]}
            />
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-navy-950 p-6 sm:p-8 rounded-3xl text-white shadow-elevated border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold">Maturity & Profit Summary</h3>
                  <p className="text-xs text-emerald-400 mt-0.5">
                    Calculated for ₹{monthlyContribution.toLocaleString('en-IN')}/mo over {durationMonths} months
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold">
                  {bhishiRate}% p.a. Return
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center mb-6">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Total Deposited</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {formatCurrency(bhishiResult.totalPrincipal)}
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Total Interest Yield</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
                    +{formatCurrency(bhishiResult.totalInterest)}
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 col-span-2 sm:col-span-1">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Monthly Avg Profit</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-purple-300 mt-1">
                    {formatCurrency(bhishiResult.monthlyAverageInterest)}/mo
                  </p>
                </div>
              </div>

              <div className="bg-emerald-950/80 p-5 rounded-2xl border border-emerald-600/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Total Maturity Payout</p>
                  <p className="text-xs text-emerald-200 mt-0.5">Principal + Total Net Interest Return</p>
                </div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
                  {formatCurrency(bhishiResult.maturityAmount)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-6">
              * Calculations are based on monthly recurring savings formula with configured compounding frequency.
            </p>
          </div>
        </div>
      )}

      {/* 2. LOAN EMI & AMORTIZATION CALCULATOR */}
      {activeTab === 'loan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
                Loan Parameters
              </h2>

              <Input
                label="Principal Loan Amount (₹)"
                type="number"
                prefixText="₹"
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(Number(e.target.value))}
              />

              <Input
                label="Monthly Interest Rate (%)"
                type="number"
                step="0.01"
                suffixText="% / month"
                value={monthlyLoanRate}
                onChange={(e) => setMonthlyLoanRate(Number(e.target.value))}
                helperText={`Annual Equivalent: ${(monthlyLoanRate * 12).toFixed(2)}% p.a.`}
              />

              <Input
                label="Tenure in Months"
                type="number"
                min={1}
                max={60}
                suffixText="Months"
                value={loanTenure}
                onChange={(e) => setLoanTenure(Number(e.target.value))}
              />

              <Select
                label="Calculation Method"
                value={loanMethod}
                onChange={(e) => setLoanMethod(e.target.value as any)}
                options={[
                  { value: 'flat', label: 'Flat Interest Rate (Simple Installments)' },
                  { value: 'reducing_balance', label: 'Reducing Balance (Standard Bank EMI)' },
                ]}
              />

              <Input
                label="Processing Fee (%)"
                type="number"
                step="0.1"
                suffixText="%"
                value={processingFee}
                onChange={(e) => setProcessingFee(Number(e.target.value))}
              />
            </div>

            {/* Results Display */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-navy-950 p-6 sm:p-8 rounded-3xl text-white shadow-elevated border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold">Loan EMI & Cost Breakdown</h3>
                    <p className="text-xs text-emerald-400 mt-0.5">
                      {loanMethod === 'flat' ? 'Flat Rate Method' : 'Reducing Balance EMI Method'}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full font-bold">
                    {monthlyLoanRate}% / Month Rate
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Monthly EMI</p>
                    <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      {formatCurrency(loanResult.monthlyInstallment)}
                    </p>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Total Interest</p>
                    <p className="text-xl font-bold font-mono text-amber-300 mt-1">
                      {formatCurrency(loanResult.totalInterest)}
                    </p>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Processing Fee</p>
                    <p className="text-xl font-bold font-mono text-slate-300 mt-1">
                      {formatCurrency(loanResult.processingFee)}
                    </p>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Total Payable</p>
                    <p className="text-xl font-bold font-mono text-white mt-1">
                      {formatCurrency(loanResult.totalPayable)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Amortization Schedule */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Simulated Amortization Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                  <tr>
                    <th className="py-2.5 px-4">Installment #</th>
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4 text-right">Principal Part</th>
                    <th className="py-2.5 px-4 text-right">Interest Part</th>
                    <th className="py-2.5 px-4 text-right">Total Installment</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {schedule.map((inst) => (
                    <tr key={inst.installmentNumber} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold">Month {inst.installmentNumber}</td>
                      <td className="py-2.5 px-4">{formatDate(inst.dueDate)}</td>
                      <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(inst.principalAmount)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500">{formatCurrency(inst.interestAmount)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(inst.totalInstallment)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. YIELD / INTEREST CALCULATOR */}
      {activeTab === 'interest' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
              Principal & Yield Parameters
            </h2>

            <Input
              label="Principal Sum (₹)"
              type="number"
              prefixText="₹"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(Number(e.target.value))}
            />

            <Input
              label="Annual Return Rate (%)"
              type="number"
              step="0.1"
              suffixText="% p.a."
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
            />

            <Input
              label="Period in Months"
              type="number"
              min={1}
              max={60}
              suffixText="Months"
              value={interestPeriodMonths}
              onChange={(e) => setInterestPeriodMonths(Number(e.target.value))}
            />
          </div>

          <div className="lg:col-span-2 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-elevated border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-4">Simple & Annualized Return</h3>
              <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <div className="bg-slate-800 p-4 rounded-2xl">
                  <p className="text-xs text-slate-400">Total Interest Earned</p>
                  <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    +{formatCurrency(interestResult.interestAmount)}
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl">
                  <p className="text-xs text-slate-400">Total Capital Payout</p>
                  <p className="text-2xl font-bold font-mono text-white mt-1">
                    {formatCurrency(interestResult.totalReturn)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
