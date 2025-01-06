"use client";

import { useState, useEffect, useContext, createContext, useCallback, useMemo } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { app } from "../lib/firebase";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const useProvideAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error("Auth state change error:", error);
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const setPersistenceLevel = useCallback(async (level) => {
    try {
      await setPersistence(auth, 
        level === 'local' ? browserLocalPersistence : browserSessionPersistence
      );
    } catch (error) {
      console.error("Auth persistence error:", error);
      setError(error.message);
      throw error;
    }
  }, []);

  const signin = useCallback(async (email, password, persistenceLevel = 'local') => {
    try {
      setError(null);
      setLoading(true);
      await setPersistenceLevel(persistenceLevel);
      const response = await signInWithEmailAndPassword(auth, email, password);
      return response.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setPersistenceLevel]);

  const signup = useCallback(async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      const response = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(response.user, { displayName });
      }
      return response.user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signout = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await signInWithPopup(auth, googleProvider);
      return response.user;
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (updates) => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');
      await updateProfile(user, updates);
      setUser({ ...user, ...updates });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    clearError,
    signin,
    signup,
    signout,
    signInWithGoogle,
    resetPassword,
    updateUserProfile,
    setPersistenceLevel
  }), [user, loading, error, clearError, signin, signup, signout, signInWithGoogle, resetPassword, updateUserProfile, setPersistenceLevel]);

  return value;
};
