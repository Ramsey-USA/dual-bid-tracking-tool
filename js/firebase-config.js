// Firebase Configuration and Initialization
// Using Firebase v9 modular SDK via CDN

// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2U74NrzUevCrCqFMmEVfY3AcAxgxK3zs",
  authDomain: "bid-tracking-dashboard.firebaseapp.com",
  projectId: "bid-tracking-dashboard",
  storageBucket: "bid-tracking-dashboard.firebasestorage.app",
  messagingSenderId: "417562558876",
  appId: "1:417562558876:web:4afe9d0effa81299494859",
  measurementId: "G-8VR51HJJG4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Connect to emulators in development
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('🔥 Connecting to Firebase emulators...');
    
    try {
        // Connect to Firestore emulator
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Connected to Firestore emulator on localhost:8080');
    } catch (error) {
        console.log('ℹ️ Firestore emulator already connected or unavailable');
    }
} else {
    console.log('🌐 Using production Firebase');
}

export { db, auth };