import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Smartphone, 
  UserCheck, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  IdCard, 
  ArrowRight, 
  Sparkles, 
  Bed,
  FileText,
  User,
  History,
  XCircle,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function GuestSelfPortal({
  config = {},
  onSubmitSelfRegistration
}) {
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'status' | 'history' | 'submit'
  const [loading, setLoading] = useState(true);
  const [guestProfile, setGuestProfile] = useState(null);
  const [staysHistory, setStaysHistory] = useState([]);
  
  // Mobile login for unauthenticated visitors
  const [mobileInput, setMobileInput] = useState('');
  const [isMobileSearched, setIsMobileSearched] = useState(false);

  // Form State for submission / edit
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    idType: 'Aadhaar Card',
    idNumberFull: '',
    guestsCount: 1,
    expectedCheckIn: new Date().toISOString().slice(0, 16)
  });

  const [idDocUrl, setIdDocUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Load guest profile & stays from backend
  const loadGuestData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/guests/my-profile');
      if (res.data && res.data.profile) {
        const prof = res.data.profile;
        setGuestProfile(prof);
        setStaysHistory(res.data.stays || []);
        setFormData({
          name: prof.name || '',
          mobile: prof.mobile || '',
          email: prof.email || '',
          address: prof.address || '',
          idType: prof.idType || 'Aadhaar Card',
          idNumberFull: prof.idNumberFull || '',
          guestsCount: 1,
          expectedCheckIn: new Date().toISOString().slice(0, 16)
        });
        if (prof.idDocuments && prof.idDocuments.length > 0) {
          setIdDocUrl(prof.idDocuments[0].url);
        }
        setIsMobileSearched(true);
      }
    } catch (err) {
      console.warn("Guest profile fetch note:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuestData();
  }, []);

  // Handle image upload via Multer file endpoint
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await api.post('/guests/upload-id', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.url) {
        setIdDocUrl(res.data.url);
        return;
      }
    } catch (err) {
      console.warn("Multer upload endpoint fallback to data URL:", err.message);
    }

    // Fallback if API offline or file upload fallback
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      setIdDocUrl(ev.target.result);
    };
  };

  // Submit / Update Profile & ID proof
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      setFeedback({ message: 'Name and Mobile are required.', type: 'error' });
      return;
    }

    setSaving(true);
    setFeedback({ message: '', type: '' });

    try {
      // Ensure idDocUrl is strictly a string URL, never an object
      const cleanUrl = typeof idDocUrl === 'object' && idDocUrl !== null ? (idDocUrl.url || '') : (idDocUrl || '');

      const payload = {
        name: formData.name,
        mobile: formData.mobile,
        address: formData.address,
        idType: formData.idType,
        idNumberFull: formData.idNumberFull,
        idDocUrl: cleanUrl
      };

      // Call backend API
      const res = await api.post('/guests/submit-self', payload);
      
      setFeedback({ message: 'Profile & Check-in request submitted successfully! Pending verification by reception.', type: 'success' });
      
      if (onSubmitSelfRegistration) {
        onSubmitSelfRegistration(res.data.profile || payload);
      }

      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      } catch (err) {}

      await loadGuestData();
      setActiveSubTab('status');
    } catch (err) {
      setFeedback({ message: err.response?.data?.error || 'Failed to submit profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const currentStatus = guestProfile?.verificationStatus || 'pending';
  const activeStay = staysHistory.find(s => s.status === 'Checked-In');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Crown Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#800020] to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-[#C9A24B]/30 shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C9A24B]/20 border border-[#C9A24B]/40 flex items-center justify-center text-[#C9A24B] shadow-inner">
          <Crown className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-wide text-amber-100">
          {config.hotelName || 'The Crown Hotel'} — Guest Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-light">
          Manage your guest profile, upload ID proof for fast check-in verification, and view your complete stay history.
        </p>

        {/* Verification Status Quick Badge */}
        <div className="pt-2 flex justify-center items-center space-x-2">
          {currentStatus === 'valid' ? (
            <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/40 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{activeStay ? `Approved — Room ${activeStay.roomNumber} Assigned` : 'Approved — Identity Verified & Validated'}</span>
            </span>
          ) : currentStatus === 'invalid' ? (
            <span className="px-4 py-1.5 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full border border-rose-500/40 flex items-center space-x-1.5">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Rejected — Verification Invalid (Please re-upload ID)</span>
            </span>
          ) : (
            <span className="px-4 py-1.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/40 flex items-center space-x-1.5 animate-pulse">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Verification — Reception Approval In Progress</span>
            </span>
          )}
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 bg-white p-2 rounded-2xl shadow-sm border">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center space-x-2 ${
            activeSubTab === 'profile' ? 'bg-[#800020] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveSubTab('status')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center space-x-2 ${
            activeSubTab === 'status' ? 'bg-[#800020] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verification Status</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center space-x-2 ${
            activeSubTab === 'history' ? 'bg-[#800020] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stay History</span>
        </button>

        <button
          onClick={() => setActiveSubTab('submit')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center space-x-2 ${
            activeSubTab === 'submit' ? 'bg-[#800020] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Submit Check-In</span>
        </button>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 border ${
          feedback.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {feedback.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TAB 1: MY PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">Guest Profile Details</h2>
              <p className="text-xs text-slate-500">Your registered contact info and verified identity credentials</p>
            </div>
            <button
              onClick={loadGuestData}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData(p => ({ ...p, mobile: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:bg-white focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Government ID Type</label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData(p => ({ ...p, idType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-[#800020]"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full ID Number (Strictly Protected Access)</label>
                <input
                  type="text"
                  placeholder="e.g. 1234-5678-9012"
                  value={formData.idNumberFull}
                  onChange={(e) => setFormData(p => ({ ...p, idNumberFull: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:bg-white focus:border-[#800020]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Permanent Residential Address</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-[#800020]"
                ></textarea>
              </div>
            </div>

            {/* Document Preview & Upload */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase">Uploaded Identity Proof Document</label>
              <div className="flex items-center space-x-4">
                <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer text-xs font-bold text-[#800020] flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>{idDocUrl ? 'Replace Uploaded ID Document' : 'Upload ID Proof Scan'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {idDocUrl && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ID Proof Attached</span>
                  </span>
                )}
              </div>

              {idDocUrl && (
                <div className="pt-2">
                  <img src={idDocUrl} alt="Uploaded ID" className="w-40 h-28 object-cover rounded-xl border border-slate-300 shadow-sm" />
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#800020] hover:bg-[#600018] text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <span>{saving ? 'Saving...' : 'Update & Re-Submit Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: VERIFICATION STATUS */}
      {activeSubTab === 'status' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-center">
          {currentStatus === 'valid' ? (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-slate-900">Your Identity is Verified!</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Reception has verified your ID document ({guestProfile?.idType || 'Govt ID'}). You enjoy fast-track check-in and seamless access at {config.hotelName}.
              </p>
            </div>
          ) : currentStatus === 'invalid' ? (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 border-2 border-rose-500 flex items-center justify-center text-rose-600">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-slate-900">Verification Requires Attention</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your submitted ID scan could not be verified by reception. Please upload a clear photo or government ID document under "My Profile".
              </p>
              <button
                onClick={() => setActiveSubTab('profile')}
                className="px-6 py-2.5 bg-[#800020] text-white font-bold text-xs rounded-xl shadow"
              >
                Re-upload ID Document
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-amber-600 animate-pulse">
                <Clock className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-slate-900">Check-in Request Under Review</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your uploaded check-in details have been submitted to reception. Once verified, room allocation will update automatically.
              </p>
            </div>
          )}

          {/* Profile Summary Card */}
          {guestProfile && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Registered Name:</span>
                <strong className="text-slate-900 font-semibold">{guestProfile.name}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Mobile Number:</span>
                <span className="font-mono text-slate-900 font-bold">{guestProfile.mobile}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Document Type:</span>
                <span className="text-slate-800">{guestProfile.idType || 'Aadhaar Card'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Visits:</span>
                <span className="font-bold text-[#800020]">{guestProfile.totalVisits || 1} Stay/s</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STAY HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif">Booking & Stay History</h2>
            <p className="text-xs text-slate-500">Your past and active room stays at {config.hotelName}</p>
          </div>

          {staysHistory.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Bed className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-xs text-slate-500">No previous stay records found for mobile {formData.mobile}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {staysHistory.map((stay) => (
                <div key={stay._id || stay.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-[#800020] text-white text-xs font-bold rounded-lg font-mono">
                        Room {stay.roomNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase font-mono ${
                        stay.status === 'Checked-In' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {stay.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Check-In: <strong>{new Date(stay.checkInDate || stay.actualCheckIn || stay.createdAt).toLocaleDateString()}</strong>
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      Tariff Rate Locked: {config.currencySymbol || '₹'}{stay.bookedRoomPricePerNight || 2500}/night
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500">Advance Paid:</span>
                    <p className="text-base font-bold font-mono text-emerald-700">
                      {config.currencySymbol || '₹'}{stay.advancePaid || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SUBMIT NEW CHECK-IN REQUEST */}
      {activeSubTab === 'submit' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif">Submit Check-In Self Request</h2>
            <p className="text-xs text-slate-500">Fast-track check-in submission for reception desk approval</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData(p => ({ ...p, mobile: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ID Document Type</label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData(p => ({ ...p, idType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ID Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1234-5678-9012"
                  value={formData.idNumberFull}
                  onChange={(e) => setFormData(p => ({ ...p, idNumberFull: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Upload ID Proof Photo / Document</label>
              <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer text-xs font-bold text-[#800020] flex items-center space-x-2 inline-flex">
                <Upload className="w-4 h-4" />
                <span>{idDocUrl ? 'Replace Document' : 'Upload Photo / ID Scan'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              {idDocUrl && (
                <img src={idDocUrl} alt="ID Preview" className="w-36 h-24 object-cover rounded-xl border border-slate-300 mt-2" />
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2"
            >
              <span>{saving ? 'Submitting...' : 'Submit Check-In Request'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

