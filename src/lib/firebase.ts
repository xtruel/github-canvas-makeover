import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnvCDhsHzVl1W9_5Pwuu602wQmt4vJQFY",
  authDomain: "ovunqueromanisti.firebaseapp.com",
  projectId: "ovunqueromanisti",
  storageBucket: "ovunqueromanisti.firebasestorage.app",
  messagingSenderId: "477206510226",
  appId: "1:477206510226:web:9c470e0d977b2c1420844b",
  measurementId: "G-VVMJSX77HJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;