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
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center cursor-pointer p-3 border-none rounded-full bg-[var(--button-bg-color)] text-[var(--button-text-color)] transition-all duration-300 fixed bottom-5 left-5 shadow-md hover:bg-[var(--hover-bg-color)] hover:scale-105"
    >
      {isDarkMode ? (
        <FaSun className="mr-2 text-lg" />
      ) : (
        <FaMoon className="mr-2 text-lg" />
      )}
      <span className="text-lg font-medium">
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
};

export default ThemeToggle;