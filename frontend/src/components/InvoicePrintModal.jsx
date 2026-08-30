import React from 'react';
import { Printer, Crown } from 'lucide-react';

export default function InvoicePrintModal({ guest, billingDetails, config, onClose }) {
  if (!guest || !billingDetails) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-CRWN-${Date.now().toString().slice(-6)}`;
  const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="glass-modal max-w-3xl w-full p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-6 my-8">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between no-print border-b border-slate-800 pb-4">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Official Tax Invoice</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download Invoice</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
          </div>
        </div>

        {/* PRINTABLE INVOICE DOCUMENT */}
        <div id="printable-document" className="bg-white text-slate-900 p-8 rounded-xl shadow-lg space-y-6 border border-slate-200">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👑</span>
                <h1 className="text-2xl font-bold font-serif text-slate-950 tracking-wide">{config.hotelName}</h1>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">{config.address}</p>
              <p className="text-xs text-slate-600 font-mono">GSTIN: {config.gstNumber} | Phone: {config.phone}</p>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-xl font-bold text-slate-900 uppercase font-mono">TAX INVOICE</h2>
              <p className="text-xs text-slate-600 font-mono">Invoice #: <strong>{invoiceNumber}</strong></p>
              <p className="text-xs text-slate-600 font-mono">Date: {invoiceDate}</p>
            </div>
          </div>

          {/* Billed To & Stay Details */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">BILLED TO (GUEST):</p>
              <p className="text-base font-bold text-slate-950">{guest.name}</p>
              <p className="text-slate-700 font-mono">Mobile: {guest.mobile}</p>
              <p className="text-slate-700 font-mono">ID: {guest.aadhaar || 'Provided'}</p>
              <p className="text-slate-600 mt-1 line-clamp-2">{guest.address}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">STAY PARTICULARS:</p>
              <p className="text-sm font-bold text-slate-900">Room Number: {guest.roomNumber}</p>
              <p className="text-slate-700 font-mono">Check-In: {new Date(guest.checkInDate).toLocaleString()}</p>
              <p className="text-slate-700 font-mono">Check-Out: {new Date().toLocaleString()}</p>
              <p className="text-slate-700 font-mono font-bold">Nights Stayed: {billingDetails.nightsCount}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase text-[11px] font-mono">
                <th className="p-3 border border-slate-900">Item Description</th>
                <th className="p-3 border border-slate-900 text-center">Rate ({config.currencySymbol})</th>
                <th className="p-3 border border-slate-900 text-center">Qty / Days</th>
                <th className="p-3 border border-slate-900 text-right">Amount ({config.currencySymbol})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border border-slate-300">
              <tr>
                <td className="p-3 font-medium">Room Accommodation (Tariff Snapshot Rate)</td>
                <td className="p-3 text-center font-mono">{billingDetails.totalRoomCharge / billingDetails.nightsCount}</td>
                <td className="p-3 text-center font-mono">{billingDetails.nightsCount}</td>
                <td className="p-3 text-right font-mono font-bold">{billingDetails.totalRoomCharge.toLocaleString('en-IN')}</td>
              </tr>
              {(guest.services || []).map((srv, idx) => (
                <tr key={idx}>
                  <td className="p-3">{srv.name} ({srv.category})</td>
                  <td className="p-3 text-center font-mono">{srv.price}</td>
                  <td className="p-3 text-center font-mono">1</td>
                  <td className="p-3 text-right font-mono">{Number(srv.price).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Calculation Grid */}
          <div className="flex justify-end pt-2 text-xs">
            <div className="w-1/2 space-y-1.5 text-right font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold">{config.currencySymbol}{billingDetails.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST ({(config.gstTaxRatePercent || 12)/2}%):</span>
                <span>{config.currencySymbol}{(billingDetails.totalTax / 2).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST ({(config.gstTaxRatePercent || 12)/2}%):</span>
                <span>{config.currencySymbol}{(billingDetails.totalTax / 2).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-950 font-bold text-sm pt-1 border-t border-slate-400">
                <span>Grand Total:</span>
                <span>{config.currencySymbol}{billingDetails.grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Advance Paid:</span>
                <span>- {config.currencySymbol}{billingDetails.advancePaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold text-base pt-2 border-t-2 border-slate-950">
                <span>Net Payable ({billingDetails.paymentMode}):</span>
                <span>{config.currencySymbol}{billingDetails.netPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Invoice Footer */}
          <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-900">Thank you for staying at {config.hotelName}!</p>
              <p className="text-[11px] text-slate-500">This is a computer-generated tax invoice.</p>
            </div>
            <div className="text-center space-y-8">
              <div className="border-b border-slate-400 w-32"></div>
              <p className="text-[11px] font-semibold text-slate-800">Authorized Signatory</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
