import React, { useState } from 'react';
import SearchFilter from '@/components/SearchFilter';

const Header = ({ question, setQuestion }) => {
  // Initialize modal states to false
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  // Handlers for opening and closing modals
  const handlePostClick = () => {
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
  };

  return (
    <header className="bg-gray-500 text-[var(--text-color)] p-8 flex items-center justify-between shadow-md border-3 border-[var(--text-color)] rounded-[0px] font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between w-full">
        <SearchFilter 
          categories={categories} 
          onSearchChange={onSearchChange} 
          onFilterChange={onFilterChange} 
        />
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button onClick={handlePostClick} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Post</button>
          <button onClick={onAskClick} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Ask</button>
        </div>
      </div>
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg">
            <button onClick={handleClosePostModal} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Close</button>
            {/* Modal content here */}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;