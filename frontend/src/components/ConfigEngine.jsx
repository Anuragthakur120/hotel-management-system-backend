import React, { useState } from 'react';
import { 
  Settings, 
  Bed, 
  DollarSign, 
  Building2, 
  ShieldAlert, 
  Key, 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  Lock, 
  Sliders, 
  History, 
  ListPlus, 
  ShieldCheck 
} from 'lucide-react';

export default function ConfigEngine({
  rooms,
  config,
  firebaseConfig,
  auditLogs = [],
  onSaveRooms,
  onSaveConfig,
  onSaveFirebaseConfig,
  onResetDefaults
}) {
  const [activeTab, setActiveTab] = useState('rooms');
  
  // Hotel Profile Form state
  const [profileForm, setProfileForm] = useState({ ...config });
  
  // Custom Fields state
  const [customFields, setCustomFields] = useState(config.customGuestFieldsList || [
    { id: 'f_1', label: 'Vehicle Registration No.', type: 'text', required: false },
    { id: 'f_2', label: 'Purpose of Visit', type: 'text', required: true },
    { id: 'f_3', label: 'Origin City / State', type: 'text', required: false }
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState('');

  // Firebase config state
  const [fbForm, setFbForm] = useState(firebaseConfig || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [showSecret, setShowSecret] = useState(false);

  // New Room Modal / Edit state
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    number: '',
    floor: 1,
    category: 'Deluxe AC',
    pricePerNight: 2500,
    status: 'vacant',
    amenities: 'AC, TV, Geyser, WiFi'
  });

  // Handle Room Save (Add or Edit)
  const handleRoomSubmit = (e) => {
    e.preventDefault();
    const amenitiesArr = roomForm.amenities.split(',').map(s => s.trim()).filter(Boolean);
    
    if (editingRoom) {
      const updatedRooms = rooms.map(r => r.id === editingRoom.id ? {
        ...r,
        number: roomForm.number,
        floor: Number(roomForm.floor),
        category: roomForm.category,
        pricePerNight: Number(roomForm.pricePerNight),
        amenities: amenitiesArr
      } : r);
      onSaveRooms(updatedRooms);
    } else {
      const newRoom = {
        id: 'rm_' + Date.now(),
        number: roomForm.number,
        floor: Number(roomForm.floor),
        category: roomForm.category,
        pricePerNight: Number(roomForm.pricePerNight),
        status: 'vacant',
        amenities: amenitiesArr,
        currentGuestId: null
      };
      onSaveRooms([...rooms, newRoom]);
    }
    setRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleOpenEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      number: room.number,
      floor: room.floor,
      category: room.category,
      pricePerNight: room.pricePerNight,
      status: room.status,
      amenities: (room.amenities || []).join(', ')
    });
    setRoomModalOpen(true);
  };

  const handleDeleteRoom = (roomId) => {
    if (confirm("Are you sure you want to remove this room from master inventory?")) {
      const updated = rooms.filter(r => r.id !== roomId);
      onSaveRooms(updated);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onSaveConfig({
      ...profileForm,
      customGuestFieldsList: customFields
    });
    alert("Hotel Profile and Configuration saved successfully!");
  };

  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;
    setCustomFields(prev => [
      ...prev,
      { id: 'f_' + Date.now(), label: newFieldLabel.trim(), type: 'text', required: false }
    ]);
    setNewFieldLabel('');
  };

  const handleRemoveField = (fieldId) => {
    setCustomFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const handleSaveFirebase = (e) => {
    e.preventDefault();
    const success = onSaveFirebaseConfig(fbForm);
    if (success) {
      alert("Firebase credentials saved and connection initialized!");
    } else {
      alert("Saved, but Firebase initialization failed. Please verify API key and Project ID.");
    }
  };

  const handleBackupExport = () => {
    const backupData = {
      rooms,
      config: profileForm,
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Crown_HMS_Config_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Configuration Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-gold-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Settings className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-serif">Admin Configuration Engine</h2>
            <p className="text-xs text-slate-400">Control Rooms, Tariffs, Taxes, Custom Fields & Audit Trail</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'rooms' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Room Master ({rooms.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'profile' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hotel & Taxes
          </button>

          <button
            onClick={() => setActiveTab('custom-fields')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'custom-fields' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Form Fields
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'audit' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Logs
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'firebase' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Firebase Config
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'backup' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Backup & Reset
          </button>
        </div>
      </div>

      {/* TAB 1: DYNAMIC ROOM MASTER */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-amber-300">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>
                <strong>Price Snapshot Architectural Rule Active:</strong> Changing room tariffs here immediately applies to future check-ins. Active & historical guest folios remain locked at their booked rate!
              </span>
            </div>

            <button
              onClick={() => {
                setEditingRoom(null);
                setRoomForm({ number: '', floor: 1, category: 'Deluxe AC', pricePerNight: 2500, status: 'vacant', amenities: 'AC, TV, Geyser, WiFi' });
                setRoomModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Room</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map(room => (
              <div key={room.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl font-black text-white font-mono">Room {room.number}</span>
                    <p className="text-xs text-slate-400 font-medium">Floor {room.floor} | {room.category}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-mono">
                    {config.currencySymbol}{room.pricePerNight}/night
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(room.amenities || []).map((a, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-400 rounded">
                      {a}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditRoom(room)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Price/Details</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-lg border border-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HOTEL PROFILE & TAXES */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-white font-serif border-b border-slate-800 pb-3">Hotel Business Profile & Financial Config</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Hotel Property Name</label>
              <input
                type="text"
                value={profileForm.hotelName}
                onChange={(e) => setProfileForm(p => ({ ...p, hotelName: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={profileForm.tagline}
                onChange={(e) => setProfileForm(p => ({ ...p, tagline: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">GSTIN Tax Registration Number</label>
              <input
                type="text"
                value={profileForm.gstNumber}
                onChange={(e) => setProfileForm(p => ({ ...p, gstNumber: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">GST Tax Rate (% Percent)</label>
              <input
                type="number"
                value={profileForm.gstTaxRatePercent}
                onChange={(e) => setProfileForm(p => ({ ...p, gstTaxRatePercent: Number(e.target.value) }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-amber-400 font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Hotel Phone Contact</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Hotel UPI VPA (For Payment QR Code)</label>
              <input
                type="text"
                value={profileForm.upiId}
                onChange={(e) => setProfileForm(p => ({ ...p, upiId: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile & Financial Config</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CUSTOM GUEST FIELDS BUILDER (PHASE 3) */}
      {activeTab === 'custom-fields' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <ListPlus className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-lg font-bold text-white font-serif">Dynamic Guest Entry Custom Fields</h3>
              <p className="text-xs text-slate-400">Add or remove custom input fields on the check-in form without developer intervention.</p>
            </div>
          </div>

          {/* Add Field Bar */}
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="e.g. Flight Number / Next Destination"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleAddField}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Field</span>
            </button>
          </div>

          {/* Active Custom Fields List */}
          <div className="space-y-3 pt-2">
            {customFields.map((field) => (
              <div key={field.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{field.label}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Type: Text | Rendered in Guest Entry Form</p>
                </div>
                <button
                  onClick={() => handleRemoveField(field.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS (PHASE 3) */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <History className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-lg font-bold text-white font-serif">System Audit Logs</h3>
              <p className="text-xs text-slate-400">Track operations, check-in history, tariff edits and role logins.</p>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 italic">
                <p>Initial system session active. Actions will be logged here automatically.</p>
              </div>
            ) : (
              auditLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-amber-300">[{log.user}]</span>
                    <span className="ml-2 text-slate-200">{log.action}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: FIREBASE INFRASTRUCTURE */}
      {activeTab === 'firebase' && (
        <form onSubmit={handleSaveFirebase} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <Key className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-lg font-bold text-white font-serif">Firebase Firestore Infrastructure Config</h3>
              <p className="text-xs text-slate-400">Connect live Firebase database. API keys are safely stored in local client storage.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Firebase API Key</label>
              <input
                type={showSecret ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={fbForm.apiKey}
                onChange={(e) => setFbForm(f => ({ ...f, apiKey: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Firebase Project ID</label>
              <input
                type="text"
                placeholder="crown-hotel-pms"
                value={fbForm.projectId}
                onChange={(e) => setFbForm(f => ({ ...f, projectId: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="text-xs text-amber-400 font-semibold"
            >
              {showSecret ? 'Hide Secret Keys' : 'Show Secret Keys'}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow"
            >
              Save & Test Firebase Connection
            </button>
          </div>
        </form>
      )}

      {/* TAB 6: BACKUP & RESET */}
      {activeTab === 'backup' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 max-w-3xl mx-auto text-center">
          <Database className="w-12 h-12 mx-auto text-amber-400" />
          <h3 className="text-xl font-bold text-white font-serif">Database Export, Backup & Reset</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Export a full JSON backup of all rooms, guests, and configuration, or restore the database back to demo default seed.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={handleBackupExport}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center space-x-2"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export JSON Backup File</span>
            </button>

            <button
              onClick={onResetDefaults}
              className="px-6 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Database to Demo Seed</span>
            </button>
          </div>
        </div>
      )}

      {/* Room Add/Edit Modal */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-modal max-w-md w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-serif">
                {editingRoom ? `Edit Room ${editingRoom.number}` : 'Add New Master Room'}
              </h3>
              <button onClick={() => setRoomModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 104"
                    value={roomForm.number}
                    onChange={(e) => setRoomForm(p => ({ ...p, number: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Floor Number *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm(p => ({ ...p, floor: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Room Category</label>
                <select
                  value={roomForm.category}
                  onChange={(e) => setRoomForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                >
                  <option value="Standard Non-AC">Standard Non-AC</option>
                  <option value="Deluxe AC">Deluxe AC</option>
                  <option value="Super Deluxe">Super Deluxe</option>
                  <option value="Crown Suite">Crown Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Live Nightly Rate ({config.currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  value={roomForm.pricePerNight}
                  onChange={(e) => setRoomForm(p => ({ ...p, pricePerNight: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Amenities (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="AC, Smart TV, Geyser, WiFi, Balcony"
                  value={roomForm.amenities}
                  onChange={(e) => setRoomForm(p => ({ ...p, amenities: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Save Master Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
