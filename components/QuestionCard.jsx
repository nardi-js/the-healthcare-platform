// components/QuestionCard.jsx
"use client";

import React from 'react';
import VoteSystem from './VoteSystem';
import CommentSystem from './CommentSystem';
import { FaComment, FaTags,FaReply } from 'react-icons/fa';
import '../public/styles/QuestionCard.css';

const QuestionCard = ({ question, onAnswer  }) => {
  return (
    <div className="question-card">      {/* Question Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <img 
            src={question.author.avatar} 
            alt={question.author.name} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{question.author.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(question.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Question Stats */}
        <div className="flex items-center space-x-4 text-gray-600">

          <div className="flex items-center">
            <FaComment className="mr-2" />
            <span>{question.answers || 0}</span>
          </div>
        </div>
      </div>

      {/* Question Title and Details */}
      <h2 className="text-xl font-bold mb-2">{question.title}</h2>
      <p className="text-gray-700 mb-4">{question.details}</p>

      {/* Tags */}
      <div className="flex items-center mb-4">
        <FaTags className="mr-2 text-gray-500" />
        <div className="flex flex-wrap gap-2">
          {question.tags.map(tag => (
            <span 
              key={tag} 
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Interaction Systems */}
      <div className="post-interactions flex justify-between items-center border-t pt-4">
        <div className="flex items-center space-x-4">
        <VoteSystem 
          postId={question.id} 
          initialUpvotes={question.upvotes || 0}
          initialDownvotes={question.downvotes || 0}
        />
        <button 
          onClick={() => onAnswer(question)}
          className="
            flex items-center        
            text-white 
            px-4 py-2 
            rounded-full 
            hover:bg-blue-600 
            transition-colors
          "
        >
          <FaReply className="mr-2" />
          Answer
        </button>
        <div className="comments-section mt-4">
        </div>
        <CommentSystem className="comments-section mt-4"
          postId={question.id} 
          initialComments={question.comments || []}
        />      </div>
        
      </div>
    </div>
  );
};

export default QuestionCard;