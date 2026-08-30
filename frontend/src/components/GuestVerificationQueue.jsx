import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  ShieldCheck, 
  Bed, 
  UserCheck, 
  Clock, 
  Eye, 
  AlertCircle, 
  Trash2, 
  Check 
} from 'lucide-react';

export default function GuestVerificationQueue({
  pendingSubmissions = [],
  rooms = [],
  onApproveAndAllocateRoom,
  onRejectSubmission,
  config = {}
}) {
  const availableRooms = rooms.filter(r => r.status === 'vacant' || r.status === 'available');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isAllocating, setIsAllocating] = useState(false);

  const handleOpenAllocateModal = (sub) => {
    setSelectedSubmission(sub);
    setEditForm({ ...sub });
    const initialId = availableRooms[0]?._id || availableRooms[0]?.id || '';
    setSelectedRoomId(initialId);
    setIsEditing(false);
  };

  const handleApprove = async () => {
    if (!selectedRoomId) {
      alert("Please select a vacant room to allocate.");
      return;
    }
    const targetRoom = rooms.find(r => r._id === selectedRoomId || r.id === selectedRoomId);
    if (!targetRoom) {
      alert("Selected room not found. Please choose another vacant room.");
      return;
    }

    setIsAllocating(true);
    try {
      if (onApproveAndAllocateRoom) {
        await onApproveAndAllocateRoom(editForm, targetRoom);
      }
      setSelectedSubmission(null);
    } catch (err) {
      alert(err.message || "Failed to allocate room.");
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Guest Self-Submission Verification Queue</h2>
            <p className="text-xs text-slate-600">Verify guest self-registered details, validate ID proofs & allocate rooms</p>
          </div>
        </div>

        <span className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 font-bold text-xs font-mono shadow-sm">
          {pendingSubmissions.length} Pending Submissions
        </span>
      </div>

      {/* Submissions List */}
      {pendingSubmissions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900 font-serif">Verification Queue Clear!</h3>
          <p className="text-xs text-slate-600">No self-submitted check-in requests pending verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {pendingSubmissions.map((sub) => (
            <div key={sub.id} className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition space-y-4 relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-slate-900 font-serif">{sub.name}</span>
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-lg">
                      Pending Verification
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono mt-1">Mobile: {sub.mobile}</p>
                </div>

                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-lg">
                  {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <p className="text-slate-700">ID Type: <strong className="text-slate-900 font-bold">{sub.idType}</strong> ({sub.idNumberMasked || 'Provided'})</p>
                <p className="text-slate-600 line-clamp-1">Address: {sub.address || 'N/A'}</p>
                {sub.idDocUrl && (
                  <div className="pt-1">
                    <img src={sub.idDocUrl} alt="Submitted ID" className="w-24 h-14 object-cover rounded-xl border border-slate-200 shadow-sm" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => handleOpenAllocateModal(sub)}
                  className="flex-1 py-2.5 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C9A24B]" />
                  <span>Verify & Allocate Room</span>
                </button>

                <button
                  onClick={() => onRejectSubmission(sub.id)}
                  className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl transition"
                  title="Reject Submission"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification & Room Allocation Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                Verify Guest Details & Allocate Room
              </h3>
              <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-slate-700 p-1">✕</button>
            </div>

            {/* Editable Guest Info */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#800020] uppercase tracking-wider text-[11px]">Self-Submitted Data</span>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[#800020] hover:underline font-bold flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Done Editing' : 'Correct / Edit Fields'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Guest Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={editForm.name}
                    onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold disabled:opacity-80"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={editForm.mobile}
                    onChange={(e) => setEditForm(p => ({ ...p, mobile: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono disabled:opacity-80"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">ID Type</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={editForm.idType}
                    onChange={(e) => setEditForm(p => ({ ...p, idType: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 disabled:opacity-80"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">ID Number</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={editForm.idNumberFull || editForm.idNumberMasked}
                    onChange={(e) => setEditForm(p => ({ ...p, idNumberFull: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono disabled:opacity-80"
                  />
                </div>
              </div>

              {/* Room Allocation Select */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#800020] uppercase mb-2">Select Vacant Room to Assign *</label>
                {availableRooms.length === 0 ? (
                  <p className="text-rose-600 font-bold p-2 bg-rose-50 rounded-xl border border-rose-200">No vacant rooms available right now!</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableRooms.map(rm => {
                      const rId = rm._id || rm.id;
                      const rNum = rm.roomNumber || rm.number;
                      const isSelected = selectedRoomId === rId;
                      return (
                        <div
                          key={rId}
                          onClick={() => setSelectedRoomId(rId)}
                          className={`p-3 rounded-2xl border text-center cursor-pointer transition ${
                            isSelected
                              ? 'bg-[#800020] border-[#800020] text-white shadow-md'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <p className={`font-mono font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>Room {rNum}</p>
                          <p className={`text-[10px] font-bold ${isSelected ? 'text-[#C9A24B]' : 'text-[#800020]'}`}>{config.currencySymbol}{rm.pricePerNight || rm.price}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
              <button
                disabled={isAllocating}
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleApprove}
                disabled={availableRooms.length === 0 || !selectedRoomId || isAllocating}
                className="px-6 py-2.5 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-[#C9A24B]" />
                <span>{isAllocating ? 'Allocating Room...' : 'Confirm & Check-In'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );

}
