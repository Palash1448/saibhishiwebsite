import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { MemberFormModal } from '../../components/members/MemberFormModal';
import { IssueLoanModal } from '../../components/loans/IssueLoanModal';
import { RecordCollectionModal } from '../../components/collections/RecordCollectionModal';
import { CreditInterestModal } from '../../components/returns/CreditInterestModal';
import { formatCurrency, formatDate, maskSensitiveId } from '../../utils/formatters';
import { generateMemberStatement } from '../../services/reportService';
import { exportToCSV } from '../../utils/exportUtils';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  CircleDollarSign,
  TrendingUp,
  Clock,
  Printer,
  Edit2,
  Plus,
  Receipt,
  Percent,
  Layers,
  ShieldCheck,
  Download,
} from 'lucide-react';

export const MemberProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { members, collections, loans, transactions, businessSettings, refreshAll } = useData();
  const { onShowReceipt } = useOutletContext<{ onShowReceipt: (data: any) => void }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'collections' | 'loans' | 'transactions' | 'interest'>('collections');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isCreditInterestModalOpen, setIsCreditInterestModalOpen] = useState(false);

  const member = members.find((m) => m.id === id || m.memberCode === id);

  if (!member) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto mt-12">
        <h3 className="text-base font-bold text-slate-900">Member Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The member account could not be located in database.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/members')} className="mt-4">
          Back to Members
        </Button>
      </div>
    );
  }

  const statement = generateMemberStatement(member, collections, loans, transactions);

  const handlePrintStatement = () => {
    window.print();
  };

  const handleExportStatementCSV = () => {
    exportToCSV(
      `Statement_${member.memberCode}`,
      statement.transactions.map((t) => ({
        'Date': t.date,
        'Txn Number': t.transactionNumber,
        'Type': t.type,
        'Category': t.category,
        'Amount (₹)': t.amount,
        'Payment Mode': t.paymentMethod,
        'Reference': t.referenceNumber || '',
        'Description': t.description,
      }))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="no-print">
        <Breadcrumb
          items={[
            { label: 'Members', href: '/members' },
            { label: `${member.fullName} (${member.memberCode})` },
          ]}
        />
      </div>

      {/* Profile Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
              {member.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                  {member.fullName}
                </h1>
                <Badge variant={getStatusBadgeVariant(member.status)} size="sm">
                  {member.status}
                </Badge>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Member ID: <span className="font-bold text-slate-800">{member.memberCode}</span> • Enrolled since {formatDate(member.joiningDate)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap no-print">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrintStatement}
            >
              Print Statement
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit2 className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<CircleDollarSign className="w-4 h-4" />}
              onClick={() => setIsCollectionModalOpen(true)}
            >
              + Collect Dues
            </Button>

            <Button
              variant="navy"
              size="sm"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={() => setIsLoanModalOpen(true)}
            >
              + Issue Loan
            </Button>
          </div>
        </div>

        {/* Member KYC & Contact Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-semibold">Mobile Phone</span>
            <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{member.mobile}</span>
            </p>
            {member.alternateMobile && (
              <p className="text-[11px] text-slate-500">Alt: {member.alternateMobile}</p>
            )}
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold">Location / Address</span>
            <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{member.villageCity || '—'} {member.pincode ? `(${member.pincode})` : ''}</span>
            </p>
            <p className="text-[11px] text-slate-500 truncate">{member.address || '—'}</p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold">KYC / Identity Doc</span>
            <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>{member.idProofType || 'Aadhaar'}</span>
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              {maskSensitiveId(member.idProofRef, member.idProofType)}
            </p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold">Bhishi Plan Details</span>
            <p className="font-semibold text-slate-900 mt-0.5 truncate">
              {member.bhishiPlanName || 'General Savings'}
            </p>
            <p className="text-[11px] text-emerald-700 font-bold">
              ₹{member.monthlyContribution.toLocaleString('en-IN')}/mo (Due: {member.paymentDueDay}th)
            </p>
          </div>
        </div>
      </div>

      {/* 6 Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Invested</p>
          <p className="text-lg font-bold font-mono text-emerald-700 mt-1">
            {formatCurrency(statement.totalInvested)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Returns</p>
          <p className="text-lg font-bold font-mono text-purple-700 mt-1">
            {formatCurrency(statement.totalReturns)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Loans Availed</p>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1">
            {formatCurrency(statement.totalLoansTaken)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Loan Repaid</p>
          <p className="text-lg font-bold font-mono text-emerald-600 mt-1">
            {formatCurrency(statement.totalLoansRepaid)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Outstanding Loan</p>
          <p className="text-lg font-bold font-mono text-amber-700 mt-1">
            {formatCurrency(statement.currentOutstandingBalance)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Net Portfolio</p>
          <p className="text-lg font-extrabold font-mono text-indigo-700 mt-1">
            {formatCurrency(statement.totalInvested + statement.totalReturns - statement.currentOutstandingBalance)}
          </p>
        </div>
      </div>

      {/* Tabbed Financial Records */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('collections')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'collections'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Bhishi Collections ({statement.collections.length})
            </button>

            <button
              onClick={() => setActiveTab('loans')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'loans'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Loans & EMIs ({statement.loans.length})
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              All Transactions ({statement.transactions.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Percent className="w-3.5 h-3.5" />}
              onClick={() => setIsCreditInterestModalOpen(true)}
            >
              Credit Interest
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportStatementCSV}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Tab Content 1: Collections */}
        {activeTab === 'collections' && (
          <div className="p-4 sm:p-6">
            {statement.collections.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No collections recorded for this member yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Installment Month</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Paid Date</th>
                      <th className="py-3 px-4">Mode & Ref</th>
                      <th className="py-3 px-4">Receipt #</th>
                      <th className="py-3 px-4 text-right">Amount (₹)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statement.collections.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-semibold text-slate-900">{c.monthYearLabel}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(c.dueDate)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(c.paymentDate)}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{c.paymentMethod || '—'}</span>
                          {c.referenceNumber && (
                            <span className="block text-[10px] text-slate-400 font-mono">{c.referenceNumber}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-emerald-700">{c.receiptNumber || '—'}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(c.paidAmount || c.expectedAmount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={getStatusBadgeVariant(c.status)} size="sm">
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Loans */}
        {activeTab === 'loans' && (
          <div className="p-4 sm:p-6 space-y-6">
            {statement.loans.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No loans issued to this member.</p>
            ) : (
              statement.loans.map((loan) => (
                <div key={loan.id} className="rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{loan.loanNumber}</h4>
                        <Badge variant={getStatusBadgeVariant(loan.status)} size="sm">
                          {loan.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sanctioned on {formatDate(loan.issueDate)} • {loan.calculationMethod === 'flat' ? 'Flat Interest' : 'Reducing Balance'} @ {loan.monthlyInterestRate}%/mo
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">Outstanding Due</p>
                      <p className="text-base font-bold font-mono text-amber-700">
                        {formatCurrency(loan.outstandingTotal)}
                      </p>
                    </div>
                  </div>

                  {/* Installment breakdown table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Due Date</th>
                          <th className="py-2 px-3">Principal</th>
                          <th className="py-2 px-3">Interest</th>
                          <th className="py-2 px-3">EMI Amount</th>
                          <th className="py-2 px-3">Paid Amount</th>
                          <th className="py-2 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loan.installments.map((inst) => (
                          <tr key={inst.installmentNumber} className="hover:bg-slate-50/60">
                            <td className="py-2 px-3 font-semibold">Month {inst.installmentNumber}</td>
                            <td className="py-2 px-3">{formatDate(inst.dueDate)}</td>
                            <td className="py-2 px-3 font-mono">{formatCurrency(inst.principalAmount)}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{formatCurrency(inst.interestAmount)}</td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">{formatCurrency(inst.totalInstallment)}</td>
                            <td className="py-2 px-3 font-mono font-semibold text-emerald-700">{formatCurrency(inst.paidAmount)}</td>
                            <td className="py-2 px-3 text-center">
                              <Badge variant={getStatusBadgeVariant(inst.status)} size="sm">
                                {inst.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content 3: Transactions */}
        {activeTab === 'transactions' && (
          <div className="p-4 sm:p-6">
            {statement.transactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No transaction history recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Txn #</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Particulars</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statement.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">#{t.transactionNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(t.date)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusBadgeVariant(t.type)} size="sm">
                            {t.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{t.description}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{t.paymentMethod}</td>
                        <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${t.category === 'inflow' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.category === 'inflow' ? '+' : '-'}{formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      {isEditModalOpen && (
        <MemberFormModal
          isOpen={true}
          memberToEdit={member}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Issue Loan Modal */}
      {isLoanModalOpen && (
        <IssueLoanModal
          isOpen={true}
          preselectedMemberId={member.id}
          onClose={() => setIsLoanModalOpen(false)}
        />
      )}

      {/* Collection Modal */}
      {isCollectionModalOpen && (
        <RecordCollectionModal
          isOpen={true}
          onClose={() => setIsCollectionModalOpen(false)}
          onSuccessReceipt={onShowReceipt}
        />
      )}

      {/* Credit Interest Modal */}
      {isCreditInterestModalOpen && (
        <CreditInterestModal
          isOpen={true}
          preselectedMember={member}
          onClose={() => setIsCreditInterestModalOpen(false)}
        />
      )}
    </div>
  );
};
