import React, { useState } from 'react';
import { TrendingUp, Download, Search, Users, DollarSign, Calendar, FileSpreadsheet, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnalyticsReports({ guests, rooms, config }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Stats Breakdown
  const totalGuestsCount = guests.length;
  const checkedInCount = guests.filter(g => g.status === 'Checked-In').length;
  const checkedOutCount = guests.filter(g => g.status === 'Checked-Out').length;

  const totalRoomRevenue = guests.reduce((acc, g) => acc + (Number(g.bookedRoomPricePerNight) || 0), 0);
  const totalServiceRevenue = guests.reduce((acc, g) => {
    const sTotal = (g.services || []).reduce((sAcc, s) => sAcc + Number(s.price), 0);
    return acc + sTotal;
  }, 0);
  const grandRevenue = totalRoomRevenue + totalServiceRevenue;

  // Chart data per room category
  const categoryMap = {};
  rooms.forEach(r => {
    categoryMap[r.category] = (categoryMap[r.category] || 0) + 1;
  });
  const chartData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    roomsCount: categoryMap[cat]
  }));

  const COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];

  // Export CSV Helper
  const handleExportCSV = () => {
    const headers = ['Guest ID', 'Name', 'Mobile', 'Aadhaar', 'Room No', 'Booked Rate', 'Check-In', 'Status', 'Advance Paid'];
    const rows = guests.map(g => [
      g.id,
      `"${g.name}"`,
      g.mobile,
      g.aadhaar,
      g.roomNumber,
      g.bookedRoomPricePerNight,
      g.checkInDate,
      g.status,
      g.advancePaid
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Crown_Guest_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.mobile.includes(searchTerm) ||
    g.roomNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6 w-full">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center font-bold shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Revenue & Guest Ledger Analytics</h2>
            <p className="text-xs text-slate-600">Financial reports, room category distribution & CSV exports</p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl shadow-md transition transform hover:scale-105"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#C9A24B]" />
          <span>Export Guest Ledger (CSV)</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Recorded Revenue</p>
          <h3 className="text-2xl font-bold text-[#800020] font-serif mt-1">{config.currencySymbol}{grandRevenue.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-slate-600 mt-1">Room: {config.currencySymbol}{totalRoomRevenue} | Services: {config.currencySymbol}{totalServiceRevenue}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Guests Managed</p>
          <h3 className="text-2xl font-bold text-slate-900 font-serif mt-1">{totalGuestsCount}</h3>
          <p className="text-xs text-slate-600 mt-1">Active Stay: <strong className="text-emerald-600 font-bold">{checkedInCount}</strong> | Checked-Out: {checkedOutCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inventory Scale</p>
          <h3 className="text-2xl font-bold text-emerald-700 font-serif mt-1">{rooms.length} Rooms</h3>
          <p className="text-xs text-slate-600 mt-1">Dynamic Configuration Active</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-serif">Room Category Inventory Breakdown</h3>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#475569" fontSize={12} fontWeight={600} />
              <YAxis stroke="#475569" fontSize={12} fontWeight={600} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="roomsCount" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Guest History Ledger Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900 font-serif">Guest Register Ledger</h3>
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 max-w-xs w-full focus-within:border-[#800020]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guest or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Guest Name</th>
                <th className="p-3.5">Mobile</th>
                <th className="p-3.5">Room</th>
                <th className="p-3.5">Booked Rate</th>
                <th className="p-3.5">Check-In Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Advance Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredGuests.map(g => (
                <tr key={g.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-slate-900">{g.name}</td>
                  <td className="p-3.5 font-mono text-slate-700">{g.mobile}</td>
                  <td className="p-3.5 font-mono font-bold text-[#800020]">Room {g.roomNumber}</td>
                  <td className="p-3.5 font-mono text-slate-700">🔒 {config.currencySymbol}{g.bookedRoomPricePerNight}</td>
                  <td className="p-3.5 font-mono text-slate-600">{new Date(g.checkInDate).toLocaleString()}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-xl font-bold text-[11px] ${
                      g.status === 'Checked-In' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-700">{config.currencySymbol}{g.advancePaid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );

}
