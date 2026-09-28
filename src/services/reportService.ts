import { Member } from '../types/member';
import { MonthlyCollection } from '../types/collection';
import { Loan } from '../types/loan';
import { Transaction } from '../types/transaction';
import { Expense } from '../types/expense';
import { CashFlowStatement, MemberDetailedStatement } from '../types/report';

export function generateCashFlowStatement(
  transactions: Transaction[],
  expenses: Expense[],
  startDate?: string,
  endDate?: string
): CashFlowStatement {
  let filteredTxns = [...transactions].filter((t) => !t.isReversed);

  if (startDate) {
    filteredTxns = filteredTxns.filter((t) => t.date >= startDate);
  }
  if (endDate) {
    filteredTxns = filteredTxns.filter((t) => t.date <= endDate);
  }

  let bhishiCollections = 0;
  let loanPrincipalRecovered = 0;
  let loanInterestCollected = 0;
  let processingFees = 0;
  let otherInflows = 0;

  let loanDisbursements = 0;
  let bhishiMaturityPayouts = 0;
  let interestCreditsPaid = 0;
  let operatingExpenses = 0;
  let otherOutflows = 0;

  filteredTxns.forEach((t) => {
    if (t.category === 'inflow') {
      if (t.type === 'Monthly Collection' || t.type === 'Investment') {
        bhishiCollections += t.amount;
      } else if (t.type === 'Loan Repayment') {
        // Approximate 80% principal, 20% interest for aggregated cashflow
        loanPrincipalRecovered += t.amount * 0.8;
        loanInterestCollected += t.amount * 0.2;
      } else if (t.type === 'Processing Fee') {
        processingFees += t.amount;
      } else {
        otherInflows += t.amount;
      }
    } else if (t.category === 'outflow') {
      if (t.type === 'Loan Disbursement') {
        loanDisbursements += t.amount;
      } else if (t.type === 'Withdrawal') {
        bhishiMaturityPayouts += t.amount;
      } else if (t.type === 'Expense') {
        operatingExpenses += t.amount;
      } else {
        otherOutflows += t.amount;
      }
    }
  });

  const totalInflow = bhishiCollections + loanPrincipalRecovered + loanInterestCollected + processingFees + otherInflows;
  const totalOutflow = loanDisbursements + bhishiMaturityPayouts + interestCreditsPaid + operatingExpenses + otherOutflows;

  return {
    inflow: {
      bhishiCollections: Math.round(bhishiCollections),
      loanPrincipalRecovered: Math.round(loanPrincipalRecovered),
      loanInterestCollected: Math.round(loanInterestCollected),
      processingFees: Math.round(processingFees),
      otherInflows: Math.round(otherInflows),
      totalInflow: Math.round(totalInflow),
    },
    outflow: {
      loanDisbursements: Math.round(loanDisbursements),
      bhishiMaturityPayouts: Math.round(bhishiMaturityPayouts),
      interestCreditsPaid: Math.round(interestCreditsPaid),
      operatingExpenses: Math.round(operatingExpenses),
      otherOutflows: Math.round(otherOutflows),
      totalOutflow: Math.round(totalOutflow),
    },
    netCashFlow: Math.round(totalInflow - totalOutflow),
  };
}

export function generateMemberStatement(
  member: Member,
  collections: MonthlyCollection[],
  loans: Loan[],
  transactions: Transaction[]
): MemberDetailedStatement {
  const memberCollections = collections.filter((c) => c.memberId === member.id || c.memberCode === member.memberCode);
  const memberLoans = loans.filter((l) => l.memberId === member.id || l.memberCode === member.memberCode);
  const memberTxns = transactions.filter((t) => t.memberId === member.id || t.memberCode === member.memberCode);

  let totalInvested = 0;
  memberCollections.forEach((c) => {
    totalInvested += c.paidAmount || 0;
  });

  let totalLoansTaken = 0;
  let totalLoansRepaid = 0;
  let currentOutstandingBalance = 0;

  memberLoans.forEach((l) => {
    totalLoansTaken += l.principalAmount;
    totalLoansRepaid += l.totalAmountPaid;
    currentOutstandingBalance += l.outstandingTotal;
  });

  return {
    member,
    collections: memberCollections,
    loans: memberLoans,
    transactions: memberTxns,
    totalInvested: totalInvested || member.totalInvested || 0,
    totalReturns: member.totalReturns || 0,
    totalLoansTaken: totalLoansTaken || member.totalLoanTaken || 0,
    totalLoansRepaid: totalLoansRepaid || member.totalLoanRepaid || 0,
    currentOutstandingBalance: currentOutstandingBalance || member.outstandingLoan || 0,
  };
}
