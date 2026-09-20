import React, { useState } from 'react';
import { 
  Crown, 
  Bed, 
  Wifi, 
  Tv, 
  Coffee, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  Menu, 
  X, 
} from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

function RoomCard({ room, rName, rPrice, rDesc, rAmenities, rImages, currencySymbol, onSelectRoomForCheckIn }) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group">
      
      <div className="h-56 overflow-hidden relative bg-slate-900">
        <img 
          src={getImageUrl(rImages[activeImgIndex] || rImages[0])} 
          alt={rName} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
        />
        <span className="absolute top-3 right-3 px-3 py-1 bg-[#800020] text-[#C9A24B] border border-[#C9A24B]/30 font-bold font-mono text-xs rounded-xl shadow-md">
          {currencySymbol}{rPrice} / night
        </span>

        {/* Thumbnail Selector overlay if multiple photos */}
        {rImages.length > 1 && (
          <div className="absolute bottom-2 left-2 right-2 flex space-x-1.5 overflow-x-auto p-1 bg-slate-950/60 backdrop-blur rounded-xl border border-white/10">
            {rImages.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveImgIndex(idx); }}
                className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition ${
                  activeImgIndex === idx ? 'border-[#C9A24B] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-lg font-bold text-slate-900 font-serif">{rName}</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">{rDesc}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {rAmenities.map((am, i) => (
            <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-lg">
              {am}
            </span>
          ))}
        </div>

        <button
          onClick={() => onSelectRoomForCheckIn(room)}
          className="w-full py-2.5 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl shadow-md shadow-[#800020]/20 transition flex items-center justify-center space-x-1.5"
        >
          <Sparkles className="w-4 h-4 text-[#C9A24B]" />
          <span>Book / Express Check-In</span>
        </button>
      </div>

    </div>
  );
}

