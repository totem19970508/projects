const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// List all Firebase Auth users, merged with any Firestore profiles
exports.listWorkspaceUsers = functions.https.onCall(async (_, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await db.collection('users').doc(callerUid).get();
  const callerProfile = callerDoc.data() || {};
  const callerRole = String(callerProfile.role || '').toLowerCase();
  const callerEmail = String(callerProfile.email || context.auth.token.email || '').toLowerCase();
  const isPrivileged = callerRole === 'admin' || callerRole === 'superuser' || callerEmail === 'totem1997@gmail.com';

  if (!isPrivileged) {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can view users.');
  }

  const profileSnapshot = await db.collection('users').get();
  const profileMap = {};
  profileSnapshot.forEach(doc => {
    profileMap[doc.id] = doc.data();
  });

  const result = await auth.listUsers(1000);
  return result.users.map(userRecord => {
    const profile = profileMap[userRecord.uid] || {};
    return {
      uid: userRecord.uid,
      email: userRecord.email || profile.email || '',
      displayName: userRecord.displayName || profile.displayName || '',
      role: String(profile.role || 'user').toLowerCase(),
      userCode: profile.userCode || '',
      photoURL: userRecord.photoURL || profile.photoURL || '',
      createdAt: profile.createdAt || null,
      updatedAt: profile.updatedAt || null,
    };
  });
});

// Create a new user with temporary password
exports.createUserWithPassword = functions.https.onCall(async (data, context) => {
  // Check if caller is authenticated and admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await db.collection('users').doc(callerUid).get();
  const callerProfile = callerDoc.data() || {};
  const callerRole = String(callerProfile.role || '').toLowerCase();
  const callerEmail = String(callerProfile.email || context.auth.token.email || '').toLowerCase();
  const isPrivileged = callerRole === 'admin' || callerRole === 'superuser' || callerEmail === 'totem1997@gmail.com';

  if (!isPrivileged) {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can create users.');
  }

  const { email, displayName, password, role } = data;

  if (!email || !displayName || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Email, display name, and password are required.');
  }

  const normalizedRole = String(role || 'user').toLowerCase();
  if (!['user', 'admin', 'superuser'].includes(normalizedRole)) {
    throw new functions.https.HttpsError('invalid-argument', 'Role must be one of "user", "admin", or "superuser".');
  }

  try {
    // Create auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    // Create user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role: normalizedRole,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: callerUid,
    }, { merge: true });

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: normalizedRole,
      message: ['admin', 'superuser'].includes(normalizedRole) ? 'Administrative user created successfully with temporary password.' : 'User created successfully with temporary password.',
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Delete a user account
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  // Check if caller is authenticated and admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await db.collection('users').doc(callerUid).get();
  const callerProfile = callerDoc.data() || {};
  const callerRole = String(callerProfile.role || '').toLowerCase();
  const callerEmail = String(callerProfile.email || context.auth.token.email || '').toLowerCase();
  const isPrivileged = callerRole === 'admin' || callerRole === 'superuser' || callerEmail === 'totem1997@gmail.com';

  if (!isPrivileged) {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can delete users.');
  }

  const { uid } = data;

  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'User ID is required.');
  }

  if (uid === callerUid) {
    throw new functions.https.HttpsError('invalid-argument', 'Cannot delete your own account.');
  }

  try {
    // Delete from auth
    await auth.deleteUser(uid);

    // Delete from Firestore
    await db.collection('users').doc(uid).delete();

    return {
      message: 'User account deleted successfully.',
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
