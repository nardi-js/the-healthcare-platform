"use client"; // Mark this component as a Client Component

import React from "react";
import { FaHome, FaUser, FaQuestion } from "react-icons/fa"; // Importing icons from react-icons
import ThemeToggle from "./ThemeToggle"; // Import the ThemeToggle component
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="bg-[var(--bg-color)] text-[var(--text-color)] w-64 h-screen p-5 flex flex-col fixed transition-colors duration-300 shadow-md rounded-lg z-50">
      <div className="flex items-center mb-5">
        <img src="/download.png" alt="Profile" className="w-12 h-12 rounded-full mr-2" />
        <span className="text-lg font-bold text-[var(--text-color)] ml-2">Username</span>
      </div>

      <Link href="/home">
        <button className="w-full py-3 px-5 mb-3 flex items-center gap-3 bg-white bg-opacity-10 text-[var(--text-color)] rounded-lg transition-transform duration-300 hover:bg-opacity-20 hover:-translate-y-1">
          <FaHome className="text-xl" /> Home
        </button>
      </Link>

      <Link href="/questions">
        <button className="w-full py-3 px-5 mb-3 flex items-center gap-3 bg-white bg-opacity-10 text-[var(--text-color)] rounded-lg transition-transform duration-300 hover:bg-opacity-20 hover:-translate-y-1">
          <FaQuestion className="text-xl" /> Questions
        </button>
      </Link>

      <Link href="/profile">
        <button className="w-full py-3 px-5 mb-3 flex items-center gap-3 bg-white bg-opacity-10 text-[var(--text-color)] rounded-lg transition-transform duration-300 hover:bg-opacity-20 hover:-translate-y-1">
          <FaUser className="text-xl" /> Profile
        </button>
      </Link>

      <div className="mt-auto">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Sidebar;