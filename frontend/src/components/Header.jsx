import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Menu, 
  Bell, 
  User, 
  Clock, 
  Plus, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  Search 
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  userRole,
  currentUser,
  config,
  onQuickCheckIn,
  onLogout,
  onOpenAuth,
  pendingVerificationCount = 0,
  isMobileOpen,
  setIsMobileOpen
}) {
  const [timeStr, setTimeStr] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTitle = () => {
    switch (activeTab) {
      case 'website': return 'Public Website Landing';
      case 'dashboard': return 'Property Overview & Room Grid';
      case 'verification-queue': return 'Guest Verification Queue';
      case 'guest-entry': return 'New Guest Check-In';
      case 'guest-portal': return 'Guest Self-Service Portal';
      case 'reservations': return 'Advance Reservations';
      case 'housekeeping': return 'Housekeeping & Room Status';
      case 'reports': return 'Financial Analytics & Folios';
      case 'superadmin': return 'SuperAdmin Account Provisioning';
      case 'config': return 'Hotel System Settings';
      default: return 'The Crown Hotel';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm no-print h-16 px-6 flex items-center justify-between">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 leading-tight">
            {getTitle()}
          </h2>
          <p className="text-[10px] text-slate-500 font-mono hidden sm:block">
            The Crown Hotel & Suites • PMS v2.5
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* Realtime Clock */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-600 font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-[#800020]" />
          <span>{timeStr}</span>
        </div>

        {/* Notification Bell Badge */}
        {userRole && userRole !== 'Guest' && (
          <button
            onClick={() => setActiveTab('verification-queue')}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative transition"
            title="Verification Notifications"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {pendingVerificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce shadow">
                {pendingVerificationCount}
              </span>
            )}
          </button>
        )}

        {/* Quick Check-In CTA */}
        {userRole && userRole !== 'Guest' && (
          <button
            onClick={onQuickCheckIn}
            className="px-4 py-2 bg-[#800020] hover:bg-[#5c0017] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#800020]/20 transition transform hover:-translate-y-0.5 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-[#C9A24B]" />
            <span className="hidden sm:inline">New Check-In</span>
          </button>
        )}

        {/* User Profile Badge or Login Button */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
            >
              <div className="w-7 h-7 rounded-lg bg-[#800020] text-white font-bold text-xs flex items-center justify-center">
                {(userRole || 'G').charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden md:inline">{currentUser.name || userRole}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 divide-y divide-slate-100">
                <div className="px-4 py-2">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Role: {userRole}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { setActiveTab('website'); setShowProfileMenu(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>Public Landing Site</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-bold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl shadow-md shadow-[#800020]/20 transition flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-[#C9A24B]" />
            <span>Sign In</span>
          </button>
        )}

      </div>

    </header>
  );
}

