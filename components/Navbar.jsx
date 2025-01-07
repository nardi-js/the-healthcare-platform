"use client";

import Link from "next/link";
import Image from "next/image";
import { FaBars, FaSearch } from "react-icons/fa";
import { useAuth } from "@/context/useAuth";
import { useSidebar } from "@/context/SidebarContext";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user } = useAuth();
  const { toggleSidebar } = useSidebar();

  const handleSearch = (e) => {
    e.preventDefault();
    // Add search functionality here
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            <FaBars className="w-5 h-5" />
          </button>
          
          <Link href="/home" className="flex items-center space-x-2">
            <Image
              src="/trans_bg.png"
              alt="TheHealth Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-semibold text-white">TheHealth</span>
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              href="/auth/signin"
              className="text-white hover:text-gray-200 font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}