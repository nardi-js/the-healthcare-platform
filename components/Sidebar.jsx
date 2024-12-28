"use client"; // Mark this component as a Client Component

import React from 'react';
import { FaHome, FaUser , FaCog } from 'react-icons/fa'; // Importing icons from react-icons
import ThemeToggle from './ThemeToggle'; // Import the ThemeToggle component
import '../public/styles/Sidebar.css'; // Correct the path to the CSS file

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="profile">
        <img src="/path-to-profile-picture.jpg" alt="Profile" className="profile-picture" />
        <span className="username">Username</span>
      </div>
      <button className="sidebar-button">
        <FaHome className="sidebar-icon" /> Home
      </button>
      <button className="sidebar-button">
        <FaUser  className="sidebar-icon" /> Profile
      </button>
      <button className="sidebar-button">
        <FaCog className="sidebar-icon" /> Settings
      </button>
      <div className="mt-auto">
        <ThemeToggle /> {/* Render ThemeToggle at the bottom */}
      </div>
    </div>
  );
};

export default Sidebar;