'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, provider } from '../firebaseClient';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
  UserCredential
} from 'firebase/auth';

interface AuthContextProps {
  user: User | null;
  login: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const login = async (): Promise<UserCredential> => {
    return await signInWithPopup(auth, provider);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
