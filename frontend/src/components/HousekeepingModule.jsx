import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Wrench, RefreshCw, UserCheck } from 'lucide-react';

export default function HousekeepingModule({ rooms, onUpdateRoomStatus, userRole }) {
  const [filter, setFilter] = useState('ALL');

  const dirtyRooms = rooms.filter(r => r.status === 'dirty');
  const vacantRooms = rooms.filter(r => r.status === 'vacant');
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance');

  const displayedRooms = rooms.filter(r => {
    if (filter === 'DIRTY') return r.status === 'dirty';
    if (filter === 'VACANT') return r.status === 'vacant';
    if (filter === 'MAINTENANCE') return r.status === 'maintenance';
    return true;
  });

  return (
    <div className="space-y-6 w-full">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Housekeeping & Cleanliness Control</h2>
            <p className="text-xs text-slate-600">Track room cleaning statuses, maintenance requests & staff assignments</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${filter === 'ALL' ? 'bg-[#800020] text-white shadow' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            All ({rooms.length})
          </button>
          <button
            onClick={() => setFilter('DIRTY')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${filter === 'DIRTY' ? 'bg-amber-500 text-white shadow' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            Dirty ({dirtyRooms.length})
          </button>
          <button
            onClick={() => setFilter('VACANT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${filter === 'VACANT' ? 'bg-emerald-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            Clean ({vacantRooms.length})
          </button>
          <button
            onClick={() => setFilter('MAINTENANCE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${filter === 'MAINTENANCE' ? 'bg-slate-800 text-white shadow' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            Repairs ({maintenanceRooms.length})
          </button>
        </div>
      </div>

      {/* Housekeeping Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {displayedRooms.map(room => (
          <div key={room.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 font-serif">Room {room.number}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Floor {room.floor} • {room.category}</p>
                </div>
                
                {room.status === 'dirty' && (
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-xl">
                    Needs Cleaning
                  </span>
                )}
                {room.status === 'vacant' && (
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
                    Clean & Ready
                  </span>
                )}
                {room.status === 'occupied' && (
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
                    Occupied
                  </span>
                )}
                {room.status === 'maintenance' && (
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 rounded-xl">
                    Under Repair
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              {room.status === 'dirty' && (
                <button
                  onClick={() => onUpdateRoomStatus(room.id, 'vacant')}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mark Clean & Available</span>
                </button>
              )}

              {room.status !== 'maintenance' && (
                <button
                  onClick={() => onUpdateRoomStatus(room.id, room.status === 'dirty' ? 'vacant' : 'dirty')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition"
                >
                  Toggle Clean / Dirty
                </button>
              )}

              <button
                onClick={() => onUpdateRoomStatus(room.id, room.status === 'maintenance' ? 'vacant' : 'maintenance')}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
              >
                {room.status === 'maintenance' ? 'Complete Repair' : 'Report Out of Order'}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );

}
