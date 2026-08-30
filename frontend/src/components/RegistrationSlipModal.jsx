import React from 'react';
import { Crown, Printer, Download, CheckCircle } from 'lucide-react';

export default function RegistrationSlipModal({ guest, config, onClose }) {
  if (!guest) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="glass-modal max-w-2xl w-full p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-6 my-8">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between no-print border-b border-slate-800 pb-4">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Guest Registration Slip</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Registration Slip</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT AREA */}
        <div id="printable-document" className="bg-white text-slate-900 p-8 rounded-xl shadow-lg space-y-6 border border-slate-200">
          
          {/* Document Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center font-bold text-2xl">
                👑
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif text-slate-950 tracking-wide">
                  {config.hotelName}
                </h1>
                <p className="text-xs text-slate-600 font-medium">{config.address}</p>
                <p className="text-xs text-slate-600 font-mono">Tel: {config.phone} | GSTIN: {config.gstNumber}</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="px-3 py-1 bg-slate-900 text-white text-xs font-mono font-bold uppercase rounded">
                GUEST ENTRY SLIP
              </span>
              <p className="text-xs text-slate-500 font-mono mt-1">Ref: {guest.id}</p>
            </div>
          </div>

          {/* Guest & Room Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <p className="text-slate-500 font-medium uppercase text-[10px]">Guest Information</p>
              <p className="text-sm font-bold text-slate-900">{guest.name}</p>
              <p className="text-slate-700 font-mono">Mobile: {guest.mobile}</p>
              <p className="text-slate-700 font-mono">{guest.idType}: {guest.aadhaar || 'N/A'}</p>
              <p className="text-slate-600 line-clamp-2">{guest.address}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <p className="text-slate-500 font-medium uppercase text-[10px]">Room & Tariff Lock</p>
              <p className="text-base font-bold text-slate-950">Room No. {guest.roomNumber}</p>
              <p className="text-slate-700 font-mono">
                Locked Nightly Rate: <strong>{config.currencySymbol}{guest.bookedRoomPricePerNight}</strong>
              </p>
              <p className="text-slate-700">Guests Count: {guest.guestsCount} Adult(s)</p>
              <p className="text-slate-700 font-mono">Check-In: {new Date(guest.checkInDate).toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-600 font-semibold">Advance Payment Collected:</span>
              <span className="ml-2 font-mono font-bold text-emerald-700 text-sm">{config.currencySymbol}{guest.advancePaid}</span>
            </div>
            <div>
              <span className="text-slate-600 font-semibold">Payment Mode:</span>
              <span className="ml-2 font-semibold text-slate-900">{guest.paymentMethod}</span>
            </div>
          </div>

          {/* Hotel Terms & Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-900 mb-1">Standard Hotel Rules:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                <li>Check-out time is {config.checkOutTime || '11:00 AM'}.</li>
                <li>Visitors are not allowed in rooms past 10:00 PM.</li>
                <li>Government photo ID is mandatory for stay.</li>
              </ul>
            </div>

            <div className="flex flex-col justify-end text-center space-y-8 pt-4">
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <p className="text-[11px] font-semibold text-slate-800">Guest Signature / Receptionist</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
