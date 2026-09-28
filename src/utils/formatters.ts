/**
 * Formats a number to Indian Rupee currency format (e.g., ₹1,25,000.00)
 */
export function formatCurrency(amount: number | undefined | null, includeDecimals = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? (absAmount % 1 === 0 ? 0 : 2) : 0,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Compact Indian currency formatting for dashboard cards (e.g., ₹1.25L, ₹45K, ₹2.4Cr)
 */
export function formatCompactCurrency(amount: number): string {
  if (!amount || isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)} K`;
  }
  return `${sign}₹${abs}`;
}

/**
 * Formats standard ISO or date string to Indian readable format (e.g. 28 Sep 2026)
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formats Date + Time (e.g. 28 Sep 2026, 10:30 AM)
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formats month and year numbers to label (e.g., 9, 2026 => "September 2026")
 */
export function formatMonthYear(month: number, year: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const mName = monthNames[month - 1] || `Month ${month}`;
  return `${mName} ${year}`;
}

/**
 * Converts a numeric amount into Indian English Words for legal/official receipts
 * (e.g. 15400 => "Rupees Fifteen Thousand Four Hundred Only")
 */
export function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return 'Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelowHundred(n: number): string {
    if (n < 10) return singleDigits[n];
    if (n < 20) return twoDigits[n - 10];
    return tensMultiple[Math.floor(n / 10)] + (n % 10 !== 0 ? ` ${singleDigits[n % 10]}` : '');
  }

  function convertBelowThousand(n: number): string {
    if (n < 100) return convertBelowHundred(n);
    return `${singleDigits[Math.floor(n / 100)]} Hundred${n % 100 !== 0 ? ` and ${convertBelowHundred(n % 100)}` : ''}`;
  }

  const integerPart = Math.floor(Math.abs(amount));
  const decimalPart = Math.round((Math.abs(amount) - integerPart) * 100);

  let crores = Math.floor(integerPart / 10000000);
  let lakhs = Math.floor((integerPart % 10000000) / 100000);
  let thousands = Math.floor((integerPart % 100000) / 1000);
  let remaining = integerPart % 1000;

  let result = '';

  if (crores > 0) {
    result += `${convertBelowHundred(crores)} Crore `;
  }
  if (lakhs > 0) {
    result += `${convertBelowHundred(lakhs)} Lakh `;
  }
  if (thousands > 0) {
    result += `${convertBelowHundred(thousands)} Thousand `;
  }
  if (remaining > 0) {
    result += `${convertBelowThousand(remaining)} `;
  }

  result = `Rupees ${result.trim()}`;

  if (decimalPart > 0) {
    result += ` and ${convertBelowHundred(decimalPart)} Paise`;
  }

  result += ' Only';
  return result;
}

/**
 * Masks sensitive Indian ID numbers (e.g. Aadhaar "XXXX-XXXX-1234" or PAN "ABCDE****F")
 */
export function maskSensitiveId(idNumber?: string, type: string = 'Aadhaar'): string {
  if (!idNumber) return '—';
  const clean = idNumber.replace(/\s+/g, '');
  if (type === 'Aadhaar') {
    if (clean.length >= 12) {
      return `XXXX-XXXX-${clean.slice(-4)}`;
    }
    return `XXXX-${clean.slice(-4)}`;
  }
  if (type === 'PAN' && clean.length === 10) {
    return `${clean.slice(0, 5)}****${clean.slice(-1)}`;
  }
  return clean.length > 4 ? `****${clean.slice(-4)}` : clean;
}
