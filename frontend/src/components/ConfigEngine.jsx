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
  ShieldCheck,
  Image as ImageIcon,
  X
} from 'lucide-react';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

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
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [roomForm, setRoomForm] = useState({
    number: '',
    floor: 1,
    category: 'Deluxe AC',
    pricePerNight: 2500,
    status: 'vacant',
    amenities: 'AC, TV, Geyser, WiFi',
    description: '',
    images: []
  });

  // Photo Upload Handler for Multi-Photos
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingPhotos(true);
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));

    try {
      const res = await api.post('/rooms/upload-photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.urls) {
        setRoomForm(prev => ({
          ...prev,
          images: [...prev.images, ...res.data.urls]
        }));
      }
    } catch (err) {
      // Base64 fallback if offline or backend upload fails
      for (const file of files) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setRoomForm(prev => ({
            ...prev,
            images: [...prev.images, reader.result]
          }));
        };
        reader.readAsDataURL(file);
      }
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    setRoomForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddManualUrl = () => {
    if (!manualImageUrl.trim()) return;
    setRoomForm(prev => ({
      ...prev,
      images: [...prev.images, manualImageUrl.trim()]
    }));
    setManualImageUrl('');
  };

  // Handle Room Save (Add or Edit) - STRICTLY targeted to editingRoom._id / id
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    const amenitiesArr = roomForm.amenities.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      roomNumber: roomForm.number,
      floor: Number(roomForm.floor),
      category: roomForm.category,
      pricePerNight: Number(roomForm.pricePerNight),
      price: Number(roomForm.pricePerNight),
      status: roomForm.status || 'vacant',
      amenities: amenitiesArr,
      images: roomForm.images,
      description: roomForm.description
    };
    
    try {
      if (editingRoom) {
        const targetId = editingRoom._id || editingRoom.id;
        await api.put(`/rooms/${targetId}`, payload);
      } else {
        await api.post('/rooms', payload);
      }
      if (onSaveRooms) await onSaveRooms();
      setRoomModalOpen(false);
      setEditingRoom(null);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleOpenEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      number: room.roomNumber || room.number || '',
      floor: room.floor || 1,
      category: room.category || 'Deluxe AC',
      pricePerNight: room.pricePerNight || room.price || 2500,
      status: room.status || 'vacant',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : (room.amenities || ''),
      description: room.description || '',
      images: Array.isArray(room.images) ? [...room.images] : []
    });
    setRoomModalOpen(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (confirm("Are you sure you want to remove this room from master inventory?")) {
      try {
        await api.delete(`/rooms/${roomId}`);
        if (onSaveRooms) await onSaveRooms();
      } catch (err) {
        alert(err.response?.data?.error || err.message);
      }
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
            {rooms.map(room => {
              const rId = room._id || room.id;
              const rNumber = room.roomNumber || room.number;
              const rPrice = room.pricePerNight || room.price || 2500;
              const rImages = room.images || [];

              return (
                <div key={rId} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 relative group">
                  {rImages.length > 0 && (
                    <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                      <img 
                        src={getImageUrl(rImages[0])} 
                        alt={`Room ${rNumber}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-500/30 flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{rImages.length} Photos</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-black text-white font-mono">Room {rNumber}</span>
                      <p className="text-xs text-slate-400 font-medium">Floor {room.floor} | {room.category}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-mono">
                      {config.currencySymbol}{rPrice}/night
                    </span>
                  </div>

                  {room.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 italic">{room.description}</p>
                  )}

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
                      <span>Edit Price/Photos</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(rId)}
                      className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-lg border border-slate-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
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

      {/* TAB 3: CUSTOM GUEST FIELDS BUILDER */}
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

      {/* TAB 4: AUDIT LOGS */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-modal max-w-lg w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-serif">
                {editingRoom ? `Edit Room ${roomForm.number || ''}` : 'Add New Master Room'}
              </h3>
              <button onClick={() => setRoomModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
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

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Room Description</label>
                <textarea
                  rows="2"
                  placeholder="Luxury suite with king size bed, scenic balcony view, and jacuzzi..."
                  value={roomForm.description}
                  onChange={(e) => setRoomForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500"
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

              {/* Multi-Photo Upload Section */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-amber-400 uppercase flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Room Photo Gallery ({roomForm.images.length} photos)</span>
                  </label>
                </div>

                {/* Upload Button */}
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center space-x-1.5 shrink-0 transition">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>{uploadingPhotos ? 'Uploading...' : 'Upload Photos'}</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      disabled={uploadingPhotos} 
                      className="hidden" 
                    />
                  </label>

                  <input
                    type="url"
                    placeholder="Or paste photo URL..."
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold rounded-xl border border-amber-500/40"
                  >
                    Add
                  </button>
                </div>

                {/* Image Previews Grid */}
                {roomForm.images.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 pt-2 max-h-36 overflow-y-auto p-1 bg-slate-900/50 rounded-xl border border-slate-800">
                    {roomForm.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative group/img h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                        <img src={getImageUrl(imgUrl)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-0.5 right-0.5 p-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-md opacity-90 group-hover/img:opacity-100 transition shadow"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No photos uploaded for this room yet.</p>
                )}
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow"
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

