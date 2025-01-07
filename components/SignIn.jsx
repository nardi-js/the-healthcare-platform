"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  db,
  auth,
  provider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const SignInWithEmailAndPasswordCustom = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log("Sign-in successful! User profile:", userDoc.data());
        alert("Welcome back!");
        router.push("/home");
      } else {
        console.error("User profile does not exist in Firestore.");
        alert("No account found for this email. Please sign up first.");
        await auth.signOut();
      }
    } catch (error) {
      console.error("Error signing in:", error.message);
      alert("An error occurred while signing in. Please try again later.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        router.push("/home"); // Redirect to home if user exists
      } else {
        router.push("/sign-up"); // Redirect to sign-up if user doesn't exist
      }
    } catch (error) {
      console.error("Google Sign-In failed:", error.message);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-300 to-purple-500">
      <div className="flex max-w-5xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div
          className="w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: "url('/flowers.jpg')" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/trans_bg.png')" }}
          ></div>
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white p-6"></div>
        </div>

        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-black">
            Sign In
          </h2>
          {error && (
            <p className="p-3 bg-red-400 text-white text-center mb-4">
              {error}
            </p>
          )}
          <input
            type="text"
            placeholder="Enter your Email"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={SignInWithEmailAndPasswordCustom}
            className="w-full p-3 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Sign In
          </button>
          <button
            onClick={handleGoogleSignIn}
            className="w-full p-3 mb-4 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.9 0 7.1 1.3 9.5 3.5l7-7C35.9 2.5 30.3 0 24 0 14.6 0 6.6 5.4 2.5 13.3l8.2 6.4C13.1 13.1 18 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.2-2.5 5.9-5.2 7.7l8.2 6.4C44.6 38.6 46.5 31.8 46.5 24z"
              />
              <path
                fill="#FBBC05"
                d="M10.7 28.7c-1.1-3.2-1.1-6.7 0-9.9L2.5 13.3C-1.1 20.1-1.1 27.9 2.5 34.7l8.2-6z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-8.2-6.4c-2.3 1.5-5.2 2.4-8.3 2.4-6 0-11.1-4.1-12.9-9.7l-8.2 6.4C6.6 42.6 14.6 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Sign In with Google
          </button>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Forgot your password?{" "}
            <button className="text-blue-500 hover:underline">
              Reset Password
            </button>
          </p>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/sign-up" legacyBehavior>
              <a className="text-blue-500 hover:underline">Sign Up</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
