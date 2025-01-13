"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/useAuth";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const SignUp = () => {
  const { signup, signInWithGoogle, error: authError, loading: authLoading, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authError) {
      setError(authError);
      toast.error(authError);
    }
    return () => clearError();
  }, [authError, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user types
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loading && !validateForm()) return;

    const { username, email, password } = formData;
    setLoading(true);

    try {
      // Check online status
      if (!navigator.onLine) {
        throw new Error("You are offline. Please check your internet connection.");
      }

      // First, try to create the auth user
      const user = await signup(email, password, username);
      
      try {
        // Create user profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
          username,
          email: user.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Set isAdmin if email matches admin email
          isAdmin: user.email === "abdulrahman1stu141@gmail.com"
        });

        // Create username document
        await setDoc(doc(db, "usernames", username), {
          userId: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
        });

        toast.success("Account created successfully!");
        router.push("/sign-in");
      } catch (error) {
        console.error("Firestore error:", error);
        // If Firestore fails, we should still let the user know they can sign in
        toast.success("Account created! Some profile features may be limited until you're back online.");
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      if (error.message.includes('offline')) {
        toast.error("You're offline. Please check your internet connection.");
      } else {
        toast.error(error.message);
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (loading) return;
    
    try {
      if (!navigator.onLine) {
        throw new Error("You are offline. Please check your internet connection.");
      }

      setLoading(true);
      const result = await signInWithGoogle();
      const user = result.user;

      try {
        // Create user profile
        await setDoc(doc(db, "users", user.uid), {
          username: user.email.split('@')[0],
          email: user.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL,
          bio: "",
          specialty: "",
          location: "",
          contactInformation: {},
          professionalCredentials: []
        }, { merge: true });

        toast.success("Signed in with Google successfully!");
        router.push("/profile");
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        // If Firestore fails but auth succeeds, we can still let them in
        toast.success("Signed in! Some profile features may be limited until you're back online.");
        router.push("/profile");
      }
    } catch (error) {
      if (error.code !== "auth/cancelled-popup-request") {
        console.error("Google sign up error:", error);
        if (error.message.includes('offline')) {
          toast.error("You're offline. Please check your internet connection.");
        } else {
          toast.error(error.message);
        }
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-300 to-purple-500">
      <div className="flex max-w-5xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div
          className="w-1/2 bg-cover bg-center relative hidden md:block"
          style={{ backgroundImage: "url('/flowers.jpg')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Create an Account
          </h2>

          {error && (
            <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Choose a username"
                disabled={loading || authLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your email"
                disabled={loading || authLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Create a password"
                disabled={loading || authLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Confirm your password"
                disabled={loading || authLoading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || authLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || authLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              }`}
            >
              {loading || authLoading ? "Creating Account..." : "Sign Up"}
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading || authLoading}
                className={`mt-4 w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 ${
                  loading || authLoading
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                }`}
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                />
                {loading || authLoading ? "Connecting..." : "Sign up with Google"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-purple-600 hover:text-purple-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
