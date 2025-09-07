// Script per configurare l'utente admin in Firestore
// Eseguire con: node scripts/setup-admin.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

// Configurazione Firebase (usa le stesse variabili del progetto)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBvOkuAiUsyEyYpYGa7pVQ2M0L2N8U5C30",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "ovunqueromanisti.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "ovunqueromanisti",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "ovunqueromanisti.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupAdmin() {
  try {
    const adminEmail = 'truel3000lofi@gmail.com';
    
    // Nota: Per configurare completamente l'admin, l'utente deve prima fare login con Google
    // Questo script prepara la configurazione per quando l'utente farà il primo accesso
    
    console.log('🔧 Configurazione admin per:', adminEmail);
    console.log('📝 Nota: L\'utente deve prima fare login con Google per creare il documento utente');
    console.log('🔐 Una volta fatto il login, il ruolo verrà automaticamente impostato su ADMIN');
    
    // Creiamo un documento di configurazione admin
    const adminConfigRef = doc(db, 'admin-config', 'settings');
    await setDoc(adminConfigRef, {
      adminEmails: [adminEmail],
      updatedAt: new Date(),
      note: 'Lista degli email autorizzati come admin'
    }, { merge: true });
    
    console.log('✅ Configurazione admin salvata con successo!');
    console.log('🚀 L\'utente', adminEmail, 'avrà privilegi admin al primo login');
    
  } catch (error) {
    console.error('❌ Errore durante la configurazione admin:', error);
  }
}

// Esegui la configurazione
setupAdmin().then(() => {
  console.log('🎉 Setup completato!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Errore fatale:', error);
  process.exit(1);
});