export default function PublicHotelWebsite({
  rooms = [],
  config,
  onOpenGuestPortal,
  onSelectRoomForCheckIn
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roomTypes = [
    {
      id: 'deluxe',
      name: 'Deluxe AC Suite',
      price: 2500,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      description: 'Spacious air-conditioned room featuring king bed, LED TV, high-speed 5G WiFi, and 24/7 hot water.',
      amenities: ['AC', 'LED TV', 'Free WiFi', 'Hot Geyser', 'Room Service']
    },
    {
      id: 'suite',
      name: 'Executive Crown Suite',
      price: 4500,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      description: 'Luxury executive suite with private balcony, Jacuzzi bathtub, mini-fridge, and plush king bed.',
      amenities: ['AC', 'Jacuzzi', 'Balcony', 'Mini Fridge', 'WiFi']
    },
    {
      id: 'standard',
      name: 'Standard Comfortable Room',
      price: 1000,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
      description: 'Cozy and economical room with attached washroom, LED TV, and free high-speed WiFi.',
      amenities: ['LED TV', 'Free WiFi', 'Attached Washroom', '24/7 Power']
    }
  ];

  return (
    <div className="space-y-12 bg-[#FAF7F5] min-h-screen text-[#1A1A1A] pb-12">
      
      {/* STICKY TOP NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#800020] text-[#C9A24B] flex items-center justify-center shadow-md shadow-[#800020]/20">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif text-[#800020] tracking-tight">The Crown Hotel</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">LUXURY BOUTIQUE STAY</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-700">
          <a href="#hero" className="hover:text-[#800020] transition">Home</a>
          <a href="#rooms" className="hover:text-[#800020] transition">Rooms & Suites</a>
          <a href="#amenities" className="hover:text-[#800020] transition">Amenities</a>
          <a href="#contact" className="hover:text-[#800020] transition">Contact & Location</a>
        </div>

        {/* Login / Self Register CTA Button */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={onOpenGuestPortal}
            className="px-5 py-2.5 bg-[#800020] hover:bg-[#5c0017] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#800020]/20 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <UserCheck className="w-4 h-4 text-[#C9A24B]" />
            <span>Login / Register</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 py-4 bg-white border-b border-slate-200 space-y-3 shadow-lg">
          <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700">Home</a>
          <a href="#rooms" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700">Rooms & Suites</a>
          <a href="#amenities" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700">Amenities</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700">Contact</a>
          <button
            onClick={() => { onOpenGuestPortal(); setMobileMenuOpen(false); }}
            className="w-full py-3 bg-[#800020] text-white font-bold text-xs rounded-xl shadow"
          >
            Login / Self Register
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* HERO BANNER SECTION */}
        <section id="hero" className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl min-h-[460px] flex items-center justify-center p-8 sm:p-12 text-center bg-slate-900">
          
          <div 
            className="absolute inset-0 bg-cover bg-center brightness-[0.4]"
            style={{ backgroundImage: `url('${config.heroBannerUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80'}')` }}
          ></div>

          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="px-4 py-1.5 bg-[#800020]/80 text-[#C9A24B] border border-[#C9A24B]/40 rounded-full text-xs font-bold font-mono tracking-wider uppercase backdrop-blur-md">
              👑 Welcome to The Crown Hotel
            </span>

            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-white leading-tight">
              Unmatched Luxury & Self Check-In
            </h2>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
              {config.tagline || 'Experience premium comfort across 12 luxury rooms. Express mobile self check-in available 24/7.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById('rooms');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-[#800020] hover:bg-[#5c0017] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#800020]/40 flex items-center space-x-2 transition transform hover:scale-105"
              >
                <span>View Rooms & Tariffs</span>
                <ArrowRight className="w-4 h-4 text-[#C9A24B]" />
              </button>

              <button
                onClick={onOpenGuestPortal}
                className="px-6 py-3 bg-white/90 hover:bg-white text-slate-900 font-bold text-xs rounded-xl border border-slate-300 backdrop-blur-md shadow transition"
              >
                Express Mobile Check-In
              </button>
            </div>
          </div>
        </section>

        {/* ROOMS & SUITES GRID SHOWCASE */}
        <section id="rooms" className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#800020] font-mono tracking-widest uppercase">ACCOMMODATIONS</span>
            <h3 className="text-3xl font-bold font-serif text-slate-900">Luxury Rooms & Suites</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Explore our available rooms and luxury suites</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {((rooms && rooms.length > 0) ? rooms : roomTypes).map(room => {
              const rId = room._id || room.id;
              const rName = room.category ? `Room ${room.roomNumber || room.number} - ${room.category}` : (room.name || 'Luxury Room');
              const rPrice = room.pricePerNight || room.price || 2500;
              const rDesc = room.description || 'Spacious air-conditioned room featuring king bed, LED TV, high-speed WiFi, and 24/7 hot water.';
              const rAmenities = room.amenities || ['AC', 'LED TV', 'Free WiFi', 'Hot Geyser'];
              const rImages = (room.images && room.images.length > 0) 
                ? room.images 
                : [room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'];

              return <RoomCard 
                key={rId}
                room={room}
                rName={rName}
                rPrice={rPrice}
                rDesc={rDesc}
                rAmenities={rAmenities}
                rImages={rImages}
                currencySymbol={config.currencySymbol || '₹'}
                onSelectRoomForCheckIn={onSelectRoomForCheckIn}
              />;
            })}
          </div>
        </section>

        {/* AMENITIES & FEATURES SECTION */}
        <section id="amenities" className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#800020] font-mono tracking-widest uppercase">GUEST COMFORT</span>
            <h3 className="text-2xl font-bold font-serif text-slate-900">Hotel Amenities & Features</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="p-5 bg-[#FAF7F5] rounded-2xl border border-slate-100 space-y-2 hover:border-[#800020]/30 transition">
              <Wifi className="w-6 h-6 mx-auto text-[#800020]" />
              <h4 className="text-xs font-bold text-slate-900">High-Speed 5G WiFi</h4>
              <p className="text-[10px] text-slate-500">Free high-speed internet in all rooms</p>
            </div>

            <div className="p-5 bg-[#FAF7F5] rounded-2xl border border-slate-100 space-y-2 hover:border-[#800020]/30 transition">
              <Coffee className="w-6 h-6 mx-auto text-[#800020]" />
              <h4 className="text-xs font-bold text-slate-900">24/7 Room Service</h4>
              <p className="text-[10px] text-slate-500">Fresh dining & beverages to room</p>
            </div>

            <div className="p-5 bg-[#FAF7F5] rounded-2xl border border-slate-100 space-y-2 hover:border-[#800020]/30 transition">
              <Flame className="w-6 h-6 mx-auto text-[#800020]" />
              <h4 className="text-xs font-bold text-slate-900">24/7 Hot Water</h4>
              <p className="text-[10px] text-slate-500">Geyser in attached bathrooms</p>
            </div>

            <div className="p-5 bg-[#FAF7F5] rounded-2xl border border-slate-100 space-y-2 hover:border-[#800020]/30 transition">
              <ShieldCheck className="w-6 h-6 mx-auto text-[#800020]" />
              <h4 className="text-xs font-bold text-slate-900">CCTV & Safety</h4>
              <p className="text-[10px] text-slate-500">DPDP compliance & security</p>
            </div>
          </div>
        </section>

        {/* LOCATION & CONTACT SECTION */}
        <section id="contact" className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#800020] font-mono tracking-widest uppercase">LOCATION & REACH</span>
              <h3 className="text-2xl font-bold font-serif text-slate-900">Visit The Crown Hotel</h3>
              
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#800020] shrink-0 mt-0.5" />
                  <span>{config.address || 'Plot 14, Main Grand Trunk Road, City Center'}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#800020] shrink-0" />
                  <span className="font-mono">{config.contactPhone || '+91 98765 43210'}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-5 h-5 text-[#800020] shrink-0" />
                  <span className="font-mono">GSTIN: {config.gstNumber}</span>
                </div>
              </div>
            </div>

            <div className="h-48 bg-[#FAF7F5] rounded-2xl border border-slate-200 flex items-center justify-center text-center p-6 text-slate-500 text-xs">
              <div className="space-y-2">
                <MapPin className="w-8 h-8 mx-auto text-[#800020] animate-bounce" />
                <p className="font-semibold text-slate-800">Prime City Center Location</p>
                <p className="text-[10px] text-slate-500">Easily accessible via Rail & Highway</p>
              </div>
            </div>

          </div>
        </section>

      </div>

    </div>
  );
}
