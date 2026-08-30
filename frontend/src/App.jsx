import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import api from './services/api';

import { 
  storageService, 
  INITIAL_ROOMS, 
  INITIAL_GUEST_MASTERS, 
  INITIAL_STAYS, 
  INITIAL_RESERVATIONS, 
  INITIAL_CONFIG 
} from './services/storageService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GuestEntryForm from './components/GuestEntryForm';
import GuestSelfPortal from './components/GuestSelfPortal';
import GuestVerificationQueue from './components/GuestVerificationQueue';
import SuperAdminPanel from './components/SuperAdminPanel';
import ReservationModule from './components/ReservationModule';
import RoomServiceModal from './components/RoomServiceModal';
import BillingCheckoutModal from './components/BillingCheckoutModal';
import HousekeepingModule from './components/HousekeepingModule';
import AnalyticsReports from './components/AnalyticsReports';
import ConfigEngine from './components/ConfigEngine';
import RegistrationSlipModal from './components/RegistrationSlipModal';
import InvoicePrintModal from './components/InvoicePrintModal';
import AuthModal from './components/AuthModal';
import PublicHotelWebsite from './components/PublicHotelWebsite';
import Sidebar from './components/Sidebar';

function AppContent() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Database State
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [guestMasters, setGuestMasters] = useState(INITIAL_GUEST_MASTERS);
  const [stays, setStays] = useState(INITIAL_STAYS);
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [firebaseConfig, setFirebaseConfig] = useState(null);
  const [useFirebase, setUseFirebase] = useState(false);

  // SuperAdmin Provisioned Admin Accounts
  const [adminAccounts, setAdminAccounts] = useState([]);

  // Self-Submitted Pending Verification Queue
  const [pendingSubmissions, setPendingSubmissions] = useState([
    {
      id: 'sub_101',
      name: 'Amit Patel',
      mobile: '9811223344',
      email: 'amit@example.com',
      address: 'Sector 18, Gurugram, Haryana',
      idType: 'Aadhaar Card',
      idNumberFull: '4321-8765-9876',
      idNumberMasked: 'XXXX-XXXX-9876',
      idDocUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      guestsCount: 2,
      expectedCheckIn: new Date().toISOString().slice(0, 16),
      status: 'pending_verification',
      submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([
    { user: 'System', action: 'System initialized with token security & Mongoose DB', timestamp: new Date().toISOString() }
  ]);

  // Active Modals & Triggers
  const [preSelectedRoomId, setPreSelectedRoomId] = useState(null);
  const [preSelectedReservation, setPreSelectedReservation] = useState(null);
  const [activeServiceGuest, setActiveServiceGuest] = useState(null);
  const [activeCheckoutGuest, setActiveCheckoutGuest] = useState(null);
  const [registrationSlipGuest, setRegistrationSlipGuest] = useState(null);
  const [invoiceModalData, setInvoiceModalData] = useState(null);

  const fetchAdminAccounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/auth/admins');
      if (res.data) {
        setAdminAccounts(res.data.map(a => ({
          id: a._id,
          username: a.username || a.name,
          fullName: a.name,
          role: 'admin',
          createdAt: a.createdAt
        })));
      }
    } catch (e) {
      console.warn('Could not fetch admins:', e.message);
    }
  };

  useEffect(() => {
    if (user && user.role === 'superadmin') {
      fetchAdminAccounts();
    }
  }, [user]);

  // Handle successful login
  const handleAuthLogin = (loginResult) => {
    let tokenVal = null;
    let userObj = null;

    if (typeof loginResult === 'string') {
      tokenVal = loginResult;
      userObj = arguments[1];
    } else if (loginResult && loginResult.token) {
      tokenVal = loginResult.token;
      userObj = loginResult;
    } else {
      userObj = loginResult;
      tokenVal = localStorage.getItem('token');
    }

    const normRole = (userObj.role || 'guest').toLowerCase();
    const cleanUser = {
      id: userObj.id || userObj._id,
      name: userObj.name,
      role: normRole,
      username: userObj.username,
      mobile: userObj.mobile
    };

    login(tokenVal, cleanUser);
    showToast(`Welcome back, ${cleanUser.name || 'User'}!`, 'success');
    navigate(`/${normRole}/dashboard`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    showToast('Signed out successfully.', 'success');
  };

  // Load real data from MongoDB backend API
  const loadAllData = async () => {
    try {
      // Public endpoints
      const roomsRes = await api.get('/rooms').catch(() => null);
      if (roomsRes?.data) setRooms(roomsRes.data);

      const configRes = await api.get('/rooms/hotel-config').catch(() => null);
      if (configRes?.data) setConfig(configRes.data);

      // Auth required endpoints
      const token = localStorage.getItem('token');
      if (token) {
        const staysRes = await api.get('/stays').catch(() => null);
        if (staysRes?.data) setStays(staysRes.data);

        const resRes = await api.get('/reservations').catch(() => null);
        if (resRes?.data) setReservations(resRes.data);

        const pendingRes = await api.get('/guests/pending-verification').catch(() => null);
        if (pendingRes?.data) setPendingSubmissions(pendingRes.data);

        const mastersRes = await api.get('/guests/master').catch(() => null);
        if (mastersRes?.data) setGuestMasters(mastersRes.data);

        const logsRes = await api.get('/reports/audit-logs').catch(() => null);
        if (logsRes?.data) setAuditLogs(logsRes.data);
      }
    } catch (err) {
      console.warn("Backend data load note:", err.message);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  const addAuditLog = async (actionText) => {
    const actor = user ? user.name || user.username || 'User' : 'System';
    try {
      await api.post('/reports/audit-logs', { action: actionText, entityType: 'system' }).catch(() => {});
    } catch (e) {}
    setAuditLogs(prev => [
      { user: `${actor} (${user ? user.role : 'public'})`, action: actionText, timestamp: new Date().toISOString() },
      ...prev
    ]);
  };

  const handleSubmitSelfRegistration = async (newSubmission) => {
    try {
      const res = await api.post('/guests/submit-self', newSubmission);
      await loadAllData();
      showToast(`Check-in request submitted for ${newSubmission.name}! Pending Admin approval.`, 'success');
    } catch (err) {
      // Fallback local update
      setPendingSubmissions(prev => [newSubmission, ...prev]);
      showToast(`Check-in request submitted locally.`, 'info');
    }
  };

  const handleApproveAndAllocateRoom = async (verifiedGuestInfo, targetRoom) => {
    try {
      const payload = {
        name: verifiedGuestInfo.name,
        mobile: verifiedGuestInfo.mobile,
        roomId: targetRoom._id || targetRoom.id,
        roomNumber: targetRoom.roomNumber || targetRoom.number,
        pricePerNight: targetRoom.pricePerNight || targetRoom.price,
        address: verifiedGuestInfo.address,
        idType: verifiedGuestInfo.idType,
        idNumberFull: verifiedGuestInfo.idNumberFull,
        idDocUrl: verifiedGuestInfo.idDocUrl,
        guestsCount: verifiedGuestInfo.guestsCount || 1,
        advancePaid: 0,
        paymentMethod: 'UPI'
      };

      const res = await api.post('/stays/check-in', payload);
      
      if (verifiedGuestInfo._id || verifiedGuestInfo.id) {
        await api.put(`/guests/verify/${verifiedGuestInfo._id || verifiedGuestInfo.id}`, { status: 'valid' }).catch(() => {});
      }

      await loadAllData();
      showToast(`Approved & Allocated Room ${targetRoom.roomNumber || targetRoom.number} for ${verifiedGuestInfo.name}!`, 'success');
      setRegistrationSlipGuest(res.data.stay || payload);
      setActiveTab('dashboard');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleRejectSubmission = async (subId) => {
    try {
      await api.put(`/guests/verify/${subId}`, { status: 'invalid' }).catch(() => {});
      await loadAllData();
      showToast('Submission rejected.', 'info');
    } catch (e) {
      setPendingSubmissions(prev => prev.filter(p => (p._id || p.id) !== subId));
    }
  };

  const handleCreateAdminAccount = async (newAcc) => {
    try {
      const res = await api.post('/auth/create-admin', {
        username: newAcc.username,
        password: newAcc.password,
        fullName: newAcc.fullName,
        mobile: newAcc.mobile
      });
      showToast(`Provisioned new Admin account: ${newAcc.username}`, 'success');
      fetchAdminAccounts();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteAdminAccount = async (accId) => {
    try {
      await api.delete(`/auth/admin/${accId}`);
      showToast('Admin account revoked.', 'success');
      fetchAdminAccounts();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleSaveCheckIn = async (guestMasterProfile, stayTransaction, roomId, reservationId) => {
    try {
      const payload = {
        name: stayTransaction.name,
        mobile: stayTransaction.mobile,
        roomId: roomId,
        roomNumber: stayTransaction.roomNumber,
        pricePerNight: stayTransaction.bookedRoomPricePerNight,
        address: stayTransaction.address,
        guestsCount: stayTransaction.guestsCount,
        advancePaid: stayTransaction.advancePaid,
        paymentMethod: stayTransaction.paymentMethod
      };

      const res = await api.post('/stays/check-in', payload);
      
      if (reservationId) {
        await api.delete(`/reservations/${reservationId}`).catch(() => {});
      }

      await loadAllData();
      setRegistrationSlipGuest(res.data.stay || stayTransaction);
      showToast(`Checked in ${stayTransaction.name} into Room ${stayTransaction.roomNumber}!`, 'success');
      setActiveTab('dashboard');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleAddService = async (stayId, serviceItem) => {
    try {
      const res = await api.post(`/stays/${stayId}/service`, serviceItem);
      await loadAllData();
      showToast(`Added service ${serviceItem.name}`, 'success');
      if (activeServiceGuest) {
        setActiveServiceGuest(res.data.stay);
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleCompleteCheckout = async (checkoutData) => {
    try {
      const stayId = checkoutData.stayId || checkoutData.guestId || activeCheckoutGuest?._id || activeCheckoutGuest?.id;
      const res = await api.post(`/stays/${stayId}/checkout`, {
        paymentMethod: checkoutData.paymentMethod || 'UPI',
        discountAmount: checkoutData.discount || 0
      });
      await loadAllData();
      showToast('Checkout completed & folio created!', 'success');
      setActiveCheckoutGuest(null);
      if (res.data && res.data.billingDetails) {
        setInvoiceModalData({ guest: res.data.stay, billingDetails: res.data.billingDetails });
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleUpdateRoomStatus = async (roomId, newStatus) => {
    try {
      await api.put(`/rooms/${roomId}/status`, { status: newStatus });
      await loadAllData();
      showToast(`Room status updated to ${newStatus}`, 'success');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleSaveRooms = async (newRooms) => {
    setRooms(newRooms);
    showToast('Rooms inventory updated.', 'success');
  };

  const handleSaveConfig = async (newConfig) => {
    try {
      const res = await api.put('/rooms/hotel-config', newConfig);
      setConfig(res.data.hotel || newConfig);
      showToast('Hotel settings updated successfully!', 'success');
    } catch (err) {
      setConfig(newConfig);
    }
  };

  const handleResetDefaults = async () => {
    if (confirm("Reset Crown HMS back to default seed data?")) {
      await storageService.resetToDefaults();
      await loadAllData();
      alert("Database reset to seed data!");
    }
  };

  const currentRoleName = user ? (user.role ? user.role.toUpperCase() : 'GUEST') : 'PUBLIC GUEST';

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-slate-900 flex flex-col font-sans selection:bg-[#800020] selection:text-white w-full overflow-x-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 bg-[#800020] text-white text-xs font-bold rounded-2xl shadow-2xl border border-[#C9A24B]/40 flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#C9A24B]"></span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Canonical Route Architecture */}
      <Routes>
        {/* PUBLIC HOME ROUTE */}
        <Route 
          path="/" 
          element={
            <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between">
              <Header
                activeTab="website"
                setActiveTab={(tab) => {
                  if (tab === 'login') navigate('/login');
                  else if (tab === 'dashboard' && user) navigate(`/${user.role}/dashboard`);
                }}
                userRole={user ? user.role : null}
                currentUser={user}
                config={config}
                onLogout={handleLogout}
                onOpenAuth={() => navigate('/login')}
                pendingVerificationCount={pendingSubmissions.length}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
              />
              <main className="flex-1 w-full px-4 sm:px-8 py-6">
                <PublicHotelWebsite
                  rooms={rooms}
                  config={config}
                  onOpenGuestPortal={() => navigate('/login')}
                  onSelectRoomForCheckIn={() => navigate('/login')}
                />
              </main>
              <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
                <p>© {new Date().getFullYear()} The Crown Hotel • Luxury Property Management System.</p>
                <span className="font-semibold text-[#800020]">Active Role: {currentRoleName}</span>
              </footer>
            </div>
          } 
        />

        {/* PUBLIC ROOMS ROUTE */}
        <Route 
          path="/rooms" 
          element={
            <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between">
              <Header
                activeTab="website"
                setActiveTab={() => navigate('/')}
                userRole={user ? user.role : null}
                currentUser={user}
                config={config}
                onLogout={handleLogout}
                onOpenAuth={() => navigate('/login')}
                pendingVerificationCount={pendingSubmissions.length}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
              />
              <main className="flex-1 w-full px-4 sm:px-8 py-6">
                <PublicHotelWebsite
                  rooms={rooms}
                  config={config}
                  onOpenGuestPortal={() => navigate('/login')}
                  onSelectRoomForCheckIn={() => navigate('/login')}
                />
              </main>
              <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
                <p>© {new Date().getFullYear()} The Crown Hotel • Rooms & Suites Catalog.</p>
                <span className="font-semibold text-[#800020]">Active Role: {currentRoleName}</span>
              </footer>
            </div>
          } 
        />

        {/* PUBLIC LOGIN ROUTE */}
        <Route 
          path="/login" 
          element={
            <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between">
              <Header
                activeTab="website"
                setActiveTab={() => navigate('/')}
                userRole={user ? user.role : null}
                currentUser={user}
                config={config}
                onLogout={handleLogout}
                onOpenAuth={() => {}}
                pendingVerificationCount={pendingSubmissions.length}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
              />
              <main className="flex-1 w-full px-4 sm:px-8 py-6">
                <PublicHotelWebsite
                  rooms={rooms}
                  config={config}
                  onOpenGuestPortal={() => {}}
                  onSelectRoomForCheckIn={() => {}}
                />
              </main>
              <AuthModal
                onLogin={handleAuthLogin}
                onClose={() => navigate('/')}
              />
            </div>
          } 
        />

        {/* PUBLIC REGISTER ROUTE */}
        <Route 
          path="/register" 
          element={
            <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between">
              <Header
                activeTab="website"
                setActiveTab={() => navigate('/')}
                userRole={user ? user.role : null}
                currentUser={user}
                config={config}
                onLogout={handleLogout}
                onOpenAuth={() => {}}
                pendingVerificationCount={pendingSubmissions.length}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
              />
              <main className="flex-1 w-full px-4 sm:px-8 py-6">
                <PublicHotelWebsite
                  rooms={rooms}
                  config={config}
                  onOpenGuestPortal={() => {}}
                  onSelectRoomForCheckIn={() => {}}
                />
              </main>
              <AuthModal
                onLogin={handleAuthLogin}
                onClose={() => navigate('/')}
              />
            </div>
          } 
        />

        {/* PROTECTED GUEST DASHBOARD ROUTE */}
        <Route 
          path="/guest/dashboard/*" 
          element={
            <ProtectedRoute allowedRole="guest">
              <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between">
                <Header
                  activeTab="guest-portal"
                  setActiveTab={() => {}}
                  userRole="guest"
                  currentUser={user}
                  config={config}
                  onLogout={handleLogout}
                  onOpenAuth={() => navigate('/login')}
                  pendingVerificationCount={pendingSubmissions.length}
                  isMobileOpen={isMobileOpen}
                  setIsMobileOpen={setIsMobileOpen}
                />
                <main className="flex-1 w-full px-4 sm:px-8 py-6">
                  <GuestSelfPortal
                    config={config}
                    onSubmitSelfRegistration={handleSubmitSelfRegistration}
                  />
                </main>
                <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
                  <p>© {new Date().getFullYear()} The Crown Hotel • Guest Portal.</p>
                  <span className="font-semibold text-[#800020]">Active Role: GUEST</span>
                </footer>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* PROTECTED ADMIN DASHBOARD ROUTE */}
        <Route 
          path="/admin/dashboard/*" 
          element={
            <ProtectedRoute allowedRole="admin">
              <div className="min-h-screen bg-[#FAF7F5] text-slate-900 flex font-sans w-full overflow-x-hidden">
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  userRole="admin"
                  setUserRole={() => {}}
                  config={config}
                  pendingVerificationCount={pendingSubmissions.length}
                  isMobileOpen={isMobileOpen}
                  setIsMobileOpen={setIsMobileOpen}
                />
                <div className="flex-1 w-full min-h-screen flex flex-col justify-between md:ml-64 overflow-x-hidden">
                  <Header
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    userRole="admin"
                    currentUser={user}
                    config={config}
                    onQuickCheckIn={() => setActiveTab('guest-entry')}
                    onLogout={handleLogout}
                    onOpenAuth={() => navigate('/login')}
                    pendingVerificationCount={pendingSubmissions.length}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                  />
                  <main className="flex-1 w-full px-4 sm:px-8 py-6 space-y-6">
                    {activeTab === 'dashboard' && (
                      <Dashboard
                        rooms={rooms}
                        guests={stays}
                        reservations={reservations}
                        config={config}
                        onOpenCheckIn={(rmId) => { setPreSelectedRoomId(rmId); setActiveTab('guest-entry'); }}
                        onOpenRoomService={(gst) => setActiveServiceGuest(gst)}
                        onOpenCheckout={(gst) => setActiveCheckoutGuest(gst)}
                        onUpdateRoomStatus={handleUpdateRoomStatus}
                        userRole="admin"
                      />
                    )}
                    {activeTab === 'verification-queue' && (
                      <GuestVerificationQueue
                        pendingSubmissions={pendingSubmissions}
                        rooms={rooms}
                        onApproveAndAllocateRoom={handleApproveAndAllocateRoom}
                        onRejectSubmission={handleRejectSubmission}
                        config={config}
                      />
                    )}
                    {activeTab === 'guest-entry' && (
                      <GuestEntryForm
                        rooms={rooms}
                        guestMasters={guestMasters}
                        config={config}
                        onSaveCheckIn={handleSaveCheckIn}
                        preSelectedRoomId={preSelectedRoomId}
                        preSelectedReservation={preSelectedReservation}
                        userRole="admin"
                      />
                    )}
                    {activeTab === 'guest-portal' && (
                      <GuestSelfPortal
                        config={config}
                        onSubmitSelfRegistration={handleSubmitSelfRegistration}
                      />
                    )}
                    {activeTab === 'reservations' && (
                      <ReservationModule
                        reservations={reservations}
                        rooms={rooms}
                        config={config}
                        onSaveReservation={async (newRes) => {
                          try {
                            await api.post('/reservations', newRes);
                            await loadAllData();
                            showToast('Reservation saved successfully!', 'success');
                          } catch (e) {
                            alert(e.response?.data?.error || e.message);
                          }
                        }}
                        onCancelReservation={async (resId) => {
                          try {
                            await api.delete(`/reservations/${resId}`);
                            await loadAllData();
                            showToast('Reservation cancelled', 'info');
                          } catch (e) {
                            alert(e.response?.data?.error || e.message);
                          }
                        }}
                        onConvertToCheckIn={(res) => {
                          setPreSelectedRoomId(res.roomId);
                          setPreSelectedReservation(res);
                          setActiveTab('guest-entry');
                        }}
                      />
                    )}
                    {activeTab === 'housekeeping' && (
                      <HousekeepingModule
                        rooms={rooms}
                        onUpdateRoomStatus={handleUpdateRoomStatus}
                        userRole="admin"
                      />
                    )}
                    {(activeTab === 'reports' || activeTab === 'financial-reports') && (
                      <AnalyticsReports
                        guests={stays}
                        rooms={rooms}
                        config={config}
                      />
                    )}
                    {activeTab === 'config' && (
                      <ConfigEngine
                        rooms={rooms}
                        config={config}
                        firebaseConfig={firebaseConfig}
                        auditLogs={auditLogs}
                        onSaveRooms={handleSaveRooms}
                        onSaveConfig={handleSaveConfig}
                        onSaveFirebaseConfig={(cfg) => storageService.saveFirebaseConfig(cfg)}
                        onResetDefaults={handleResetDefaults}
                      />
                    )}
                  </main>
                  <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 no-print flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
                    <p>© {new Date().getFullYear()} The Crown Hotel • Admin Console.</p>
                    <span className="font-semibold text-[#800020]">Active Role: ADMIN</span>
                  </footer>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* PROTECTED SUPERADMIN DASHBOARD ROUTE */}
        <Route 
          path="/superadmin/dashboard/*" 
          element={
            <ProtectedRoute allowedRole="superadmin">
              <div className="min-h-screen bg-[#FAF7F5] text-slate-900 flex font-sans w-full overflow-x-hidden">
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  userRole="superadmin"
                  setUserRole={() => {}}
                  config={config}
                  pendingVerificationCount={pendingSubmissions.length}
                  isMobileOpen={isMobileOpen}
                  setIsMobileOpen={setIsMobileOpen}
                />
                <div className="flex-1 w-full min-h-screen flex flex-col justify-between md:ml-64 overflow-x-hidden">
                  <Header
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    userRole="superadmin"
                    currentUser={user}
                    config={config}
                    onQuickCheckIn={() => setActiveTab('guest-entry')}
                    onLogout={handleLogout}
                    onOpenAuth={() => navigate('/login')}
                    pendingVerificationCount={pendingSubmissions.length}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                  />
                  <main className="flex-1 w-full px-4 sm:px-8 py-6 space-y-6">
                    {/* SuperAdmin Multi-Tab Rendering */}
                    {activeTab === 'dashboard' && (
                      <Dashboard
                        rooms={rooms}
                        guests={stays}
                        reservations={reservations}
                        config={config}
                        onOpenCheckIn={(rmId) => { setPreSelectedRoomId(rmId); setActiveTab('guest-entry'); }}
                        onOpenRoomService={(gst) => setActiveServiceGuest(gst)}
                        onOpenCheckout={(gst) => setActiveCheckoutGuest(gst)}
                        onUpdateRoomStatus={handleUpdateRoomStatus}
                        userRole="superadmin"
                      />
                    )}
                    {activeTab === 'verification-queue' && (
                      <GuestVerificationQueue
                        pendingSubmissions={pendingSubmissions}
                        rooms={rooms}
                        onApproveAndAllocateRoom={handleApproveAndAllocateRoom}
                        onRejectSubmission={handleRejectSubmission}
                        config={config}
                      />
                    )}
                    {activeTab === 'guest-entry' && (
                      <GuestEntryForm
                        rooms={rooms}
                        guestMasters={guestMasters}
                        config={config}
                        onSaveCheckIn={handleSaveCheckIn}
                        preSelectedRoomId={preSelectedRoomId}
                        preSelectedReservation={preSelectedReservation}
                        userRole="superadmin"
                      />
                    )}
                    {activeTab === 'guest-portal' && (
                      <GuestSelfPortal
                        config={config}
                        onSubmitSelfRegistration={handleSubmitSelfRegistration}
                      />
                    )}
                    {activeTab === 'reservations' && (
                      <ReservationModule
                        reservations={reservations}
                        rooms={rooms}
                        config={config}
                        onSaveReservation={async (newRes) => {
                          try {
                            await api.post('/reservations', newRes);
                            await loadAllData();
                            showToast('Reservation saved successfully!', 'success');
                          } catch (e) {
                            alert(e.response?.data?.error || e.message);
                          }
                        }}
                        onCancelReservation={async (resId) => {
                          try {
                            await api.delete(`/reservations/${resId}`);
                            await loadAllData();
                            showToast('Reservation cancelled', 'info');
                          } catch (e) {
                            alert(e.response?.data?.error || e.message);
                          }
                        }}
                        onConvertToCheckIn={(res) => {
                          setPreSelectedRoomId(res.roomId);
                          setPreSelectedReservation(res);
                          setActiveTab('guest-entry');
                        }}
                      />
                    )}
                    {activeTab === 'housekeeping' && (
                      <HousekeepingModule
                        rooms={rooms}
                        onUpdateRoomStatus={handleUpdateRoomStatus}
                        userRole="superadmin"
                      />
                    )}
                    {(activeTab === 'reports' || activeTab === 'financial-reports') && (
                      <AnalyticsReports
                        guests={stays}
                        rooms={rooms}
                        config={config}
                      />
                    )}
                    {(activeTab === 'config' || activeTab === 'website-content' || activeTab === 'room-management') && (
                      <ConfigEngine
                        rooms={rooms}
                        config={config}
                        firebaseConfig={firebaseConfig}
                        auditLogs={auditLogs}
                        onSaveRooms={handleSaveRooms}
                        onSaveConfig={handleSaveConfig}
                        onSaveFirebaseConfig={(cfg) => storageService.saveFirebaseConfig(cfg)}
                        onResetDefaults={handleResetDefaults}
                      />
                    )}
                    {(activeTab === 'superadmin' || activeTab === 'manage-admins' || activeTab === 'roles-permissions' || activeTab === 'guest-database' || activeTab === 'audit-logs') && (
                      <SuperAdminPanel
                        activeTab={activeTab}
                        rooms={rooms}
                        guestMasters={guestMasters}
                        config={config}
                        adminAccounts={adminAccounts}
                        onCreateAdminAccount={handleCreateAdminAccount}
                        onDeleteAdminAccount={handleDeleteAdminAccount}
                        onSaveRooms={handleSaveRooms}
                        onSaveConfig={handleSaveConfig}
                      />
                    )}
                  </main>
                  <footer className="w-full border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 no-print flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
                    <p>© {new Date().getFullYear()} The Crown Hotel • SuperAdmin Console.</p>
                    <span className="font-semibold text-[#800020]">Active Role: SUPERADMIN</span>
                  </footer>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* CATCH-ALL ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals */}
      {activeServiceGuest && (
        <RoomServiceModal
          guest={activeServiceGuest}
          config={config}
          onClose={() => setActiveServiceGuest(null)}
          onAddService={handleAddService}
        />
      )}

      {activeCheckoutGuest && (
        <BillingCheckoutModal
          guest={activeCheckoutGuest}
          config={config}
          onClose={() => setActiveCheckoutGuest(null)}
          onCompleteCheckout={handleCompleteCheckout}
          onOpenInvoice={(gst, billingDetails) => setInvoiceModalData({ guest: gst, billingDetails })}
        />
      )}

      {registrationSlipGuest && (
        <RegistrationSlipModal
          guest={registrationSlipGuest}
          config={config}
          onClose={() => setRegistrationSlipGuest(null)}
        />
      )}

      {invoiceModalData && (
        <InvoicePrintModal
          guest={invoiceModalData.guest}
          billingDetails={invoiceModalData.billingDetails}
          config={config}
          onClose={() => setInvoiceModalData(null)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
