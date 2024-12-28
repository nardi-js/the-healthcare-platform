"use client";
import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const VoteSystem = ({ 
  initialUpvotes = 0, 
  initialDownvotes = 0, 
  postId, 
  userId 
}) => {
  // State Management
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(null);

  // Vote Tracking
  const [votedUsers, setVotedUsers] = useState({
    upvotes: [],
    downvotes: []
  });

  // Reputation Scoring
  const [reputation, setReputation] = useState(0);

  // Vote Handler
  const handleVote = async (voteType) => {
    // Prevent anonymous voting
    if (!userId) {
      alert('Please log in to vote');
      return;
    }

    // Prevent multiple votes from same user
    if (votedUsers[voteType].includes(userId)) {
      return;
    }

    try {
      // Optimistic UI Update
      if (voteType === 'upvotes') {
        // Reverse previous vote if needed
        if (userVote === 'downvotes') {
          setDownvotes(prev => prev - 1);
          setVotedUsers(prev => ({
            ...prev,
            downvotes: prev.downvotes.filter(id => id !== userId)
          }));
        }

        setUpvotes(prev => prev + 1);
        setVotedUsers(prev => ({
          ...prev,
          upvotes: [...prev.upvotes, userId]
        }));
        setUserVote('upvotes');

        // Increase reputation for positive contribution
        setReputation(prev => prev + 2);
      } else {
        // Similar logic for downvotes
        if (userVote === 'upvotes') {
          setUpvotes(prev => prev - 1);
          setVotedUsers(prev => ({
            ...prev,
            upvotes: prev.upvotes.filter(id => id !== userId)
          }));
        }

        setDownvotes(prev => prev + 1);
        setVotedUsers(prev => ({
          ...prev,
          downvotes: [...prev.downvotes, userId]
        }));
        setUserVote('downvotes');

        // Decrease reputation for negative contribution
        setReputation(prev => Math.max(0, prev - 1));
      }

      // Actual API Call to Persist Vote
      await saveVote(postId, userId, voteType);
    } catch (error) {
      console.error('Vote submission failed', error);
      // Rollback UI changes
      handleVoteRollback();
    }
  };

  // Vote Rollback Mechanism
  const handleVoteRollback = () => {
    if (userVote === 'upvotes') {
      setUpvotes(prev => prev - 1);
      setVotedUsers(prev => ({
        ...prev,
        upvotes: prev.upvotes.filter(id => id !== userId)
      }));
    } else if (userVote === 'downvotes') {
      setDownvotes(prev => prev - 1);
      setVotedUsers(prev => ({
        ...prev,
        downvotes: prev.downvotes.filter(id => id !== userId)
      }));
    }
    setUserVote(null);
  };

  // Revoke Vote
  const revokeVote = async () => {
    if (!userId || !userVote) return;

    try {
      if (userVote === 'upvotes') {
        setUpvotes(prev => prev - 1);
        setVotedUsers(prev => ({
          ...prev,
          upvotes: prev.upvotes.filter(id => id !== userId)
        }));
        setReputation(prev => Math.max(0, prev - 2));
      } else {
        setDownvotes(prev => prev - 1);
        setVotedUsers(prev => ({
          ...prev,
          downvotes: prev.downvotes.filter(id => id !== userId)
        }));
        setReputation(prev => prev + 1);
      }

      // API Call to Remove Vote
      await removeVote(postId, userId);
      setUserVote(null);
    } catch (error) {
      console.error('Vote revocation failed', error);
    }
  };

  // Reputation Badge
  const getReputationBadge = () => {
    if (reputation < 10) return 'Newcomer';
    if (reputation < 50) return 'Contributor';
    if (reputation < 100) return 'Expert';
    return 'Legendary';
  };

  return (
    <div className="vote-system flex items-center space-x-4">
      {/* Upvote Button */}
      <button 
        onClick={() => handleVote('upvotes')}
        className={`flex items-center 
          ${userVote === 'upvotes' ? 'text-green-500' : 'text-gray-500'}
        `}
      >
        <FaArrowUp />
        <span className="ml-2">{upvotes}</span>
      </button>

      {/* Downvote Button */}
      <button 
        onClick={() => handleVote('downvotes')}
        className={`flex items-center 
          ${userVote === 'downvotes' ? 'text-red-500' : 'text-gray-500'}
        `}
      >
        <FaArrowDown />
        <span className="ml-2">{downvotes}</span>
      </button>

      {/* Revoke Vote Option */}
      {userVote && (
        <button 
          onClick={revokeVote}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Revoke Vote
        </button>
      )}

      {/* Reputation Display */}
      <div className="reputation-badge text-sm text-gray-600">
        Reputation: {reputation} ({getReputationBadge()})
      </div>
    </div>
  );
};

// API Interaction Functions (Placeholder - replace with actual implementation)
const saveVote = async (postId, userId, voteType) => {
  // Implement actual vote saving logic
  // This would typically involve a backend API call
  console.log(`Saving ${voteType} for post ${postId} by user ${userId}`);
};

const removeVote = async (postId, userId) => {
  // Implement vote removal logic
  console.log(`Removing vote for post ${postId} by user ${userId}`);
};

export default VoteSystem;