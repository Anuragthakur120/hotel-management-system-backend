import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Key, 
  Crown, 
  Settings, 
  Users, 
  Bed, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Plus, 
  Eye, 
  Lock 
} from 'lucide-react';

export default function SuperAdminPanel({
  rooms,
  guestMasters,
  config,
  adminAccounts = [],
  onCreateAdminAccount,
  onDeleteAdminAccount,
  onSaveRooms,
  onSaveConfig,
  activeTab: propActiveTab
}) {
  const [internalTab, setInternalTab] = useState('admins');
  const currentTab = propActiveTab === 'guest-database' ? 'guests' : (propActiveTab === 'roles-permissions' || propActiveTab === 'manage-admins' ? 'admins' : internalTab);

  // New Admin Form State
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'Admin'
  });

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    if (!adminForm.username || !adminForm.password) {
      alert("Please enter username and password.");
      return;
    }

    onCreateAdminAccount({
      id: 'usr_' + Date.now(),
      username: adminForm.username,
      password: adminForm.password,
      fullName: adminForm.fullName || adminForm.username,
      role: adminForm.role,
      createdAt: new Date().toISOString()
    });

    setAdminForm({ username: '', password: '', fullName: '', role: 'Admin' });
    alert("New Admin account credentials provisioned successfully!");
  };

  return (
    <div className="space-y-6">
      
      {/* SuperAdmin Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-gold-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-black font-serif">SuperAdmin Control Authority</h2>
            <p className="text-xs text-slate-400">Provision Admin accounts, customize room gallery & access master guest database</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setInternalTab('admins')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              currentTab === 'admins' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-black'
            }`}
          >
            Provision Admin Accounts
          </button>
          <button
            onClick={() => setInternalTab('guests')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              currentTab === 'guests' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Guest Data ({guestMasters.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PROVISION ADMIN ACCOUNTS */}
      {currentTab === 'admins' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create Admin Account Form */}
          <form onSubmit={handleCreateAdmin} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <UserPlus className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900 font-serif">Create New Admin Account Credentials</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Vikram Sharma (Admin)"
                value={adminForm.fullName}
                onChange={(e) => setAdminForm(p => ({ ...p, fullName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Username / Staff Login ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. admin_frontdesk"
                value={adminForm.username}
                onChange={(e) => setAdminForm(p => ({ ...p, username: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminForm.password}
                onChange={(e) => setAdminForm(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Provision Admin Account</span>
            </button>
          </form>

          {/* Active Admin Accounts List */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Users className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900 font-serif">Provisioned Admin Accounts</h3>
            </div>

            <div className="space-y-3">
              {adminAccounts.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No admin credentials created yet.</p>
              ) : (
                adminAccounts.map(acc => (
                  <div key={acc.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{acc.fullName || acc.username}</p>
                      <p className="text-[10px] text-slate-400 font-mono">User: {acc.username} | Role: {acc.role}</p>
                    </div>
                    <button
                      onClick={() => onDeleteAdminAccount(acc.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ALL GUEST DATA (HISTORICAL & ACTIVE) */}
      {currentTab === 'guests' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 font-serif">Master Guest Database (SuperAdmin Privileged View)</h3>
            <span className="text-xs text-amber-700 font-mono">Total Guest Masters: {guestMasters.length}</span>
          </div>

          <div className="divide-y divide-slate-800">
            {guestMasters.map(m => (
              <div key={m.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">{m.name}</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                      {m.totalVisits} Stays
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    Mobile: {m.mobile} | ID: {m.idNumberMasked} (Full: {m.idNumberFull || 'Protected'})
                  </p>
                  <p className="text-[11px] text-slate-700">{m.address}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-amber-700 font-mono">Total Spent: {config.currencySymbol}{m.totalSpent}</p>
                  <p className="text-[10px] text-slate-500">{m.idDocuments?.length || 0} ID documents attached</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
