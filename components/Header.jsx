// components/Header.jsx
"use client";

import React, { useState } from 'react';
import CreatePostModal from '@/components/CreatePostModal';
import AskQuestionModal from '@/components/AskQuestionModal';
import SearchFilter from '@/components/SearchFilter';

const Header = ({ 
  onSearchChange, 
  onFilterChange,
  onAskClick
}) => {
  // Modal states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  // Categories for search filter
  const categories = [
    'Medical Research', 
    'Patient Care', 
    'Healthcare Technology', 
    'Nutrition', 
    'Mental Health'
  ];

  // Modal handlers
  const handlePostClick = () => {
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
  };

  const handleAskClick = () => {
    setIsAskModalOpen(true);
  };

  const handleCloseAskModal = () => {
    setIsAskModalOpen(false);
  };

  // Search and Filter Handlers
  const handleSearch = (searchParams) => {
    // Propagate search to parent component or context
    if (onSearchChange) {
      onSearchChange(searchParams);
    }
  };

  const handleFilterChange = (filterParams) => {
    // Propagate filter changes to parent component or context
    if (onFilterChange) {
      onFilterChange(filterParams);
    }
  };

  return (
    <div className="header-container">
      {/* Search Filter Integration */}
      <div className="search-section mb-4">
        <SearchFilter 
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          categories={categories}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        {/* User Profile Section */}


        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button 
            onClick={onAskClick} 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Ask Question
          </button>

          <button 
            onClick={handlePostClick} 
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          >
            Create Post
          </button>
        </div>
      </div>

      {/* Modals */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={handleClosePostModal} 
      />
      <AskQuestionModal 
        isOpen={isAskModalOpen} 
        onClose={handleCloseAskModal} 
      />
    </div>
  );
};

export default Header;