import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 1. Hubi in dhammaan furayaasha ay jiraan, haddii kale soo saar ogeysiis saaxiibtinimo
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn("⚠️ Firebase API Key is missing. Check your .env.local file configuration.");
}

// 2. Initialize Firebase (Prevent duplicate initialization)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 3. U bixi adeegyada qaab ammaan ah
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };