import React, { useState } from 'react';
import { Calendar, Plus, UserCheck, Trash2, Clock, CheckCircle2, Phone, Search } from 'lucide-react';

export default function ReservationModule({
  reservations,
  rooms,
  config,
  onSaveReservation,
  onCancelReservation,
  onConvertToCheckIn
}) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    guestName: '',
    mobile: '',
    roomId: rooms[0]?.id || '',
    checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    guestsCount: 2,
    advancePaid: 1000,
    notes: 'Advance booking'
  });

  const selectedRoom = rooms.find(r => r.id === formData.roomId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.guestName || !formData.mobile) {
      alert("Please provide Guest Name and Mobile Number.");
      return;
    }
    const rm = rooms.find(r => r.id === formData.roomId);
    const newRes = {
      id: 'res_' + Date.now(),
      guestName: formData.guestName,
      mobile: formData.mobile,
      roomId: formData.roomId,
      roomNumber: rm ? rm.number : 'Unassigned',
      bookedRoomPricePerNight: rm ? rm.pricePerNight : 2000,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      guestsCount: Number(formData.guestsCount),
      advancePaid: Number(formData.advancePaid) || 0,
      status: 'Confirmed',
      notes: formData.notes
    };

    onSaveReservation(newRes);
    setShowModal(false);
    setFormData({
      guestName: '',
      mobile: '',
      roomId: rooms[0]?.id || '',
      checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      guestsCount: 2,
      advancePaid: 1000,
      notes: 'Advance booking'
    });
  };

  const filteredReservations = reservations.filter(r => 
    r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.mobile.includes(searchTerm) ||
    r.roomNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6 w-full">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Advance Reservations & Bookings</h2>
            <p className="text-xs text-slate-600">Manage upcoming guest arrivals, deposits & 1-click check-ins</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl shadow-md transition transform hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3] text-[#C9A24B]" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Guest Name, Phone or Room Number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
        />
      </div>

      {/* Reservation Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {filteredReservations.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 shadow-sm">
            <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="font-semibold text-sm text-slate-700">No reservations found matching search.</p>
          </div>
        ) : (
          filteredReservations.map(res => (
            <div key={res.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                      Room {res.roomNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 font-serif mt-2">{res.guestName}</h3>
                    <p className="text-xs text-slate-600 font-mono flex items-center space-x-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#800020]" />
                      <span>{res.mobile}</span>
                    </p>
                  </div>

                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {res.status}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Check-In:</span>
                    <strong className="font-mono text-slate-900">{res.checkInDate}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Check-Out:</span>
                    <strong className="font-mono text-slate-900">{res.checkOutDate}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Snapshot Tariff:</span>
                    <strong className="font-mono text-[#800020] font-bold">{config.currencySymbol}{res.bookedRoomPricePerNight}/night</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                    <span>Advance Deposit:</span>
                    <strong className="font-mono text-emerald-700 font-bold">{config.currencySymbol}{res.advancePaid}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onConvertToCheckIn(res)}
                  className="flex-1 py-2.5 px-3 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                >
                  <UserCheck className="w-4 h-4 text-[#C9A24B]" />
                  <span>Check-In Now</span>
                </button>

                <button
                  onClick={() => onCancelReservation(res.id)}
                  className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 transition"
                  title="Cancel Reservation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-serif">Create Advance Reservation</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Guest Full Name"
                  value={formData.guestName}
                  onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Room</label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#800020]"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} - {r.category} ({config.currencySymbol}{r.pricePerNight}/night) [{r.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Arrival Date</label>
                  <input
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#800020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Advance Deposit ({config.currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={formData.advancePaid}
                  onChange={(e) => setFormData(prev => ({ ...prev, advancePaid: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-emerald-700 font-mono font-bold focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#800020] hover:bg-[#5c0017] text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

}
