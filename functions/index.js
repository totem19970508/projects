const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

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

  const { email, displayName, password } = data;

  if (!email || !displayName || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Email, display name, and password are required.');
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
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: callerUid,
    }, { merge: true });

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      message: 'User created successfully with temporary password.',
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
