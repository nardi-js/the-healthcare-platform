"use client"; // Mark as a client component

import React, { useState, useEffect } from 'react';
import { FaHome, FaQuestion, FaUser } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/sign-in');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-gray-400 text-[var(--text-color)] flex flex-col p-4 fixed top-0 left-0 h-full w-[250px] z-[1000]">
      <div className="flex flex-col items-center mb-8">
        <img src="/download.png" alt="Profile" className="w-20 h-20 rounded-full mb-2" />
        <span className="text-lg font-semibold">{user ? user.displayName : 'Username'}</span>
      </div>
      <button className="flex items-center w-full p-2 mb-2 text-left hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        <FaHome className="mr-2" /> Home
      </button>
      <button className="flex items-center w-full p-2 mb-2 text-left hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        <FaQuestion className="mr-2" /> Questions
      </button>
      <button className="flex items-center w-full p-2 mb-2 text-left hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
        <FaUser className="mr-2" /> Profile
      </button>
      <div className="mt-auto">
        {user ? (
          <button
            onClick={handleLogout}
            className="w-full p-3 mb-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <>
            <button
              onClick={() => router.push('/sign-in')}
              className="w-full p-3 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/sign-up')}
              className="w-full p-3 mb-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Sign Up
            </button>
          </>
        )}
        <ThemeToggle /> {/* Render ThemeToggle at the bottom */}
      </div>
    </div>
  );
};

export default Sidebar;