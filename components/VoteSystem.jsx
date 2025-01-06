"use client";
import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useAuth } from "@/context/useAuth";

const VoteSystem = ({
  initialUpvotes = 0,
  initialDownvotes = 0,
  postId,
  questionId,
}) => {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);

  // Determine if this is for a post or question
  const itemId = postId || questionId;
  const itemType = postId ? "posts" : "questions";

  // Fetch user's existing vote on component mount
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!user?.uid || !itemId) return;

      try {
        const voteRef = doc(db, "votes", `${itemId}_${user.uid}`);
        const voteDoc = await getDoc(voteRef);
        
        if (voteDoc.exists()) {
          setUserVote(voteDoc.data().type);
        }
      } catch (error) {
        console.error("Error fetching user vote:", error);
      }
    };

    fetchUserVote();
  }, [user?.uid, itemId]);

  // Handle Vote
  const handleVote = async (voteType) => {
    if (!user?.uid) {
      toast.error("Please log in to vote.");
      return;
    }

    if (!itemId) {
      toast.error("Invalid item. Cannot vote at this time.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      const voteRef = doc(db, "votes", `${itemId}_${user.uid}`);
      const itemRef = doc(db, itemType, itemId);

      // Get current vote
      const voteDoc = await getDoc(voteRef);
      const currentVote = voteDoc.exists() ? voteDoc.data().type : null;

      // Update vote counts and user vote
      if (voteType === currentVote) {
        // Remove vote if clicking the same button
        await deleteDoc(voteRef);
        await updateDoc(itemRef, {
          [voteType]: upvotes - 1
        });
        setUserVote(null);
        if (voteType === "upvotes") {
          setUpvotes(prev => prev - 1);
        } else {
          setDownvotes(prev => prev - 1);
        }
      } else {
        // Add or change vote
        await setDoc(voteRef, {
          userId: user.uid,
          itemId,
          itemType,
          type: voteType,
          timestamp: new Date().toISOString()
        });

        // Update item vote counts
        const updates = {};
        if (currentVote) {
          updates[currentVote] = currentVote === "upvotes" ? upvotes - 1 : downvotes - 1;
        }
        updates[voteType] = voteType === "upvotes" ? upvotes + 1 : downvotes + 1;
        await updateDoc(itemRef, updates);

        // Update local state
        if (currentVote === "upvotes") {
          setUpvotes(prev => prev - 1);
        } else if (currentVote === "downvotes") {
          setDownvotes(prev => prev - 1);
        }

        if (voteType === "upvotes") {
          setUpvotes(prev => prev + 1);
        } else {
          setDownvotes(prev => prev + 1);
        }

        setUserVote(voteType);
      }

      toast.success("Vote recorded successfully!");
    } catch (error) {
      console.error("Vote submission failed", error);
      toast.error("Failed to submit vote. Please try again.");
      
      // Rollback changes on error
      if (voteType === "upvotes") {
        setUpvotes(prev => prev - 1);
      } else if (voteType === "downvotes") {
        setDownvotes(prev => prev - 1);
      }
      setUserVote(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vote-system flex flex-col items-start space-y-4">
      <div className="flex items-center space-x-4">
        {/* Upvote Button */}
        <button
          onClick={() => handleVote("upvotes")}
          disabled={loading || !itemId}
          className={`flex items-center ${
            userVote === "upvotes" ? "text-green-500" : "text-gray-500"
          } ${(loading || !itemId) ? "opacity-50 cursor-not-allowed" : "hover:text-green-600"}`}
          aria-label="Upvote"
        >
          <FaArrowUp className="w-5 h-5" />
          <span className="ml-2">{upvotes}</span>
        </button>

        {/* Downvote Button */}
        <button
          onClick={() => handleVote("downvotes")}
          disabled={loading || !itemId}
          className={`flex items-center ${
            userVote === "downvotes" ? "text-red-500" : "text-gray-500"
          } ${(loading || !itemId) ? "opacity-50 cursor-not-allowed" : "hover:text-red-600"}`}
          aria-label="Downvote"
        >
          <FaArrowDown className="w-5 h-5" />
          <span className="ml-2">{downvotes}</span>
        </button>
      </div>
    </div>
  );
};

export default VoteSystem;
