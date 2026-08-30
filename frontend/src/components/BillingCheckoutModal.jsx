import React, { useState } from 'react';
import { 
  FileText, 
  CreditCard, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Calendar, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';

export default function BillingCheckoutModal({
  guest,
  config,
  onClose,
  onCompleteCheckout,
  onOpenInvoice
}) {
  const [paymentMode, setPaymentMode] = useState(guest.paymentMethod || 'UPI');
  const [showQrModal, setShowQrModal] = useState(false);

  // Nights Calculation
  const checkInTime = new Date(guest.checkInDate).getTime();
  const nowTime = new Date().getTime();
  const diffHours = Math.max(1, (nowTime - checkInTime) / (1000 * 60 * 60));
  const nightsCount = Math.max(1, Math.ceil(diffHours / 24));

  // PRICE SNAPSHOT! Room charge is calculated based on locked rate
  const roomPricePerNight = Number(guest.bookedRoomPricePerNight) || 2000;
  const totalRoomCharge = roomPricePerNight * nightsCount;

  // Services Total
  const servicesList = guest.services || [];
  const totalServicesCharge = servicesList.reduce((acc, s) => acc + Number(s.price), 0);

  // Subtotal before tax
  const subtotal = totalRoomCharge + totalServicesCharge;

  // Tax calculation
  const gstPercent = config.gstTaxRatePercent || 12;
  const totalTax = Math.round((subtotal * gstPercent) / 100);
  const cgst = Math.round(totalTax / 2);
  const sgst = totalTax - cgst;

  // Grand Total & Net Due
  const grandTotal = subtotal + totalTax;
  const advancePaid = Number(guest.advancePaid) || 0;
  const netPayable = Math.max(0, grandTotal - advancePaid);

  // UPI Payment QR Link
  const upiId = config.upiId || 'crown.hotel@upi';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(config.hotelName)}&am=${netPayable}&cu=INR`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const handleCheckout = () => {
    onCompleteCheckout({
      guestId: guest.id,
      roomId: guest.roomId,
      nightsCount,
      totalRoomCharge,
      totalServicesCharge,
      subtotal,
      totalTax,
      grandTotal,
      advancePaid,
      netPayable,
      paymentMode,
      checkOutDate: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-modal max-w-3xl w-full p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-bold shadow">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-serif">Folio Billing & Check-Out</h3>
              <p className="text-xs text-slate-400">
                Guest: <strong className="text-amber-300">{guest.name}</strong> | Room <strong className="text-white">{guest.roomNumber}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Snapshot Protection Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-2 text-xs text-amber-300">
          <Lock className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Price Snapshot Locked:</strong> Room rate fixed at <strong>{config.currencySymbol}{roomPricePerNight}</strong>/night at check-in time. Any master rate changes do not affect this folio.
          </span>
        </div>

        {/* Bill Summary Table */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Itemized Folio Breakdown</h4>
          
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden text-xs">
            <div className="grid grid-cols-12 bg-slate-950 p-3 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qty / Rate</div>
              <div className="col-span-4 text-right">Amount ({config.currencySymbol})</div>
            </div>

            {/* Room Nights Charge */}
            <div className="grid grid-cols-12 p-3 border-b border-slate-800/60 text-slate-200">
              <div className="col-span-6 font-medium">
                Room Stay ({nightsCount} Night{nightsCount > 1 ? 's' : ''})
                <span className="block text-[10px] text-slate-500 font-mono">
                  {new Date(guest.checkInDate).toLocaleString()} → {new Date().toLocaleString()}
                </span>
              </div>
              <div className="col-span-2 text-center font-mono">
                {nightsCount} × {config.currencySymbol}{roomPricePerNight}
              </div>
              <div className="col-span-4 text-right font-mono font-bold text-white">
                {totalRoomCharge.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Room Services Items */}
            {servicesList.map((srv, idx) => (
              <div key={idx} className="grid grid-cols-12 p-3 border-b border-slate-800/40 text-slate-300">
                <div className="col-span-6">
                  {srv.name}
                  <span className="ml-2 text-[10px] text-slate-500">({srv.category})</span>
                </div>
                <div className="col-span-2 text-center font-mono">1</div>
                <div className="col-span-4 text-right font-mono text-amber-300">
                  {Number(srv.price).toLocaleString('en-IN')}
                </div>
              </div>
            ))}

            {/* Totals Calculation Rows */}
            <div className="p-3 bg-slate-950 space-y-1.5 border-t border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (Room + Services):</span>
                <span className="font-mono text-slate-200">{config.currencySymbol}{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST Tax ({gstPercent}% = CGST {gstPercent/2}% + SGST {gstPercent/2}%):</span>
                <span className="font-mono text-slate-200">{config.currencySymbol}{totalTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-200 font-bold text-sm pt-1 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="font-mono text-white">{config.currencySymbol}{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Less Advance Collected:</span>
                <span className="font-mono"> - {config.currencySymbol}{advancePaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold text-base pt-2 border-t border-slate-700">
                <span>Net Amount Payable:</span>
                <span className="font-mono">{config.currencySymbol}{netPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selector & QR Code Trigger */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Final Payment Method</h4>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPaymentMode('UPI')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                paymentMode === 'UPI'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span className="text-xs font-bold">UPI / QR Code</span>
            </button>
            
            <button
              onClick={() => setPaymentMode('Cash')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                paymentMode === 'Cash'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-bold">Cash Collection</span>
            </button>

            <button
              onClick={() => setPaymentMode('Card')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                paymentMode === 'Card'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs font-bold">Card POS</span>
            </button>
          </div>

          {paymentMode === 'UPI' && netPayable > 0 && (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <span className="text-xs text-slate-300">Generate guest UPI QR code for {config.currencySymbol}{netPayable}</span>
              </div>
              <button
                onClick={() => setShowQrModal(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow"
              >
                Show QR Code
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onOpenInvoice(guest, { nightsCount, totalRoomCharge, totalServicesCharge, subtotal, totalTax, grandTotal, advancePaid, netPayable, paymentMode })}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-2"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Tax Invoice</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckout}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/25 flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Check-Out & Clean Room</span>
            </button>
          </div>
        </div>

      </div>

      {/* Live UPI QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="glass-modal max-w-sm w-full p-6 rounded-2xl border border-amber-500/40 text-center space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white font-serif">Scan UPI QR to Pay</h4>
            <p className="text-xs text-amber-400 font-mono font-bold">{config.currencySymbol}{netPayable}</p>
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
              <img src={qrCodeImageUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <p className="text-[11px] text-slate-400">UPI VPA: <strong className="text-slate-200 font-mono">{upiId}</strong></p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
            >
              Close QR Code
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
