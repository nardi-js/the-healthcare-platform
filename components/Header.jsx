import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import AnswerModal from '@/components/AnswerModal';
import CreatePostModal from '@/components/CreatePostModal';
import AskQuestionModal from '@/components/AskQuestionModal';
import '../public/styles/Header.css';

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
    </header>
  );
};

export default Header;