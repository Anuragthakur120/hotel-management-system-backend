/**
 * Crown Hotel Management System - Firebase Cloud Functions
 * Handles transactional room assignment, price snapshot verification,
 * PDF invoice generation triggers, and audit logging.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Transactional Check-In Trigger:
 * Locks room price snapshot, prevents double-booking race condition,
 * and sets room status to 'occupied'.
 */
exports.createStayTransaction = functions.https.onCall(async (data, context) => {
  // Ensure staff authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Staff login required');
  }

  const { roomId, guestMasterId, checkInDate, expectedCheckOutDate, advancePaid, paymentMethod } = data;

  return db.runTransaction(async (transaction) => {
    const roomRef = db.collection('rooms').doc(roomId);
    const roomDoc = await transaction.get(roomRef);

    if (!roomDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Room not found');
    }

    const roomData = roomDoc.data();

    // RACE CONDITION LOCK: Ensure room is available
    if (roomData.status === 'occupied') {
      throw new functions.https.HttpsError('already-exists', `Room ${roomData.roomNumber} is already occupied!`);
    }

    // SNAPSHOT ROOM PRICE PER NIGHT
    const pricePerNightSnapshot = roomData.price;
    const stayId = 'stay_' + Date.now();
    const stayRef = db.collection('stays').doc(stayId);

    const stayPayload = {
      id: stayId,
      guestId: guestMasterId,
      roomId: roomId,
      roomNumber: roomData.roomNumber,
      // CRITICAL PRICE SNAPSHOT LOCK
      pricePerNight: pricePerNightSnapshot,
      actualCheckIn: checkInDate || new Date().toISOString(),
      expectedCheckOut: expectedCheckOutDate,
      advancePaid: Number(advancePaid) || 0,
      paymentMethod: paymentMethod || 'UPI',
      status: 'Checked-In',
      createdAt: new Date().toISOString()
    };

    // Update Room status to 'occupied'
    transaction.update(roomRef, { 
      status: 'occupied',
      currentStayId: stayId 
    });

    // Write Stay Document
    transaction.set(stayRef, stayPayload);

    // Audit Log
    const auditRef = db.collection('auditLogs').doc();
    transaction.set(auditRef, {
      userId: context.auth.uid || 'staff',
      action: 'CHECK_IN_CREATED',
      entityType: 'stay',
      entityId: stayId,
      details: `Checked in to Room ${roomData.roomNumber} @ ₹${pricePerNightSnapshot}/night`,
      timestamp: new Date().toISOString()
    });

    return { success: true, stayId: stayId, priceSnapshot: pricePerNightSnapshot };
  });
});

/**
 * Audit Log Writer Trigger
 */
exports.logAuditEvent = functions.https.onCall(async (data, context) => {
  const { action, entityType, entityId, before, after } = data;
  const logRef = db.collection('auditLogs').doc();
  await logRef.set({
    userId: context.auth ? context.auth.uid : 'anonymous',
    action,
    entityType,
    entityId,
    before: before || null,
    after: after || null,
    timestamp: new Date().toISOString()
  });
  return { success: true };
});
