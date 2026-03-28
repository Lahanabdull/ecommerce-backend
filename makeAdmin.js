const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://markandluth-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const db = admin.firestore();

// Replace with your user UID - you can find this in Firebase Console > Authentication > Users
// Or in your app, log currentUser.uid to console
const userUID = process.argv[2]; // Pass UID as command line argument

if (!userUID) {
  console.log('Usage: node makeAdmin.js <USER_UID>');
  console.log('Example: node makeAdmin.js abc123def456');
  process.exit(1);
}

async function makeAdmin() {
  try {
    const userRef = db.collection('users').doc(userUID);
    await userRef.update({
      isAdmin: true,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ User is now an admin!');
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  }
}

makeAdmin();