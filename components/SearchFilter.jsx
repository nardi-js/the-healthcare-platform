"use client";

import React, { useState, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchFilter = ({
  onSearch,
  placeholder = "Search...",
  debounceDelay = 300,
}) => {
  const [query, setQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Debounced Search Handler
  const handleSearch = useCallback(
    (searchTerm) => {
      if (debounceTimer) clearTimeout(debounceTimer);

      const timer = setTimeout(() => {
        if (onSearch) onSearch(searchTerm);
      }, debounceDelay);

      setDebounceTimer(timer);
    },
    [debounceTimer, onSearch, debounceDelay]
  );

  // Input Change Handler
  const handleInputChange = (e) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  // Reset Search
  const resetSearch = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <div className="search-filter bg-gray-100 rounded-lg p-4 shadow-md">
      <div className="flex items-center relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        {query && (
          <button
            onClick={resetSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchFilter);
