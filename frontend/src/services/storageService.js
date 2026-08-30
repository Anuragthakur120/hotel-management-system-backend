// Crown Hotel Management System - Express REST API + MongoDB Storage Engine
// Supports MongoDB Mongoose Backend API + Express + Local Fallback

const API_BASE = 'http://localhost:5000/api';

const STORAGE_KEYS = {
  ROOMS: 'crown_hms_rooms_v2',
  GUEST_MASTERS: 'crown_hms_guest_masters_v2',
  STAYS: 'crown_hms_stays_v2',
  RESERVATIONS: 'crown_hms_reservations_v2',
  CONFIG: 'crown_hms_config_v2',
  JWT_TOKEN: 'crown_hms_jwt_token',
};

// Initial Seed Rooms
export const INITIAL_ROOMS = [
  { id: '101', number: '101', floor: 1, category: 'Deluxe AC', pricePerNight: 2499, status: 'occupied', amenities: ['AC', 'TV', 'Geyser', 'WiFi', 'King Bed'], currentStayId: 'stay_101' },
  { id: '102', number: '102', floor: 1, category: 'Standard Non-AC', pricePerNight: 1499, status: 'vacant', amenities: ['TV', 'Geyser', 'WiFi', 'Queen Bed'], currentStayId: null },
  { id: '103', number: '103', floor: 1, category: 'Deluxe AC', pricePerNight: 2499, status: 'dirty', amenities: ['AC', 'TV', 'Geyser', 'WiFi', 'King Bed'], currentStayId: null },
  
  { id: '201', number: '201', floor: 2, category: 'Super Deluxe', pricePerNight: 3499, status: 'vacant', amenities: ['AC', 'Smart TV', 'Geyser', 'WiFi', 'Balcony', 'Mini Fridge'], currentStayId: null },
  { id: '202', number: '202', floor: 2, category: 'Super Deluxe', pricePerNight: 3499, status: 'occupied', amenities: ['AC', 'Smart TV', 'Geyser', 'WiFi', 'Balcony', 'Mini Fridge'], currentStayId: 'stay_202' },
  { id: '203', number: '203', floor: 2, category: 'Standard Non-AC', pricePerNight: 1499, status: 'vacant', amenities: ['TV', 'Geyser', 'WiFi', 'Queen Bed'], currentStayId: null },
  
  { id: '301', number: '301', floor: 3, category: 'Crown Suite', pricePerNight: 4999, status: 'reserved', amenities: ['AC', 'Jacuzzi', 'Smart TV', 'Geyser', 'WiFi', 'Balcony', 'Room Service'], currentStayId: null },
  { id: '302', number: '302', floor: 3, category: 'Super Deluxe', pricePerNight: 3499, status: 'vacant', amenities: ['AC', 'Smart TV', 'Geyser', 'WiFi', 'Balcony', 'Mini Fridge'], currentStayId: null },
  { id: '303', number: '303', floor: 3, category: 'Deluxe AC', pricePerNight: 2499, status: 'vacant', amenities: ['AC', 'TV', 'Geyser', 'WiFi', 'King Bed'], currentStayId: null },
  
  { id: '401', number: '401', floor: 4, category: 'Crown Suite', pricePerNight: 4999, status: 'vacant', amenities: ['AC', 'Jacuzzi', 'Smart TV', 'Geyser', 'WiFi', 'Balcony', 'Room Service'], currentStayId: null },
  { id: '402', number: '402', floor: 4, category: 'Crown Suite', pricePerNight: 4999, status: 'vacant', amenities: ['AC', 'Jacuzzi', 'Smart TV', 'Geyser', 'WiFi', 'Balcony', 'Room Service'], currentStayId: null },
  { id: '403', number: '403', floor: 4, category: 'Super Deluxe', pricePerNight: 3499, status: 'maintenance', amenities: ['AC', 'Smart TV', 'Geyser', 'WiFi'], currentStayId: null },
];

