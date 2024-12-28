import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import CreatePostModal from '@/components/CreatePostModal';
import AskQuestionModal from '@/components/AskQuestionModal';
//import '../public/styles/Header.css';

const Header = ({ question, setQuestion }) => {
  // Initialize modal states to false
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  // Handlers for opening and closing modals
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



  return (
    <header className="flex border-2 rounded-full justify-between items-center p-4">
      <div className="flex items-center">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className='w-96 p-2 rounded-full border-2 border-gray-300 focus:'
        />
      </div>
      <div className="flex space-x-4">
        <button onClick={handleAskClick} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Ask
        </button>

        <button onClick={handlePostClick} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Post
        </button>
      </div>
      <CreatePostModal isOpen={isPostModalOpen} onClose={handleClosePostModal} />
      <AskQuestionModal isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
    </header>
  );
};

export default Header;