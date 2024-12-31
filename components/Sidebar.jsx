"use client"; // Mark this component as a Client Component

import React from "react";
import { FaHome, FaUser, FaQuestion } from "react-icons/fa"; // Importing icons from react-icons
import ThemeToggle from "./ThemeToggle"; // Import the ThemeToggle component
import "../public/styles/Sidebar.css"; // Correct the path to the CSS file
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="profile">
        <img src="/download.png" alt="Profile" className="profile-picture" />
        <span className="username">Username</span>
      </div>

      <Link href="home">
        <button className="sidebar-button">
          <FaHome className="sidebar-icon" /> Home
        </button>
      </Link>

      <Link href="/questions">
        <button className="sidebar-button">
          <FaQuestion className="sidebar-icon" /> Questions
        </button>
      </Link>
      <button className="sidebar-button">
        <FaUser className="sidebar-icon" /> Profile
      </button>
      <div className="mt-auto">
        <ThemeToggle /> {/* Render ThemeToggle at the bottom */}
      </div>
    </div>
  );
};

export default Sidebar;