export const INITIAL_GUEST_MASTERS = [
  {
    id: 'gst_m_1',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    address: 'B-42, Sector 62, Noida, UP',
    idType: 'Aadhaar Card',
    idNumberMasked: 'XXXX-XXXX-9012',
    idNumberFull: '1234-5678-9012',
    idDocuments: [
      { id: 'doc_1', name: 'Aadhaar Front', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', uploadedAt: new Date().toISOString() }
    ],
    totalVisits: 2,
    totalSpent: 4998,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_STAYS = [
  {
    id: 'stay_101',
    guestId: 'gst_m_1',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    aadhaarMasked: 'XXXX-XXXX-9012',
    address: 'B-42, Sector 62, Noida, UP',
    guestsCount: 2,
    roomNumber: '101',
    roomId: '101',
    bookedRoomPricePerNight: 2499,
    checkInDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    expectedCheckOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    status: 'Checked-In',
    advancePaid: 1000,
    paymentMethod: 'UPI',
    services: [
      { id: 'srv_1', name: 'Special Breakfast Buffet', price: 350, date: new Date().toISOString(), category: 'Food' }
    ]
  }
];

export const INITIAL_RESERVATIONS = [
  {
    id: 'res_301',
    guestName: 'Vikramaditya Singh',
    mobile: '9988776655',
    roomNumber: '301',
    roomId: '301',
    bookedRoomPricePerNight: 4999,
    checkInDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    checkOutDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    guestsCount: 2,
    advancePaid: 1500,
    status: 'Confirmed'
  }
];

export const INITIAL_CONFIG = {
  hotelName: 'Crown Hotel & Suites',
  tagline: 'Luxury Stay & Comfort',
  address: 'Plot 14, Main Grand Trunk Road, Near City Center',
  phone: '+91 98765 00000',
  email: 'reception@crownhotel.com',
  gstNumber: '07AAAAA0000A1Z5',
  checkInTime: '12:00',
  checkOutTime: '11:00',
  gstTaxRatePercent: 12,
  currencySymbol: '₹',
  upiId: 'crown.hotel@upi'
};

class StorageService {
  constructor() {
    this.apiBase = API_BASE;
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GUEST_MASTERS)) {
      localStorage.setItem(STORAGE_KEYS.GUEST_MASTERS, JSON.stringify(INITIAL_GUEST_MASTERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STAYS)) {
      localStorage.setItem(STORAGE_KEYS.STAYS, JSON.stringify(INITIAL_STAYS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
    }
  }

  // --- ROOMS API ---
  async getRooms() {
    try {
      const res = await fetch(`${API_BASE}/rooms`);
      if (res.ok) {
        const rooms = await res.json();
        if (rooms && rooms.length > 0) return rooms;
      }
    } catch (e) {
      console.warn("Express API fallback to local:", e.message);
    }
    const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return data ? JSON.parse(data) : INITIAL_ROOMS;
  }

  async saveRooms(rooms) {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    return rooms;
  }

  // --- GUEST MASTERS REPOSITORY API ---
  async getGuestMasters() {
    try {
      const res = await fetch(`${API_BASE}/guests/search?q=a`);
      if (res.ok) {
        const masters = await res.json();
        if (masters && masters.length > 0) return masters;
      }
    } catch (e) {
      console.warn("Express API fallback to local:", e.message);
    }
    const data = localStorage.getItem(STORAGE_KEYS.GUEST_MASTERS);
    return data ? JSON.parse(data) : INITIAL_GUEST_MASTERS;
  }

  async saveGuestMasters(masters) {
    localStorage.setItem(STORAGE_KEYS.GUEST_MASTERS, JSON.stringify(masters));
    return masters;
  }

  async upsertGuestMaster(guestMaster) {
    const masters = await this.getGuestMasters();
    const existingIndex = masters.findIndex(m => m.id === guestMaster.id || m.mobile === guestMaster.mobile);
    let updated;
    if (existingIndex >= 0) {
      updated = [...masters];
      updated[existingIndex] = { ...updated[existingIndex], ...guestMaster, updatedAt: new Date().toISOString() };
    } else {
      updated = [guestMaster, ...masters];
    }
    await this.saveGuestMasters(updated);
    return { updatedMasters: updated, guestMaster: existingIndex >= 0 ? updated[existingIndex] : guestMaster };
  }

  // --- STAYS API ---
  async getStays() {
    try {
      const res = await fetch(`${API_BASE}/stays`);
      if (res.ok) {
        const stays = await res.json();
        if (stays && stays.length > 0) return stays;
      }
    } catch (e) {
      console.warn("Express API fallback to local:", e.message);
    }
    const data = localStorage.getItem(STORAGE_KEYS.STAYS);
    return data ? JSON.parse(data) : INITIAL_STAYS;
  }

  async saveStays(stays) {
    localStorage.setItem(STORAGE_KEYS.STAYS, JSON.stringify(stays));
    return stays;
  }

  // --- RESERVATIONS API ---
  async getReservations() {
    const data = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    return data ? JSON.parse(data) : INITIAL_RESERVATIONS;
  }

  async saveReservations(reservations) {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
    return reservations;
  }

  // --- CONFIG API ---
  async getConfig() {
    try {
      const res = await fetch(`${API_BASE}/rooms/config`);
      if (res.ok) {
        const config = await res.json();
        if (config && config.hotelName) return config;
      }
    } catch (e) {
      console.warn("Express API fallback to local:", e.message);
    }
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : INITIAL_CONFIG;
  }

  async saveConfig(config) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return config;
  }

  getFirebaseConfig() {
    return null;
  }

  saveFirebaseConfig() {
    return true;
  }

  async resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem(STORAGE_KEYS.GUEST_MASTERS, JSON.stringify(INITIAL_GUEST_MASTERS));
    localStorage.setItem(STORAGE_KEYS.STAYS, JSON.stringify(INITIAL_STAYS));
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
    return true;
  }
}

export const storageService = new StorageService();
