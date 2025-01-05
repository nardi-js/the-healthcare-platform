"use client"; // Mark this component as a client component

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/useAuth'; // Adjust the path if necessary

const Navbar = () => {
  const { user, signout } = useAuth(); // Get the current user and signout function from the custom hook
  //const  { user, signout }  = useAuth(); <= This is the original code, but it doesn't work

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" legacyBehavior>
          <a className="text-white text-lg font-bold">TheHealth</a>
        </Link>
        <div>
          {user ? (
            <button
              onClick={signout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link href="/sign-in" legacyBehavior>
                <a className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
                  Sign In
                </a>
              </Link>
              <Link href="/sign-up" legacyBehavior>
                <a className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Sign Up
                </a>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;