"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const checkUsernameExists = async (username) => {
    const docRef = doc(db, 'usernames', username);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  };

  const signUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (await checkUsernameExists(username)) {
      setError('Username already exists');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save the username to Firestore
      await setDoc(doc(db, 'usernames', username), { uid: user.uid });

      router.push('/profile'); // Redirect to profile page
    } catch (error) {
      setError(error.message);
    }
  };

  const signUpWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user already has a username
      const usernameDoc = await getDoc(doc(db, 'usernames', user.uid));
      if (!usernameDoc.exists()) {
        // Prompt the user to enter a username if they don't have one
        const newUsername = prompt('Please enter a username:');
        if (newUsername && !(await checkUsernameExists(newUsername))) {
          await setDoc(doc(db, 'usernames', newUsername), { uid: user.uid });
        } else {
          setError('Username already exists or invalid');
          return;
        }
      }

      router.push('/profile'); // Redirect to profile page
    } catch (error) {
      setError('Error during Google sign-in: ' + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-300 to-purple-500">
      <div className="flex max-w-5xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Container */}
        <div className="w-1/2 bg-cover bg-center relative" style={{ backgroundImage: "url('/flowers.jpg')" }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/trans_bg.png')" }}></div>
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white p-6">
          </div>
        </div>
        {/* Right Container */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-black">Sign Up</h2>
          {error && <p className="p-3 bg-red-400 text-white text-center mb-4">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
            onChange={(e) => setUsername(e.target.value)}
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            onClick={signUp}
            className="w-full p-3 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Sign Up
          </button>
          <button
            onClick={signUpWithGoogle}
            className="w-full p-3 mb-4 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.9 0 7.1 1.3 9.5 3.5l7-7C35.9 2.5 30.3 0 24 0 14.6 0 6.6 5.4 2.5 13.3l8.2 6.4C13.1 13.1 18 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.2-2.5 5.9-5.2 7.7l8.2 6.4C44.6 38.6 46.5 31.8 46.5 24z"/>
              <path fill="#FBBC05" d="M10.7 28.7c-1.1-3.2-1.1-6.7 0-9.9L2.5 13.3C-1.1 20.1-1.1 27.9 2.5 34.7l8.2-6z"/>
              <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-8.2-6.4c-2.3 1.5-5.2 2.4-8.3 2.4-6 0-11.1-4.1-12.9-9.7l-8.2 6.4C6.6 42.6 14.6 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Sign Up with Google
          </button>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/sign-in" legacyBehavior>
              <a className="text-blue-500 hover:underline">Sign In</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;