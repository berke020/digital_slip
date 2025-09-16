import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage'; // Removed

const firebaseConfig = {
  apiKey: "AIzaSyCsuTuH9zd_xe1ZFqlbBbWh5TWmq5rqyoU",
  authDomain: "digitalfis-ce011.firebaseapp.com",
  projectId: "digitalfis-ce011",
  storageBucket: "digitalfis-ce011.firebasestorage.app",
  messagingSenderId: "518016717875",
  appId: "1:518016717875:web:1c66dd409cfc909adbff46"
};

const app = initializeApp(firebaseConfig);

// Fix for network issues: force long polling
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false, // This is for older SDKs but safe to include
});

const auth = getAuth(app);
// const storage = getStorage(app); // Removed
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider }; // storage removed from exports
