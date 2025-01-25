"use client";

import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
  useMemo,
} from "react";
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
  browserSessionPersistence,
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
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const setPersistenceLevel = useCallback(async (level) => {
    try {
      await setPersistence(
        auth,
        level === "local" ? browserLocalPersistence : browserSessionPersistence
      );
    } catch (error) {
      console.error("Auth persistence error:", error);
      setError(error.message);
      throw error;
    }
  }, []);

  const getFirebaseErrorMessage = (error) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please sign in or use a different email.";
      case "auth/invalid-email":
        return "The email address is not valid.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled. Please contact support.";
      case "auth/weak-password":
        return "The password is too weak. Please use at least 6 characters.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/user-not-found":
        return "No account found with this email. Please sign up first.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      case "auth/popup-closed-by-user":
        return "Sign in popup was closed before completion.";
      case "auth/cancelled-popup-request":
        return "The sign in process was cancelled.";
      case "auth/internal-error":
        return "An error occurred during sign in. Please try again.";
      default:
        console.error("Firebase auth error:", error);
        return "An error occurred. Please try again.";
    }
  };

  const signin = useCallback(
    async (email, password, persistenceLevel = "local") => {
      try {
        setError(null);
        setLoading(true);
        await setPersistenceLevel(persistenceLevel);
        const response = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        return response.user;
      } catch (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setPersistenceLevel]
  );

  const signup = useCallback(async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (displayName) {
        await updateProfile(response.user, { displayName });
      }
      return response.user;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);
      return false;
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
      const result = await signInWithPopup(auth, googleProvider);
      if (!result?.user) {
        throw new Error("Failed to get user information from Google");
      }
      return result;
    } catch (error) {
      console.error("Google sign in error:", error);
      if (
        error.code !== "auth/popup-closed-by-user" &&
        error.code !== "auth/cancelled-popup-request"
      ) {
        const errorMessage = getFirebaseErrorMessage(error);
        setError(errorMessage);
      }
      return null;
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

  const updateUserProfile = useCallback(
    async (updates) => {
      try {
        setError(null);
        if (!user) throw new Error("No user logged in");
        await updateProfile(user, updates);
        setUser({ ...user, ...updates });
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
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
      setPersistenceLevel,
    }),
    [
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
      setPersistenceLevel,
    ]
  );

  return value;
};
