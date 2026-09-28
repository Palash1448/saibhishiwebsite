import { PaymentMethod } from '../types/collection';
import { numberToIndianWords } from './formatters';

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  time?: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  mobile?: string;
  address?: string;
  transactionType: string;
  itemDescription: string;
  amount: number;
  amountInWords: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  bhishiPlanName?: string;
  loanNumber?: string;
  installmentInfo?: string;
  notes?: string;
  businessName: string;
  tagline?: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail?: string;
  gstin?: string;
  panNumber?: string;
  authorizedSignatoryTitle: string;
}

/**
 * Generates a standard sequential receipt number with year and random padding
 * e.g., "REC-2026-0814"
 */
export function generateReceiptNumber(prefix = 'REC'): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${currentYear}-${randomSuffix}`;
}

/**
 * Generates a unique transaction number
 * e.g., "TXN-20260928-5421"
 */
export function generateTransactionNumber(prefix = 'TXN'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
}

/**
 * Generates a member code
 * e.g., "SB-1045"
 */
export function generateMemberCode(count: number, prefix = 'SB'): string {
  const nextNum = 1000 + count + 1;
  return `${prefix}-${nextNum}`;
}

/**
 * Generates a loan number
 * e.g., "LN-2026-102"
 */
export function generateLoanNumber(count: number, prefix = 'LN'): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${100 + count + 1}`;
}
