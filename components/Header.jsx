"use client"; // Mark this component as a Client Component

import React from 'react';
import { FaUserCircle } from 'react-icons/fa'; // Importing an icon for the avatar

const Header = ({ question, setQuestion }) => {
  const handleAskClick = () => {
    console.log("Ask clicked");
  };

  const handleAnswerClick = () => {
    console.log("Answer clicked");
  };

  const handlePostClick = () => {
    console.log("Post clicked");
  };

  return (
    <header className="bg-gray-800 p-4 flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center mb-4 md:mb-0">
        <FaUserCircle className="text-white text-2</div>xl mr-2" />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="p-2 rounded-md border border-gray-300"
        />
      </div>
      <div className="flex space-x-4">
        <button
          onClick={handleAskClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Ask
        </button>
        <button
          onClick={handleAnswerClick}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Answer
        </button>
        <button
          onClick={handlePostClick}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Post
        </button>
      </div>
    </header>
  );
};

export default Header;