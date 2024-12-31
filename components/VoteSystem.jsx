"use client";
import React, { useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const VoteSystem = ({
  initialUpvotes = 0,
  initialDownvotes = 0,
  postId,
  userId,
}) => {
  // State Management
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(null);

  // Handle Vote
  const handleVote = async (voteType) => {
    if (!userId) {
      alert("Please log in to vote.");
      return;
    }

    try {
      // Update vote counts and user vote
      if (voteType === "upvotes") {
        if (userVote === "downvotes") {
          setDownvotes((prev) => prev - 1);
        }
        if (userVote !== "upvotes") {
          setUpvotes((prev) => prev + 1);
        }
        if (userVote === "upvotes") {
          setUpvotes((prev) => prev - 1);
          setUserVote(null);
          return;
        }
        setUserVote("upvotes");
      } else if (voteType === "downvotes") {
        if (userVote === "upvotes") {
          setUpvotes((prev) => prev - 1);
        }
        if (userVote !== "downvotes") {
          setDownvotes((prev) => prev + 1);
        }
        if (userVote === "downvotes") {
          setDownvotes((prev) => prev - 1);
          setUserVote(null);
          return;
        }
        setUserVote("downvotes");
      }

      // Placeholder for API Call to Persist Vote
      await saveVote(postId, userId, voteType);
    } catch (error) {
      console.error("Vote submission failed", error);
      // Rollback changes on error
      if (voteType === "upvotes") {
        setUpvotes((prev) => prev - 1);
      } else if (voteType === "downvotes") {
        setDownvotes((prev) => prev - 1);
      }
      setUserVote(null);
    }
  };

  return (
    <div className="vote-system flex flex-col items-start space-y-4">
      <div className="flex items-center space-x-4">
        {/* Upvote Button */}
        <button
          onClick={() => handleVote("upvotes")}
          className={`flex items-center ${
            userVote === "upvotes" ? "text-green-500" : "text-gray-500"
          }`}
          aria-label="Upvote"
        >
          <FaArrowUp />
          <span className="ml-2">{upvotes}</span>
        </button>

        {/* Downvote Button */}
        <button
          onClick={() => handleVote("downvotes")}
          className={`flex items-center ${
            userVote === "downvotes" ? "text-red-500" : "text-gray-500"
          }`}
          aria-label="Downvote"
        >
          <FaArrowDown />
          <span className="ml-2">{downvotes}</span>
        </button>
      </div>
    </div>
  );
};

// Placeholder for API Call Functions
const saveVote = async (postId, userId, voteType) => {
  console.log(`Saving ${voteType} for post ${postId} by user ${userId}`);
};

export default VoteSystem;
