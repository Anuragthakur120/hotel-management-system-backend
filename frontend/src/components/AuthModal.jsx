import React, { useState } from 'react';
import { Crown, ArrowRight, X } from 'lucide-react';
import api from '../services/api';

export default function AuthModal({ onLogin, onClose }) {
  const [activeTab, setActiveTab] = useState('guest-login'); // 'guest-login', 'staff-login', or 'register'
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || !password) {
      setError('Please fill all required fields');
      return;
    }

    try {
      if (activeTab === 'register') {
        if (!name) {
          setError('Please enter your full name');
          return;
        }
        const res = await api.post('/auth/register', { name, mobile, password });
        setActiveTab('guest-login');
        setError('Registration successful. Please log in.');
        setPassword('');
      } else {
        const roleStr = activeTab === 'staff-login' ? 'staff' : 'guest';
        const res = await api.post('/auth/login', { 
          username: mobile.trim(), 
          mobile: mobile.trim(), 
          password: password.trim(), 
          role: roleStr 
        });
        const data = res.data;
        
        onLogin({
          ...data.user,
          token: data.token
        });
      }
    } catch (err) {
      let errMsg = 'Authentication failed';
      if (err.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (err.message === 'Network Error') {
        errMsg = 'Unable to reach backend server. Please check internet connection or server status.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#800020] text-[#C9A24B] flex items-center justify-center shadow-lg shadow-[#800020]/20">
            <Crown className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#800020]">The Crown Hotel</h2>
          <p className="text-xs text-slate-500">Sign in to your Guest Portal or Staff Account</p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setActiveTab('guest-login'); setError(''); }}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'guest-login' ? 'bg-[#800020] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guest Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('staff-login'); setError(''); }}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'staff-login' ? 'bg-[#800020] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Staff Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'register' ? 'bg-[#800020] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register Guest
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className={`text-xs p-2.5 rounded-xl border text-center font-medium ${
              error.includes('successful') 
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                : 'text-rose-600 bg-rose-50 border-rose-200'
            }`}>
              {error}
            </p>
          )}

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#800020]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              {activeTab === 'staff-login' ? 'Username / Mobile' : 'Mobile Number'}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={activeTab === 'staff-login' ? 'admin / 9888800000' : '10-Digit Mobile'}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#800020]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              {activeTab === 'staff-login' ? 'Password' : 'PIN'}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#800020]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl shadow-md shadow-[#800020]/20 transition flex items-center justify-center space-x-2"
          >
            <span>{activeTab === 'register' ? 'Create Guest Account' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4 text-[#C9A24B]" />
          </button>
        </form>
      </div>
    </div>
  );
}
