import { Loan, LoanInstallment, LoanCalculationMethod, LoanRepaymentPayload } from '../types/loan';
import { fetchCollection, fetchDocById, saveDoc } from '../firebase/firestore';
import { calculateEMI, generateRepaymentSchedule, calculateOutstandingBalance } from '../utils/calculations';
import { generateLoanNumber, generateReceiptNumber } from '../utils/receiptGenerator';
import { recordTransaction } from './transactionService';
import { getMemberById, updateMember } from './memberService';
import { logAuditEvent } from './settingsService';

const COLLECTION = 'loans';

export async function getAllLoans(): Promise<Loan[]> {
  const loans = await fetchCollection<Loan>(COLLECTION);
  return loans.sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''));
}

export async function getLoanById(id: string): Promise<Loan | null> {
  return await fetchDocById<Loan>(COLLECTION, id);
}

export async function issueLoan(
  payload: {
    memberId: string;
    memberName: string;
    memberCode: string;
    principalAmount: number;
    monthlyInterestRate: number; // Configurable per loan e.g. 1.5%, 2%, 2.5%
    durationMonths: number;
    calculationMethod: LoanCalculationMethod; // 'flat' | 'reducing_balance'
    issueDate: string;
    firstDueDate: string;
    processingFeeRate?: number; // e.g. 1%
    paymentMethod: any;
    referenceNumber?: string;
    purpose?: string;
    guarantorName?: string;
    guarantorMobile?: string;
    notes?: string;
  },
  adminName = 'Admin'
): Promise<Loan> {
  const all = await getAllLoans();
  const loanNumber = generateLoanNumber(all.length);
  const id = `LN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const emiCalc = calculateEMI(
    payload.principalAmount,
    payload.monthlyInterestRate,
    payload.durationMonths,
    payload.calculationMethod,
    payload.processingFeeRate || 0
  );

  const installments = generateRepaymentSchedule(
    payload.principalAmount,
    payload.monthlyInterestRate,
    payload.durationMonths,
    payload.issueDate,
    payload.calculationMethod
  );

  const newLoan: Loan = {
    id,
    loanNumber,
    memberId: payload.memberId,
    memberName: payload.memberName,
    memberCode: payload.memberCode,
    principalAmount: emiCalc.principal,
    monthlyInterestRate: payload.monthlyInterestRate,
    annualInterestRate: emiCalc.annualInterestRate,
    calculationMethod: payload.calculationMethod,
    durationMonths: payload.durationMonths,
    numberOfInstallments: payload.durationMonths,
    monthlyInstallment: emiCalc.monthlyInstallment,
    processingFee: emiCalc.processingFee,
    totalInterest: emiCalc.totalInterest,
    totalPayable: emiCalc.totalPayable,
    issueDate: payload.issueDate,
    firstDueDate: payload.firstDueDate || installments[0]?.dueDate,
    disbursementPaymentMethod: payload.paymentMethod,
    disbursementRefNumber: payload.referenceNumber,
    totalPrincipalPaid: 0,
    totalInterestPaid: 0,
    totalAmountPaid: 0,
    outstandingPrincipal: emiCalc.principal,
    outstandingInterest: emiCalc.totalInterest,
    outstandingTotal: emiCalc.principal + emiCalc.totalInterest,
    status: 'active',
    purpose: payload.purpose,
    guarantorName: payload.guarantorName,
    guarantorMobile: payload.guarantorMobile,
    notes: payload.notes,
    installments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    disbursedBy: adminName,
  };

  // 1. Record Loan Disbursement Outflow Transaction
  await recordTransaction({
    memberId: payload.memberId,
    memberName: payload.memberName,
    memberCode: payload.memberCode,
    type: 'Loan Disbursement',
    category: 'outflow',
    amount: payload.principalAmount,
    date: payload.issueDate,
    paymentMethod: payload.paymentMethod,
    referenceNumber: payload.referenceNumber,
    relatedEntityId: newLoan.id,
    description: `Loan #${loanNumber} Disbursed (${payload.calculationMethod === 'flat' ? 'Flat Rate' : 'Reducing Balance'} @ ${payload.monthlyInterestRate}%/mo)`,
    createdBy: adminName,
  });

  // 2. If processing fee was charged, record as Inflow Transaction
  if (emiCalc.processingFee > 0) {
    await recordTransaction({
      memberId: payload.memberId,
      memberName: payload.memberName,
      memberCode: payload.memberCode,
      type: 'Processing Fee',
      category: 'inflow',
      amount: emiCalc.processingFee,
      date: payload.issueDate,
      paymentMethod: payload.paymentMethod,
      relatedEntityId: newLoan.id,
      description: `Processing fee for Loan #${loanNumber}`,
      createdBy: adminName,
    });
  }

  // 3. Save loan document
  await saveDoc(COLLECTION, newLoan);

  // 4. Update member totals
  const member = await getMemberById(payload.memberId);
  if (member) {
    await updateMember(payload.memberId, {
      totalLoanTaken: (member.totalLoanTaken || 0) + payload.principalAmount,
      outstandingLoan: (member.outstandingLoan || 0) + (payload.principalAmount + emiCalc.totalInterest),
    }, adminName);
  }

  await logAuditEvent({
    action: 'Issue Loan',
    module: 'loans',
    details: `Disbursed loan #${loanNumber} of ₹${payload.principalAmount} to ${payload.memberName} (${payload.memberCode}) @ ${payload.monthlyInterestRate}%/mo for ${payload.durationMonths} months`,
    entityId: newLoan.id,
    entityType: 'Loan',
    performedBy: adminName,
    newData: newLoan,
  });

  return newLoan;
}

