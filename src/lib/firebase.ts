import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-7262222087-d52bd",
  appId: "1:87707585037:web:5a1859b199aac0c6e96344",
  storageBucket: "studio-7262222087-d52bd.firebasestorage.app",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "studio-7262222087-d52bd.firebaseapp.com",
  messagingSenderId: "87707585037"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
