"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/useAuth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
    if (!validateForm()) return;

    const { username, email, password } = formData;
    setLoading(true);
    setError("");

    try {
      // Check online status
      if (!navigator.onLine) {
        throw new Error("You are offline. Please check your internet connection.");
      }

      // First, try to create the auth user
      const user = await signup(email, password, username);
      
      try {
        // Create user profile in Firestore with all necessary fields
        await setDoc(doc(db, "users", user.uid), {
          username,
          email: user.email,
          displayName: username,
          photoURL: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          stats: {
            totalPosts: 0,
            totalQuestions: 0,
            totalAnswers: 0,
            totalComments: 0
          },
          isAdmin: user.email === "abdulrahman1stu141@gmail.com"
        });

        // Create username document
        await setDoc(doc(db, "usernames", username.toLowerCase()), {
          userId: user.uid,
          email: user.email,
          createdAt: serverTimestamp()
        });

        toast.success("Account created successfully! Redirecting...");
        router.push("/home");
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        
        if (firestoreError.code === 'permission-denied') {
          toast.error("Permission denied. Please try signing in again.");
          router.push("/sign-in");
        } else {
          // For other errors, let them proceed but notify
          toast.error("Account created but profile setup incomplete. Please complete your profile later.");
          router.push("/home");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError("");
      setLoading(true);
      
      const result = await signInWithGoogle();
      console.log("Google sign in result:", result);

      if (!result) {
        console.log("No result from Google sign in");
        return;
      }

      if (!result.user) {
        console.error("No user object in result");
        throw new Error("Failed to get user information from Google");
      }

      const { user } = result;
      console.log("User object:", user);

      if (!user.uid) {
        console.error("No UID in user object");
        throw new Error("Failed to get user ID from Google");
      }

      // Create user profile
      const userData = {
        username: user.email?.split('@')[0] || 'user',
        email: user.email || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        displayName: user.displayName || user.email?.split('@')[0] || 'user',
        photoURL: user.photoURL || null,
        bio: "",
        specialty: "",
        location: "",
        contactInformation: {},
        professionalCredentials: []
      };

      console.log("Creating user profile with data:", userData);
      await setDoc(doc(db, "users", user.uid), userData, { merge: true });

      toast.success("Signed in with Google successfully!");
      router.push("/home");
    } catch (error) {
      console.error("Google sign up error:", error);
      if (error.code !== "auth/cancelled-popup-request") {
        const errorMessage = error.message || "Failed to sign in with Google";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="flex max-w-4xl w-full mx-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side - Image */}
        <div
          className="w-1/2 bg-cover bg-center relative hidden md:block"
          style={{ backgroundImage: "url('/medical-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/70 to-pink-500/70">
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Join Our Community</h2>
              <p className="text-sm opacity-90">
                Connect with healthcare professionals and share your expertise.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-sm text-gray-600">
              Join the healthcare platform community
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Choose a username"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Create a password"
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="relative my-6">
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
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-150 ease-in-out"
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              Sign up with Google
            </button>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-150 ease-in-out">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
