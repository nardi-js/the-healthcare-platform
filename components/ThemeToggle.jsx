"use client"; // Mark this component as a Client Component

import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa"; // Import icons for sun and moon

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load the theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
      document.body.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark", !isDarkMode);
    localStorage.setItem("theme", newTheme); // Save the theme to localStorage
  };

  return (
    <div className="flex items-center">
      <button
        onClick={toggleTheme}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 
          ${
            isDarkMode
              ? "bg-gray-800 text-yellow-400"
              : "bg-yellow-400 text-gray-800"
          }`}
      >
        {isDarkMode ? <FaSun /> : <FaMoon />}
      </button>
    </div>
  );
};

export default ThemeToggle;
