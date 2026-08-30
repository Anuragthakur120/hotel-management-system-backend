import React, { useState } from 'react';
import { Coffee, Plus, Trash2, ShoppingBag, Utensils, Shirt, BedDouble, Check } from 'lucide-react';

const SERVICE_PRESETS = [
  { name: 'Special Breakfast Buffet', price: 350, category: 'Food', icon: Utensils },
  { name: 'Dinner Thali (Deluxe)', price: 450, category: 'Food', icon: Utensils },
  { name: 'Express Laundry Service', price: 200, category: 'Laundry', icon: Shirt },
  { name: 'Extra Bed Mattress', price: 500, category: 'Bedding', icon: BedDouble },
  { name: 'Mineral Water (2x 1L)', price: 40, category: 'Beverage', icon: Coffee },
  { name: 'Airport Pickup / Drop', price: 1200, category: 'Travel', icon: ShoppingBag },
];

export default function RoomServiceModal({ guest, config, onClose, onAddService }) {
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customCategory, setCustomCategory] = useState('Food');

  const handleAddPreset = (preset) => {
    const srv = {
      id: 'srv_' + Date.now(),
      name: preset.name,
      price: Number(preset.price),
      category: preset.category,
      date: new Date().toISOString()
    };
    onAddService(guest.id, srv);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName || !customPrice) return;
    const srv = {
      id: 'srv_' + Date.now(),
      name: customName,
      price: Number(customPrice),
      category: customCategory,
      date: new Date().toISOString()
    };
    onAddService(guest.id, srv);
    setCustomName('');
    setCustomPrice('');
  };

  const currentServices = guest?.services || [];
  const serviceTotal = currentServices.reduce((acc, item) => acc + Number(item.price), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-modal max-w-2xl w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-serif">Room Service & Folio Charges</h3>
              <p className="text-xs text-slate-400">
                Room {guest.roomNumber} — <strong className="text-amber-300">{guest.name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        {/* Quick Presets Grid */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Quick Presets</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SERVICE_PRESETS.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(preset)}
                  className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-emerald-400">{config.currencySymbol}{preset.price}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 line-clamp-1">{preset.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Service Input */}
        <form onSubmit={handleAddCustom} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Add Custom Service Charge</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Item Name (e.g. Tea & Biscuits)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
            />
            <input
              type="number"
              min="1"
              placeholder={`Price (${config.currencySymbol})`}
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Charge</span>
            </button>
          </div>
        </form>

        {/* Current Folio Added Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Added Services ({currentServices.length})</h4>
            <span className="text-xs text-emerald-400 font-mono font-bold">Total: {config.currencySymbol}{serviceTotal}</span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {currentServices.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">No room services added to folio yet.</p>
            ) : (
              currentServices.map((srv, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="font-medium text-slate-200">{srv.name}</span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{srv.category}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">{config.currencySymbol}{srv.price}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