export async function recordLoanRepayment(
  loanId: string,
  repayment: LoanRepaymentPayload,
  adminName = 'Admin'
): Promise<{ loan: Loan; receiptNumber: string }> {
  const loan = await getLoanById(loanId);
  if (!loan) throw new Error('Loan not found');

  const receiptNumber = generateReceiptNumber('LN-REC');
  let amountToDistribute = repayment.amount;
  const updatedInstallments = [...loan.installments];

  let principalRepaidThisSession = 0;
  let interestRepaidThisSession = 0;

  for (let i = 0; i < updatedInstallments.length && amountToDistribute > 0; i++) {
    const inst = updatedInstallments[i];
    if (inst.status === 'paid') continue;

    const remainingOnInst = inst.remainingAmount;
    if (amountToDistribute >= remainingOnInst) {
      // Full payment of this installment
      const unPaidRatio = inst.totalInstallment > 0 ? remainingOnInst / inst.totalInstallment : 1;
      principalRepaidThisSession += inst.principalAmount * unPaidRatio;
      interestRepaidThisSession += inst.interestAmount * unPaidRatio;

      inst.paidAmount += remainingOnInst;
      inst.remainingAmount = 0;
      inst.status = 'paid';
      inst.paidDate = repayment.paymentDate;
      inst.paymentMethod = repayment.paymentMethod;
      inst.referenceNumber = repayment.referenceNumber;
      inst.receiptNumber = receiptNumber;

      amountToDistribute -= remainingOnInst;
    } else {
      // Partial payment
      const unPaidRatio = inst.totalInstallment > 0 ? amountToDistribute / inst.totalInstallment : 1;
      principalRepaidThisSession += inst.principalAmount * unPaidRatio;
      interestRepaidThisSession += inst.interestAmount * unPaidRatio;

      inst.paidAmount += amountToDistribute;
      inst.remainingAmount -= amountToDistribute;
      inst.status = 'partial';
      inst.paidDate = repayment.paymentDate;
      inst.paymentMethod = repayment.paymentMethod;
      inst.referenceNumber = repayment.referenceNumber;
      inst.receiptNumber = receiptNumber;

      amountToDistribute = 0;
    }
  }

  // Recalculate balances
  const balances = calculateOutstandingBalance(updatedInstallments);
  const isFullySettled = balances.outstandingTotal <= 0;

  const updatedLoan: Loan = {
    ...loan,
    installments: updatedInstallments,
    totalPrincipalPaid: loan.totalPrincipalPaid + principalRepaidThisSession,
    totalInterestPaid: loan.totalInterestPaid + interestRepaidThisSession,
    totalAmountPaid: loan.totalAmountPaid + repayment.amount,
    outstandingPrincipal: balances.outstandingPrincipal,
    outstandingInterest: balances.outstandingInterest,
    outstandingTotal: balances.outstandingTotal,
    status: isFullySettled ? 'closed' : loan.status,
    updatedAt: new Date().toISOString(),
  };

  await saveDoc(COLLECTION, updatedLoan);

  // Record Transaction
  await recordTransaction({
    memberId: loan.memberId,
    memberName: loan.memberName,
    memberCode: loan.memberCode,
    type: 'Loan Repayment',
    category: 'inflow',
    amount: repayment.amount,
    date: repayment.paymentDate,
    paymentMethod: repayment.paymentMethod,
    referenceNumber: repayment.referenceNumber,
    receiptNumber,
    relatedEntityId: loan.id,
    description: `Loan #${loan.loanNumber} repayment installment`,
    notes: repayment.notes,
    createdBy: adminName,
  });

  // Update Member summary
  const member = await getMemberById(loan.memberId);
  if (member) {
    await updateMember(loan.memberId, {
      totalLoanRepaid: (member.totalLoanRepaid || 0) + repayment.amount,
      outstandingLoan: Math.max(0, (member.outstandingLoan || 0) - repayment.amount),
    }, adminName);
  }

  await logAuditEvent({
    action: 'Record Loan Repayment',
    module: 'loans',
    details: `Received ₹${repayment.amount} for Loan #${loan.loanNumber} from ${loan.memberName}. Remaining: ₹${balances.outstandingTotal}`,
    entityId: loan.id,
    entityType: 'Loan',
    performedBy: adminName,
    newData: updatedLoan,
  });

  return { loan: updatedLoan, receiptNumber };
}
