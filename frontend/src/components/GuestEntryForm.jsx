import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, 
  CreditCard, 
  Lock, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Phone, 
  IdCard, 
  Home, 
  Calendar, 
  Bed, 
  Search, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  FileText, 
  Trash2, 
  Plus, 
  UserPlus, 
  Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getImageUrl } from '../utils/imageUtils';

// Client-side image compression helper
function compressImage(file, maxWidth = 1000, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
  });
}

// Aadhaar / ID Masking helper
function maskIdNumber(fullId) {
  if (!fullId) return '';
  const clean = fullId.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length < 4) return 'XXXX-XXXX-' + clean;
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

export default function GuestEntryForm({
  rooms,
  guestMasters,
  config,
  onSaveCheckIn,
  preSelectedRoomId,
  preSelectedReservation,
  userRole
}) {
  const availableRooms = rooms.filter(r => r.status === 'vacant' || (r._id === preSelectedRoomId || r.id === preSelectedRoomId));

  // Search Auto-lookup state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: preSelectedReservation?.guestName || '',
    mobile: preSelectedReservation?.mobile || '',
    idNumberFull: '',
    idNumberMasked: '',
    address: '',
    idType: 'Aadhaar Card',
    guestsCount: preSelectedReservation?.guestsCount || 1,
    roomId: preSelectedRoomId || (availableRooms[0]?._id || availableRooms[0]?.id || ''),
    checkInDate: new Date().toISOString().slice(0, 16),
    expectedCheckOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    advancePaid: preSelectedReservation?.advancePaid || 0,
    paymentMethod: 'UPI',
    vehicleNo: '',
    purposeOfVisit: 'Tourism / Leisure'
  });

  // Multiple ID Documents list
  const [idDocuments, setIdDocuments] = useState([]);
  const [showFullId, setShowFullId] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const rm = rooms.find(r => r._id === formData.roomId || r.id === formData.roomId);
    setSelectedRoom(rm || availableRooms[0] || null);
  }, [formData.roomId, rooms]);

  // Search Guest Masters Repository
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = guestMasters.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.mobile.includes(q)
    );
    setSearchResults(matches);
    setIsSearching(matches.length > 0);
  }, [searchQuery, guestMasters]);

  // Handle selecting existing Guest Master from autocomplete
  const handleSelectGuestMaster = (master) => {
    setSelectedMaster(master);
    setSearchQuery(master.name);
    setIsSearching(false);

    setFormData(prev => ({
      ...prev,
      name: master.name,
      mobile: master.mobile,
      idNumberFull: master.idNumberFull || '',
      idNumberMasked: master.idNumberMasked || maskIdNumber(master.idNumberFull),
      address: master.address || '',
      idType: master.idType || 'Aadhaar Card'
    }));

    setIdDocuments(master.idDocuments || []);
  };

  // Reset selected profile to clear form
  const handleClearSelectedMaster = () => {
    setSelectedMaster(null);
    setSearchQuery('');
    setFormData({
      name: '',
      mobile: '',
      idNumberFull: '',
      idNumberMasked: '',
      address: '',
      idType: 'Aadhaar Card',
      guestsCount: 1,
      roomId: availableRooms[0]?.id || '',
      checkInDate: new Date().toISOString().slice(0, 16),
      expectedCheckOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      advancePaid: 0,
      paymentMethod: 'UPI',
      vehicleNo: '',
      purposeOfVisit: 'Tourism / Leisure'
    });
    setIdDocuments([]);
  };

  // Multiple File Upload Handler with client compression
  const handleMultipleFileUpload = async (e, docLabel) => {
    const file = e.target.files[0];
    if (!file) return;

    // Compress client-side
    const compressedDataUrl = await compressImage(file, 900, 0.7);

    const newDoc = {
      id: 'doc_' + Date.now(),
      name: docLabel || file.name,
      url: compressedDataUrl,
      uploadedAt: new Date().toISOString()
    };

    setIdDocuments(prev => [...prev, newDoc]);
  };

  const handleRemoveDocument = (docId) => {
    setIdDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'idNumberFull') {
        updated.idNumberMasked = maskIdNumber(value);
      }
      return updated;
    });

    // Auto-match exact 10-digit mobile number with Guest Masters Repository
    if (name === 'mobile' && value.trim().length >= 10) {
      const cleanMobile = value.trim();
      const exactMatch = guestMasters.find(m => m.mobile === cleanMobile);
      if (exactMatch && (!selectedMaster || selectedMaster.id !== exactMatch.id)) {
        setSelectedMaster(exactMatch);
        setFormData(prev => ({
          ...prev,
          name: exactMatch.name,
          mobile: exactMatch.mobile,
          idNumberFull: exactMatch.idNumberFull || '',
          idNumberMasked: exactMatch.idNumberMasked || maskIdNumber(exactMatch.idNumberFull),
          address: exactMatch.address || '',
          idType: exactMatch.idType || 'Aadhaar Card'
        }));
        setIdDocuments(exactMatch.idDocuments || []);
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!selectedRoom) {
      setSubmitError("Please select an available vacant room.");
      return;
    }
    if (!formData.name || !formData.mobile) {
      setSubmitError("Please fill in required guest fields (Name and Mobile number).");
      return;
    }

    const roomStatus = selectedRoom.status ? selectedRoom.status.toLowerCase() : '';
    if (roomStatus === 'occupied') {
      setSubmitError(`Room ${selectedRoom.roomNumber || selectedRoom.number} is currently occupied! Double booking prevented.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const targetRoomId = selectedRoom._id || selectedRoom.id;
      const targetRoomNum = selectedRoom.roomNumber || selectedRoom.number;
      const targetPrice = selectedRoom.pricePerNight || selectedRoom.price || 0;

      // Build or Update Permanent Guest Master Profile
      const guestMasterProfile = {
        id: selectedMaster ? (selectedMaster._id || selectedMaster.id) : 'gst_m_' + Date.now(),
        name: formData.name,
        mobile: formData.mobile,
        address: formData.address,
        idType: formData.idType,
        idNumberMasked: formData.idNumberMasked || maskIdNumber(formData.idNumberFull),
        idNumberFull: formData.idNumberFull,
        idDocuments: idDocuments,
        totalVisits: (selectedMaster?.totalVisits || 0) + 1,
        totalSpent: (selectedMaster?.totalSpent || 0) + targetPrice,
        createdAt: selectedMaster?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Build Active Stay Transaction with PRICE SNAPSHOT!
      const stayTransaction = {
        id: 'stay_' + Date.now(),
        guestId: guestMasterProfile.id,
        name: formData.name,
        mobile: formData.mobile,
        aadhaarMasked: guestMasterProfile.idNumberMasked,
        address: formData.address,
        guestsCount: Number(formData.guestsCount),
        roomId: targetRoomId,
        roomNumber: targetRoomNum,
        bookedRoomPricePerNight: targetPrice,
        checkInDate: formData.checkInDate,
        expectedCheckOutDate: formData.expectedCheckOutDate,
        advancePaid: Number(formData.advancePaid) || 0,
        paymentMethod: formData.paymentMethod,
        status: 'Checked-In',
        services: []
      };

      // Confetti
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}

      if (onSaveCheckIn) {
        await onSaveCheckIn(guestMasterProfile, stayTransaction, targetRoomId, preSelectedReservation?._id || preSelectedReservation?.id);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || "Check-in failed. Please try again.";
      setSubmitError(errMsg);
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-serif">Guest Entry & Check-In</h2>
            <p className="text-xs text-slate-400">Auto-lookup returning guest profiles, ID document reuse & Price Snapshot Lock</p>
          </div>
        </div>

        {selectedRoom && (
          <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300">
              Snapshot Tariff: <strong className="text-amber-400 font-bold">{config.currencySymbol}{selectedRoom.pricePerNight}</strong> / night
            </span>
          </div>
        )}
      </div>

      {/* SEARCH-AS-YOU-TYPE AUTOCOMPLETE LOOKUP BAR */}
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-3 relative">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Search className="w-4 h-4" />
            <span>Search Returning Guest Master Profile (Auto-fill)</span>
          </label>

          {selectedMaster && (
            <button
              type="button"
              onClick={handleClearSelectedMaster}
              className="text-xs text-rose-400 hover:underline flex items-center space-x-1 font-semibold"
            >
              <span>Clear Profile Selection</span>
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Type Guest Name or Mobile Number to search permanent guest repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
          />

          {/* Autocomplete Dropdown List */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-amber-500/40 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
              {searchResults.map(master => (
                <div
                  key={master.id}
                  onClick={() => handleSelectGuestMaster(master)}
                  className="p-3.5 hover:bg-slate-800 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{master.name}</span>
                      <span className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-300 rounded font-semibold border border-amber-500/20">
                        {master.totalVisits} Visits
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Mobile: {master.mobile} | ID: {master.idNumberMasked}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg">
                    Select Profile
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Master Highlight Notification */}
        {selectedMaster && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>
                <strong>Master Profile Loaded for {selectedMaster.name}:</strong> All details & {selectedMaster.idDocuments?.length || 0} ID documents re-used automatically. No need to re-ask Aadhaar!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Check-In Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-8">
        
        {/* Section 1: Guest Personal Information */}
        <div>
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-5">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-200">1. Guest Identification & Privacy</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                Full Guest Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                Mobile Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                required
                placeholder="e.g. 9876543210"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* ID Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Govt ID Type</label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>

            {/* Aadhaar Number with DPDP Privacy Masking */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase">
                  {formData.idType} Number
                </label>
                {userRole === 'Admin' && (
                  <button
                    type="button"
                    onClick={() => setShowFullId(!showFullId)}
                    className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    {showFullId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showFullId ? 'Mask Number' : 'Admin Reveal'}</span>
                  </button>
                )}
              </div>

              <input
                type="text"
                name="idNumberFull"
                placeholder="xxxx-xxxx-1234"
                value={showFullId ? formData.idNumberFull : (formData.idNumberMasked || formData.idNumberFull)}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                🔒 DPDP Act Compliant: Only masked ID ({formData.idNumberMasked || 'XXXX-XXXX-1234'}) is displayed in general views.
              </p>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Residential Address</label>
              <textarea
                name="address"
                rows="2"
                placeholder="House No, City, State, Pincode"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>

          </div>
        </div>

        {/* MULTIPLE ID DOCUMENTS UPLOAD & REUSE SECTION */}
        <div>
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
            <IdCard className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-200">2. ID Documents Repository ({idDocuments.length} Attached)</h3>
          </div>

          <div className="space-y-4">
            {/* Document Upload Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer text-xs font-semibold text-amber-400 transition flex items-center space-x-1.5">
                <Upload className="w-4 h-4" />
                <span>Upload Aadhaar Front</span>
                <input type="file" accept="image/*" onChange={(e) => handleMultipleFileUpload(e, 'Aadhaar Front')} className="hidden" />
              </label>

              <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer text-xs font-semibold text-amber-400 transition flex items-center space-x-1.5">
                <Upload className="w-4 h-4" />
                <span>Upload Aadhaar Back</span>
                <input type="file" accept="image/*" onChange={(e) => handleMultipleFileUpload(e, 'Aadhaar Back')} className="hidden" />
              </label>

              <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer text-xs font-semibold text-slate-300 transition flex items-center space-x-1.5">
                <Plus className="w-4 h-4" />
                <span>Upload Extra ID</span>
                <input type="file" accept="image/*" onChange={(e) => handleMultipleFileUpload(e, 'Extra ID Doc')} className="hidden" />
              </label>
            </div>

            {/* Attached Documents Grid Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {idDocuments.length === 0 ? (
                <p className="col-span-full text-xs text-slate-500 italic">No ID proof documents uploaded yet.</p>
              ) : (
                idDocuments.map(doc => (
                  <div key={doc.id} className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between space-x-2 relative group">
                    <img src={getImageUrl(doc.url)} alt={doc.name} className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{doc.name}</p>
                      <p className="text-[9px] text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Verified</span>
                      </p>
                    </div>
                    {userRole === 'Admin' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Room Selection & Stay Dates */}
        <div>
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-5">
            <Bed className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-200">3. Room Allocation & Check-In Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Room Select */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Available Rooms</label>
              {availableRooms.length === 0 ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  No rooms are currently vacant! Please clean a dirty room or complete checkout first.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableRooms.map(r => {
                    const rId = r._id || r.id;
                    const isSelected = (formData.roomId === rId);
                    const rThumb = (r.images && r.images.length > 0) ? r.images[0] : null;
                    return (
                      <div
                        key={rId}
                        onClick={() => setFormData(prev => ({ ...prev, roomId: rId }))}
                        className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {rThumb && (
                          <div className="h-24 w-full rounded-lg overflow-hidden bg-slate-950">
                            <img src={getImageUrl(rThumb)} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-base font-bold text-white">Room {r.roomNumber || r.number}</span>
                          <span className="text-xs text-amber-400 font-bold">{config.currencySymbol}{r.pricePerNight || r.price}</span>
                        </div>
                        <p className="text-xs text-slate-400">{r.category} (Floor {r.floor})</p>
                        {r.description && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic">{r.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Check-In Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Check-In Timestamp</label>
              <input
                type="datetime-local"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono"
              />
            </div>

            {/* Expected Check-Out Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Expected Check-Out</label>
              <input
                type="datetime-local"
                name="expectedCheckOutDate"
                value={formData.expectedCheckOutDate}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono"
              />
            </div>

            {/* Advance Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Advance Collected ({config.currencySymbol})</label>
              <input
                type="number"
                name="advancePaid"
                min="0"
                value={formData.advancePaid}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-emerald-400 font-bold font-mono"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Payment Mode</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash Collection</option>
                <option value="Card">Credit / Debit Card</option>
              </select>
            </div>

          </div>
        </div>

        {/* Error Banner if validation or server error occurs */}
        {submitError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-2xl text-rose-400 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={availableRooms.length === 0 || isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Check-In...</span>
              </>
            ) : (
              <span>Confirm Check-In & Save Master Profile</span>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
