import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  DollarSign, 
  CheckCircle, 
  Sparkles, 
  Wrench, 
  PlusCircle, 
  Coffee, 
  FileText, 
  Clock, 
  Bed, 
  Layers,
  Filter
} from 'lucide-react';

export default function Dashboard({
  rooms,
  guests,
  reservations,
  config,
  onOpenCheckIn,
  onOpenRoomService,
  onOpenCheckout,
  onUpdateRoomStatus,
  userRole
}) {
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Stats Calculations
  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
  const vacantCount = rooms.filter(r => r.status === 'vacant').length;
  const dirtyCount = rooms.filter(r => r.status === 'dirty').length;
  const reservedCount = rooms.filter(r => r.status === 'reserved').length;
  const maintenanceCount = rooms.filter(r => r.status === 'maintenance').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  // Calculate estimated revenue today
  const activeGuests = guests.filter(g => g.status === 'Checked-In');
  const roomRevenue = activeGuests.reduce((acc, g) => acc + (Number(g.bookedRoomPricePerNight) || 0), 0);
  const serviceRevenue = activeGuests.reduce((acc, g) => {
    const srvTotal = (g.services || []).reduce((sAcc, s) => sAcc + Number(s.price), 0);
    return acc + srvTotal;
  }, 0);
  const totalRevenue = roomRevenue + serviceRevenue;

  // Floor extraction
  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b);

  // Filtered rooms
  const filteredRooms = rooms.filter(r => {
    if (selectedFloor !== 'ALL' && r.floor !== Number(selectedFloor)) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    return true;
  });

  // Status Badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'vacant':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Vacant & Clean', icon: CheckCircle };
      case 'occupied':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Occupied', icon: User };
      case 'reserved':
        return { bg: 'bg-[#C9A24B]/10 text-[#800020] border-[#C9A24B]/30', label: 'Reserved', icon: Clock };
      case 'dirty':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Cleaning Needed', icon: Sparkles };
      case 'maintenance':
        return { bg: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Maintenance', icon: Wrench };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', label: status, icon: Bed };
    }
  };

  return (
    <div className="space-y-8 w-full">
      
      {/* 4-COLUMN STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        
        {/* Occupancy Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Occupancy Rate</p>
            <h3 className="text-2xl font-bold font-serif text-[#800020] mt-1">{occupancyRate}%</h3>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-emerald-600 font-bold">{occupiedCount}</span> of {totalRooms} rooms occupied
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Live Daily Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Daily Revenue</p>
            <h3 className="text-2xl font-bold font-serif text-[#800020] mt-1">
              {config.currencySymbol}{totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Rooms: {config.currencySymbol}{roomRevenue} | Services: {config.currencySymbol}{serviceRevenue}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Available Rooms */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vacant Rooms</p>
            <h3 className="text-2xl font-bold font-serif text-emerald-600 mt-1">{vacantCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Ready for check-in</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Housekeeping Needed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Housekeeping Alert</p>
            <h3 className="text-2xl font-bold font-serif text-amber-600 mt-1">{dirtyCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Cleaning required</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 w-full">
        
        {/* Floor Selection */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          <span className="text-xs text-slate-500 font-bold flex items-center space-x-1 mr-2">
            <Layers className="w-4 h-4 text-[#800020]" />
            <span>Floor:</span>
          </span>
          <button
            onClick={() => setSelectedFloor('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              selectedFloor === 'ALL'
                ? 'bg-[#800020] text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Floors
          </button>
          {floors.map(fl => (
            <button
              key={fl}
              onClick={() => setSelectedFloor(String(fl))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                selectedFloor === String(fl)
                  ? 'bg-[#800020] text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Floor {fl}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-bold flex items-center space-x-1">
            <Filter className="w-4 h-4 text-[#800020]" />
            <span>Status:</span>
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#800020]"
          >
            <option value="ALL">All Statuses ({totalRooms})</option>
            <option value="vacant">Vacant & Clean ({vacantCount})</option>
            <option value="occupied">Occupied ({occupiedCount})</option>
            <option value="reserved">Reserved ({reservedCount})</option>
            <option value="dirty">Cleaning Needed ({dirtyCount})</option>
            <option value="maintenance">Maintenance ({maintenanceCount})</option>
          </select>
        </div>

      </div>

      {/* FLOOR-BY-FLOOR ROOM MATRIX */}
      {floors.map(floorNum => {
        const floorRooms = filteredRooms.filter(r => r.floor === floorNum);
        if (floorRooms.length === 0) return null;

        return (
          <div key={floorNum} className="space-y-4 w-full">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              <span className="w-3 h-3 rounded-full bg-[#800020]"></span>
              <h2 className="text-lg font-bold font-serif text-slate-900">Floor {floorNum}</h2>
              <span className="text-xs text-slate-500 font-mono">({floorRooms.length} Rooms)</span>
            </div>

            {/* ROOM CARDS GRID (BUG 3 & 5 FIX: FLEX LAYOUT, NO BADGE OVERLAP) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {floorRooms.map(room => {
                const rId = room._id || room.id;
                const rNum = room.roomNumber || room.number;
                const guest = guests.find(g => (g.roomId === rId || g.roomId === room.id || g.roomNumber === rNum) && g.status === 'Checked-In');
                const reservation = reservations.find(r => (r.roomId === rId || r.roomId === room.id || r.roomNumber === rNum) && r.status === 'Confirmed');
                const badge = getStatusBadge(room.status);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={rId}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      
                      {/* TOP ROW: Category Tag & Status Badge (NO OVERLAP!) */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                          {room.category}
                        </span>

                        <div className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center space-x-1 shrink-0 ${badge.bg}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </div>
                      </div>

                      {/* ROOM NUMBER HEADING */}
                      <div>
                        <h3 className="text-2xl font-bold font-serif text-slate-900 leading-tight">
                          Room {room.number}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          Tariff: <strong className="text-[#800020] font-bold">{config.currencySymbol}{room.pricePerNight}</strong> / night
                        </p>
                      </div>

                      {/* AMENITIES */}
                      <div className="flex flex-wrap gap-1">
                        {(room.amenities || []).map((am, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100">
                            {am}
                          </span>
                        ))}
                      </div>

                      {/* OCCUPIED GUEST DETAILS */}
                      {room.status === 'occupied' && guest && (
                        <div className="p-3 rounded-2xl bg-[#800020]/5 border border-[#800020]/15 space-y-1 text-xs">
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-500">Guest:</span>
                            <span className="text-[#800020] font-bold">{guest.name}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                            <span>Mobile:</span>
                            <span>{guest.mobile}</span>
                          </div>
                          <div className="flex justify-between font-mono text-[11px] pt-1 border-t border-slate-200">
                            <span className="text-slate-500">Price Locked:</span>
                            <span className="text-[#800020] font-bold">🔒 {config.currencySymbol}{guest.bookedRoomPricePerNight}</span>
                          </div>
                        </div>
                      )}

                      {/* RESERVATION DETAILS */}
                      {room.status === 'reserved' && reservation && (
                        <div className="p-3 rounded-2xl bg-[#C9A24B]/10 border border-[#C9A24B]/30 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Reserved for:</span>
                            <span className="text-[#800020] font-bold">{reservation.guestName}</span>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* ACTION BUTTONS AT BOTTOM */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      {room.status === 'vacant' && (
                        <button
                          onClick={() => onOpenCheckIn(rId)}
                          className="w-full py-2.5 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                        >
                          <PlusCircle className="w-4 h-4 text-[#C9A24B]" />
                          <span>Check-In</span>
                        </button>
                      )}

                      {room.status === 'occupied' && guest && (
                        <>
                          <button
                            onClick={() => onOpenRoomService(guest)}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center space-x-1"
                          >
                            <Coffee className="w-3.5 h-3.5 text-[#800020]" />
                            <span>Service</span>
                          </button>
                          <button
                            onClick={() => onOpenCheckout(guest)}
                            className="flex-1 py-2 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#C9A24B]" />
                            <span>Checkout</span>
                          </button>
                        </>
                      )}

                      {room.status === 'dirty' && (
                        <button
                          onClick={() => onUpdateRoomStatus(rId, 'vacant')}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Mark Clean & Ready</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

    </div>
  );
}
