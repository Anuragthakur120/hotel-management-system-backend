import React from 'react';
import { 
  Crown, 
  LayoutDashboard, 
  Bed, 
  UserCheck, 
  Calendar, 
  FileText, 
  Settings, 
  Globe, 
  Bell, 
  User, 
  Users,
  Shield,
  Layers,
  Database,
  Sliders,
  History
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  config,
  pendingVerificationCount = 0,
  isMobileOpen,
  setIsMobileOpen
}) {
  const normRole = (userRole || '').toLowerCase();

  const menuItems = [
    { id: 'website', label: 'Public Website', icon: Globe },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roleReq: ['superadmin', 'admin'] },
    { id: 'verification-queue', label: 'Verifications', icon: Bell, badge: pendingVerificationCount, roleReq: ['superadmin', 'admin'] },
    { id: 'guest-entry', label: 'New Check-In', icon: UserCheck, roleReq: ['superadmin', 'admin'] },
    { id: 'guest-portal', label: 'Guest Portal', icon: User, roleReq: ['superadmin', 'admin'] },
    { id: 'reservations', label: 'Reservations', icon: Calendar, roleReq: ['superadmin', 'admin'] },
    { id: 'housekeeping', label: 'Housekeeping', icon: Bed, roleReq: ['superadmin', 'admin'] },
    { id: 'reports', label: 'Financial Reports', icon: FileText, roleReq: ['superadmin', 'admin'] },
    { id: 'config', label: 'Hotel Settings', icon: Settings, roleReq: ['superadmin', 'admin'] },
    
    // SuperAdmin Exclusive Items
    { id: 'manage-admins', label: 'Manage Admins', icon: Users, roleReq: ['superadmin'] },
    { id: 'website-content', label: 'Website Content', icon: Sliders, roleReq: ['superadmin'] },
    { id: 'room-management', label: 'Room Types & Pricing', icon: Layers, roleReq: ['superadmin'] },
    { id: 'guest-database', label: 'Full Guest Database', icon: Database, roleReq: ['superadmin'] },
    { id: 'roles-permissions', label: 'Roles & Permissions', icon: Shield, roleReq: ['superadmin'] },
    { id: 'audit-logs', label: 'Audit Logs', icon: History, roleReq: ['superadmin'] }
  ];

  const visibleItems = menuItems.filter(item => {
    if (!item.roleReq) return true;
    return item.roleReq.includes(normRole);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 shadow-xl z-50 transition-transform duration-300 flex flex-col justify-between ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-70px)]">
          
          {/* Brand Header */}
          <div className="flex items-center space-x-3 cursor-pointer border-b border-slate-100 pb-4" onClick={() => setActiveTab('website')}>
            <div className="w-11 h-11 rounded-xl bg-[#800020] text-[#C9A24B] flex items-center justify-center shadow-lg shadow-[#800020]/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-serif text-slate-900 tracking-tight leading-tight">The Crown Hotel</h1>
              <p className="text-[10px] font-bold text-[#800020] uppercase tracking-wider font-mono">Luxury Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {visibleItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (activeTab === 'superadmin' && item.id === 'manage-admins');
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold rounded-xl transition ${
                    isActive 
                      ? 'bg-[#800020] text-white shadow-md shadow-[#800020]/20 border-l-4 border-[#C9A24B]' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#C9A24B]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Role Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Active Role:</span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#800020]/10 text-[#800020] rounded-full border border-[#800020]/20 font-mono capitalize">
              {normRole || 'guest'}
            </span>
          </div>
        </div>

      </aside>
    </>
  );
}

