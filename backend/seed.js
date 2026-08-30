/**
 * Crown Hotel Management System - Comprehensive Firestore Seed Script
 * Seeds all 12 collections matching the Crown Schema specification:
 * - users
 * - guestProfiles
 * - hotels
 * - floors
 * - rooms
 * - roomTypes
 * - reservations
 * - stays
 * - folios
 * - payments
 * - notifications
 * - auditLogs
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

try {
  const serviceAccount = require('./serviceAccountKey.json');
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {
  console.warn("No serviceAccountKey.json found. Running standalone seed mode...");
  initializeApp({ projectId: 'crown-hotel-pms' });
}

const db = getFirestore();
const HOTEL_ID = 'crown_hotel_main';

// 1. USERS COLLECTION
const SEED_USERS = [
  {
    _id: 'usr_superadmin',
    role: 'superadmin',
    name: 'Crown SuperAdmin',
    mobile: '9807252700',
    email: 'ravisingh01',
    passwordHash: 'NOT_SET',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_admin',
    role: 'admin',
    name: 'Desk Manager Admin',
    mobile: '9888800000',
    email: 'admin@crownhotel.com',
    passwordHash: '$2a$10$e7xX3bW8xQ...',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_guest_1',
    role: 'guest',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul@example.com',
    passwordHash: 'pin_1234',
    createdAt: new Date().toISOString()
  }
];

// 2. GUEST PROFILES COLLECTION (Linked to User where role === 'guest')
const SEED_GUEST_PROFILES = [
  {
    _id: 'gst_prof_1',
    userId: 'usr_guest_1',
    mobile: '9876543210',
    address: 'B-42, Sector 62, Noida, UP',
    idType: 'Aadhaar Card',
    idNumberMasked: 'XXXX-XXXX-9012',
    idNumberFull: '1234-5678-9012', // Restricted admin access
    idDocuments: [
      { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', type: 'Aadhaar Front', uploadedAt: new Date().toISOString() }
    ],
    verificationStatus: 'valid',
    verifiedBy: 'usr_admin',
    totalVisits: 2,
    totalSpent: 4998,
    updatedAt: new Date().toISOString()
  }
];

// 3. HOTEL CONTENT & SETTINGS
const SEED_HOTEL = {
  _id: HOTEL_ID,
  name: 'Crown Hotel & Suites',
  logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80',
  address: 'Plot 14, Main Grand Trunk Road',
  contact: '+91 98765 43210',
  heroBanner: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
  aboutText: 'Crown Hotel offers unmatched hospitality, luxury rooms, and instant self check-in.',
  galleryImages: [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  ],
  checkInTime: '12:00',
  checkOutTime: '11:00',
  createdAt: new Date().toISOString()
};

// 4. FLOORS COLLECTION
const SEED_FLOORS = [
  { _id: 'floor_1', name: 'Floor 1', hotelId: HOTEL_ID },
  { _id: 'floor_2', name: 'Floor 2', hotelId: HOTEL_ID },
  { _id: 'floor_3', name: 'Floor 3', hotelId: HOTEL_ID },
  { _id: 'floor_4', name: 'Floor 4', hotelId: HOTEL_ID }
];

// 5. ROOM TYPES COLLECTION
const SEED_ROOM_TYPES = [
  { _id: 'standard', name: 'Standard Non-AC', basePrice: 1000, maxAdults: 2, maxChildren: 1, description: 'Economical standard room' },
  { _id: 'deluxe', name: 'Deluxe AC', basePrice: 2500, maxAdults: 2, maxChildren: 2, description: 'AC room with TV & WiFi' },
  { _id: 'suite', name: 'Crown Suite', basePrice: 4500, maxAdults: 3, maxChildren: 2, description: 'Executive luxury suite with Jacuzzi' }
];

// 6. ROOMS COLLECTION (12 Rooms across 4 floors)
const SEED_ROOMS = [
  { _id: 'rm_101', roomNumber: '101', floorId: 'floor_1', roomTypeId: 'deluxe', price: 2500, status: 'occupied', images: [], amenities: ['AC', 'TV', 'WiFi', 'Geyser'], isActive: true },
  { _id: 'rm_102', roomNumber: '102', floorId: 'floor_1', roomTypeId: 'standard', price: 1000, status: 'available', images: [], amenities: ['TV', 'WiFi'], isActive: true },
  { _id: 'rm_103', roomNumber: '103', floorId: 'floor_1', roomTypeId: 'standard', price: 1000, status: 'cleaning', images: [], amenities: ['TV', 'WiFi'], isActive: true },

  { _id: 'rm_104', roomNumber: '104', floorId: 'floor_2', roomTypeId: 'deluxe', price: 2500, status: 'available', images: [], amenities: ['AC', 'TV', 'WiFi'], isActive: true },
  { _id: 'rm_105', roomNumber: '105', floorId: 'floor_2', roomTypeId: 'deluxe', price: 2500, status: 'occupied', images: [], amenities: ['AC', 'TV', 'WiFi'], isActive: true },
  { _id: 'rm_106', roomNumber: '106', floorId: 'floor_2', roomTypeId: 'standard', price: 1000, status: 'available', images: [], amenities: ['TV', 'WiFi'], isActive: true },

  { _id: 'rm_107', roomNumber: '107', floorId: 'floor_3', roomTypeId: 'suite', price: 4500, status: 'reserved', images: [], amenities: ['AC', 'Jacuzzi', 'Balcony'], isActive: true },
  { _id: 'rm_108', roomNumber: '108', floorId: 'floor_3', roomTypeId: 'deluxe', price: 2500, status: 'available', images: [], amenities: ['AC', 'TV', 'WiFi'], isActive: true },
  { _id: 'rm_109', roomNumber: '109', floorId: 'floor_3', roomTypeId: 'standard', price: 1000, status: 'available', images: [], amenities: ['TV', 'WiFi'], isActive: true },

  { _id: 'rm_110', roomNumber: '110', floorId: 'floor_4', roomTypeId: 'suite', price: 4500, status: 'available', images: [], amenities: ['AC', 'Jacuzzi', 'Balcony'], isActive: true },
  { _id: 'rm_111', roomNumber: '111', floorId: 'floor_4', roomTypeId: 'suite', price: 4500, status: 'available', images: [], amenities: ['AC', 'Jacuzzi', 'Balcony'], isActive: true },
  { _id: 'rm_112', roomNumber: '112', floorId: 'floor_4', roomTypeId: 'deluxe', price: 2500, status: 'maintenance', images: [], amenities: ['AC', 'TV'], isActive: true }
];

// 7. RESERVATION & STAYS (Price Snapshotting)
const SEED_RESERVATIONS = [
  {
    _id: 'res_107',
    guestProfileId: 'gst_prof_1',
    roomId: 'rm_107',
    checkIn: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    checkOut: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    pricePerNight: 4500, // SNAPSHOT LOCK
    status: 'Confirmed'
  }
];

const SEED_STAYS = [
  {
    _id: 'stay_101',
    reservationId: null,
    guestProfileId: 'gst_prof_1',
    roomId: 'rm_101',
    actualCheckIn: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actualCheckOut: null,
    status: 'Checked-In',
    folioId: 'fol_101'
  }
];

// 8. FOLIOS & PAYMENTS
const SEED_FOLIOS = [
  {
    _id: 'fol_101',
    stayId: 'stay_101',
    items: [
      { description: 'Room Charge (1 Night @ ₹2500)', amount: 2500, category: 'Room' },
      { description: 'Breakfast Service', amount: 350, category: 'Service' }
    ],
    subtotal: 2850,
    tax: 342,
    discount: 0,
    grandTotal: 3192,
    balance: 2192
  }
];

const SEED_PAYMENTS = [
  {
    _id: 'pay_1',
    folioId: 'fol_101',
    amount: 1000,
    method: 'UPI',
    timestamp: new Date().toISOString()
  }
];

// 9. NOTIFICATIONS & AUDIT LOGS
const SEED_NOTIFICATIONS = [
  {
    _id: 'notif_1',
    forUserId: 'usr_admin',
    type: 'new_guest_submission',
    message: 'Rahul Sharma submitted check-in details for verification',
    isRead: false,
    relatedGuestId: 'gst_prof_1',
    createdAt: new Date().toISOString()
  }
];

const SEED_AUDIT_LOGS = [
  {
    _id: 'log_1',
    userId: 'usr_superadmin',
    action: 'SYSTEM_INITIALIZED',
    entityType: 'hotel',
    entityId: HOTEL_ID,
    before: null,
    after: { name: 'Crown Hotel & Suites' },
    timestamp: new Date().toISOString()
  }
];

async function seedDatabase() {
  console.log("🚀 Seeding Crown HMS Database (Full 12-Collection Schema)...");

  // 1. Hotel
  await db.collection('hotels').doc(HOTEL_ID).set(SEED_HOTEL);
  console.log("✅ Seeded Hotel document");

  // 2. Users
  for (const u of SEED_USERS) await db.collection('users').doc(u._id).set(u);
  console.log("✅ Seeded Users");

  // 3. Guest Profiles
  for (const gp of SEED_GUEST_PROFILES) await db.collection('guestProfiles').doc(gp._id).set(gp);
  console.log("✅ Seeded Guest Profiles");

  // 4. Floors
  for (const fl of SEED_FLOORS) await db.collection('floors').doc(fl._id).set(fl);
  console.log("✅ Seeded Floors");

  // 5. Room Types
  for (const rt of SEED_ROOM_TYPES) await db.collection('roomTypes').doc(rt._id).set(rt);
  console.log("✅ Seeded Room Types");

  // 6. Rooms
  for (const rm of SEED_ROOMS) await db.collection('rooms').doc(rm._id).set(rm);
  console.log("✅ Seeded 12 Rooms");

  // 7. Reservations & Stays
  for (const res of SEED_RESERVATIONS) await db.collection('reservations').doc(res._id).set(res);
  for (const st of SEED_STAYS) await db.collection('stays').doc(st._id).set(st);
  console.log("✅ Seeded Reservations & Stays");

  // 8. Folios & Payments
  for (const f of SEED_FOLIOS) await db.collection('folios').doc(f._id).set(f);
  for (const p of SEED_PAYMENTS) await db.collection('payments').doc(p._id).set(p);
  console.log("✅ Seeded Folios & Payments");

  // 9. Notifications & Audit Logs
  for (const n of SEED_NOTIFICATIONS) await db.collection('notifications').doc(n._id).set(n);
  for (const a of SEED_AUDIT_LOGS) await db.collection('auditLogs').doc(a._id).set(a);
  console.log("✅ Seeded Notifications & Audit Logs");

  console.log("🎉 Complete Database Seeding Succeeded!");
}

seedDatabase().catch(console.error);
