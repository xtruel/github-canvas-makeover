import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type Role = 'ADMIN' | 'USER' | null;

type AuthUser = { 
  id: string; 
  email: string; 
  displayName?: string;
  photoURL?: string;
  role: 'ADMIN' | 'USER' 
} | null;

type AuthContextType = {
  user: AuthUser;
  role: Role;
  loading: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

// Lista degli email admin configurati direttamente nel codice
const ADMIN_EMAILS = ['truel3000lofi@gmail.com'];

// Helper function to check if user is admin
const checkIfAdmin = async (email: string): Promise<boolean> => {
  // Prima controlla la lista hardcoded
  if (ADMIN_EMAILS.includes(email)) {
    return true;
  }
  
  // Poi prova a controllare Firestore (se disponibile)
  try {
    const adminConfigRef = doc(db, 'admin-config', 'settings');
    const adminConfigDoc = await getDoc(adminConfigRef);
    
    if (adminConfigDoc.exists()) {
      const adminEmails = adminConfigDoc.data().adminEmails || [];
      return adminEmails.includes(email);
    }
    
    return false;
  } catch (error) {
    console.log('Firestore not available, using hardcoded admin list');
    return false;
  }
};

// Helper function to get user data from Firestore
const getUserData = async (firebaseUser: User): Promise<AuthUser> => {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);
  
  // Check if user is admin based on email
  const isAdmin = await checkIfAdmin(firebaseUser.email || '');
  
  let userData = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
    photoURL: firebaseUser.photoURL || undefined,
    role: isAdmin ? 'ADMIN' as const : 'USER' as const
  };
  
  if (userDoc.exists()) {
    const firestoreData = userDoc.data();
    // Override role with admin check if user is in admin list
    userData = { ...userData, ...firestoreData, role: isAdmin ? 'ADMIN' : firestoreData.role || 'USER' };
  } else {
    // Create user document if it doesn't exist
    await setDoc(userDocRef, {
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      role: userData.role,
      createdAt: new Date()
    });
  }
  
  return userData;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // This will be handled by onAuthStateChanged
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error('Error getting user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAdmin = useCallback(async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getUserData(userCredential.user);
      
      // Check if user is admin
      if (userData.role !== 'ADMIN') {
        await signOut(auth);
        return { ok: false, error: 'Accesso non autorizzato. Solo gli admin possono accedere.' };
      }
      
      return { ok: true };
    } catch (error: any) {
      let errorMessage = 'Errore durante il login';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Utente non trovato';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password errata';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email non valida';
      }
      return { ok: false, error: errorMessage };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = await getUserData(result.user);
      return { ok: true };
    } catch (error: any) {
      let errorMessage = 'Errore durante il login con Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login annullato dall\'utente';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloccato dal browser';
      }
      return { ok: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const value = useMemo(() => ({ 
    user, 
    role: user?.role ?? null, 
    loading, 
    loginAdmin, 
    loginWithGoogle,
    logout, 
    refresh 
  }), [user, loading, loginAdmin, loginWithGoogle, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};