import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Printer, Download, Share2, CheckCircle, ShieldCheck } from 'lucide-react';
import type { ReceiptData } from '../../utils/receiptGenerator';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receipt }) => {
  const { success } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*${receipt.businessName} - Official Payment Receipt*\n` +
      `Receipt No: ${receipt.receiptNumber}\n` +
      `Date: ${formatDate(receipt.date)}\n` +
      `Member: ${receipt.memberName} (${receipt.memberCode})\n` +
      `Amount Paid: ₹${receipt.amount.toLocaleString('en-IN')}\n` +
      `Payment Mode: ${receipt.paymentMethod}${receipt.referenceNumber ? ` (${receipt.referenceNumber})` : ''}\n` +
      `Description: ${receipt.itemDescription}\n\n` +
      `Thank you for your payment!`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    success('WhatsApp Share Ready', 'Receipt text formatted and opened.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Receipt"
      subtitle={`Receipt #${receipt.receiptNumber}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full no-print">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Share2 className="w-4 h-4 text-emerald-600" />}
            onClick={handleShareWhatsApp}
          >
            Share on WhatsApp
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print Receipt
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable Paper Canvas Container */}
      <div id="printable-receipt" className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 text-slate-900 font-sans shadow-subtle relative overflow-hidden">
        {/* Subtle Watermark Stamp */}
        <div className="absolute right-6 top-20 pointer-events-none opacity-[0.04] select-none text-9xl font-black rotate-[-25deg] text-emerald-950">
          PAID
        </div>

        {/* Top Header: Business Info & Title */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
                  ₹
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                  {receipt.businessName}
                </h1>
              </div>
              {receipt.tagline && (
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{receipt.tagline}</p>
              )}
              <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                {receipt.businessAddress}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span>Phone: {receipt.businessPhone}</span>
                {receipt.gstin && <span>• GSTIN: {receipt.gstin}</span>}
                {receipt.panNumber && <span>• PAN: {receipt.panNumber}</span>}
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded uppercase tracking-wider mb-2">
                Official Money Receipt
              </span>
              <p className="text-xs text-slate-500">Receipt No:</p>
              <p className="text-sm font-bold font-mono text-slate-900">{receipt.receiptNumber}</p>
              <p className="text-xs text-slate-500 mt-1">Date & Time:</p>
              <p className="text-xs font-semibold text-slate-800">
                {formatDate(receipt.date)} {receipt.time ? `• ${receipt.time}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Customer / Member Info Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-500 uppercase font-semibold tracking-wider">Received From:</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{receipt.memberName}</p>
            <p className="text-slate-600">Member ID: <span className="font-mono font-semibold">{receipt.memberCode}</span></p>
            {receipt.mobile && <p className="text-slate-600">Mobile: {receipt.mobile}</p>}
          </div>

          <div className="sm:text-right">
            <span className="text-slate-500 uppercase font-semibold tracking-wider">Payment Details:</span>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">
              Mode: <span className="text-emerald-700 font-bold">{receipt.paymentMethod}</span>
            </p>
            {receipt.referenceNumber && (
              <p className="text-slate-600">Ref/UTR No: <span className="font-mono">{receipt.referenceNumber}</span></p>
            )}
            {receipt.bhishiPlanName && (
              <p className="text-slate-600 truncate">Plan: {receipt.bhishiPlanName}</p>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="my-6 border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Particulars / Description</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-800">
                  {receipt.itemDescription}
                  {receipt.notes && (
                    <p className="text-[11px] text-slate-500 mt-0.5">Note: {receipt.notes}</p>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-600">{receipt.transactionType}</td>
                <td className="py-3.5 px-4 text-right font-bold font-mono text-sm text-slate-900">
                  {formatCurrency(receipt.amount)}
                </td>
              </tr>
              {/* Total Row */}
              <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                  Total Amount Received:
                </td>
                <td className="py-3 px-4 text-right text-base text-emerald-800 font-mono">
                  {formatCurrency(receipt.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl mb-8">
          <p className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">Amount in Words:</p>
          <p className="text-xs sm:text-sm font-bold text-emerald-950 mt-0.5 italic">
            {receipt.amountInWords}
          </p>
        </div>

        {/* Bottom Signatures & Verification */}
        <div className="pt-6 border-t border-slate-200 flex items-end justify-between gap-6 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">Computer Generated Valid Official Receipt</span>
          </div>

          <div className="text-center">
            <div className="w-44 border-b border-dashed border-slate-400 pb-8 mb-1.5 font-handwriting text-slate-400">
              {/* Authorized Sign Slot */}
            </div>
            <p className="font-bold text-slate-800 text-[11px]">{receipt.authorizedSignatoryTitle}</p>
            <p className="text-[10px] text-slate-500">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
