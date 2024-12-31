"use client";
import React, {useState} from 'react'
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
<<<<<<< Updated upstream
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
=======
import Link from 'next/link'
//import { UserAuth } from '@/src/AuthContext.js';
>>>>>>> Stashed changes

const SignIn = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')


  const signIn = async () => {

    try {
        await signInWithEmailAndPassword(auth, email, password);
    }
    catch (error) {
      console.log(error)
    }
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);
    } catch (error) {
      console.log(error);
    }
  };

  const resetPassword = async () => {
    if (!email) {
      console.log("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-lg bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-center text-white">Sign In</h2>
          <ThemeToggle />
        </div>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-right text-gray-600 dark:text-gray-400" >
          <button
            onClick={resetPassword}
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
        </p>
        <button
          onClick={signIn}
          className="w-full p-3 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Sign In
        </button>
        <button
          onClick={signInWithGoogle}
          className="w-full p-3 mb-4 bg-white-500 text-black rounded-lg hover:bg-red-600 flex items-center justify-center bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.9 0 7.1 1.3 9.5 3.5l7-7C35.9 2.5 30.3 0 24 0 14.6 0 6.6 5.4 2.5 13.3l8.2 6.4C13.1 13.1 18 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.2-2.5 5.9-5.2 7.7l8.2 6.4C44.6 38.6 46.5 31.8 46.5 24z"/>
            <path fill="#FBBC05" d="M10.7 28.7c-1.1-3.2-1.1-6.7 0-9.9L2.5 13.3C-1.1 20.1-1.1 27.9 2.5 34.7l8.2-6z"/>
            <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-8.2-6.4c-2.3 1.5-5.2 2.4-8.3 2.4-6 0-11.1-4.1-12.9-9.7l-8.2 6.4C6.6 42.6 14.6 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Sign In with Google
        </button>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/sign-up" legacyBehavior>
            <a className="text-blue-500 hover:underline">Sign Up</a>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn