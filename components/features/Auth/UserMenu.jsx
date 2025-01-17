"use client";

import { useState } from "react";
import Link from "next/link";
import { FaUserCircle, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "@/context/useAuth";

export default function UserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const { signout } = useAuth();

  const handleSignOut = async () => {
    try {
      await signout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
          {user.displayName?.[0] || user.email?.[0] || "U"}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.displayName || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>

          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center space-x-2">
              <FaUserCircle className="w-4 h-4" />
              <span>Profile</span>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <div className="flex items-center space-x-2">
              <FaSignOutAlt className="w-4 h-4" />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
