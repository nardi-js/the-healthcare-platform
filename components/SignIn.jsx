"use client";
import React, { useState, useEffect } from "react";
import {
  useAuth,
  signin,
  signInWithGoogle,
  sendPasswordResetEmail,
} from "../context/useAuth"; // Import custom hook for authentication
import { auth } from "@/lib/firebase";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";

const SignIn = () => {
  const {
    signin,
    signInWithGoogle,
    error: authError,
    loading: authLoading,
    clearError,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
    return () => clearError();
  }, [authError, clearError]);

  const validateForm = () => {
    if (!email || !password) {
      setError("All fields are required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setError("");
      const user = await signin(email, password);
      if (user) {
        toast.success("Signed in successfully!");
        router.push("/home");
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      const user = await signInWithGoogle();
      if (user) {
        toast.success("Signed in with Google successfully!");
        router.push("/home");
      }
    } catch (error) {
      if (error.code !== "auth/cancelled-popup-request") {
        console.error("Google sign in error:", error);
      }
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
            Welcome Back
          </h2>

          {error && (
            <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your email"
                disabled={authLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your password"
                disabled={authLoading}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                authLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {authLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
