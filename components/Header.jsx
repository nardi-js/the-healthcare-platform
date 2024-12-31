import React, { useState } from 'react';
<<<<<<< Updated upstream
import { FaUserCircle } from 'react-icons/fa';
import AnswerModal from '@/components/AnswerModal';
import CreatePostModal from '@/components/CreatePostModal';
import AskQuestionModal from '@/components/AskQuestionModal';
import '../public/styles/Header.css';
=======
import SearchFilter from '@/components/SearchFilter';
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  const handleAskClick = () => {
    setIsAskModalOpen(true);
  };

  const handleCloseAskModal = () => {
    setIsAskModalOpen(false);
  };

  const handleAnswerClick = (questionId) => {
    setCurrentQuestionId(questionId);
    setIsAnswerModalOpen(true);
  };

  const handleCloseAnswerModal = () => {
    setIsAnswerModalOpen(false);
    setCurrentQuestionId(null);
  };

  return (
    <header className="flex justify-between items-center p-4">
      <div className="flex items-center">
        <FaUserCircle className="text-3xl mr-4" />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
        />
      </div>
      <div className="flex space-x-4">
        <button onClick={handleAskClick} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Ask
        </button>
        <button onClick={handleAnswerClick} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          Answer
        </button>
        <button onClick={handlePostClick} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Post
        </button>
      </div>
      <CreatePostModal isOpen={isPostModalOpen} onClose={handleClosePostModal} />
      <AskQuestionModal isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
      <AnswerModal isOpen={isAnswerModalOpen} onClose={handleCloseAnswerModal} questionId={currentQuestionId} />
=======
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
>>>>>>> Stashed changes
    </header>
  );
};

export default Header;