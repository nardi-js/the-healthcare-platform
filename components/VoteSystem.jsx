"use client";
import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useAuth } from "@/context/useAuth";

const VoteSystem = ({ itemId, itemType, initialUpvotes = 0, initialDownvotes = 0 }) => {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);

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

    if (!itemId || !itemType) {
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
        const updates = {};
        updates[voteType] = voteType === "upvotes" ? upvotes - 1 : downvotes - 1;
        await updateDoc(itemRef, updates);
        
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
          // Remove previous vote
          updates[currentVote] = currentVote === "upvotes" ? upvotes - 1 : downvotes - 1;
        }
        // Add new vote
        updates[voteType] = voteType === "upvotes" ? upvotes + 1 : downvotes + 1;
        
        await updateDoc(itemRef, updates);

        setUserVote(voteType);
        if (voteType === "upvotes") {
          setUpvotes(prev => prev + 1);
          if (currentVote === "downvotes") {
            setDownvotes(prev => prev - 1);
          }
        } else {
          setDownvotes(prev => prev + 1);
          if (currentVote === "upvotes") {
            setUpvotes(prev => prev - 1);
          }
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => handleVote("upvotes")}
        disabled={loading}
        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
          userVote === "upvotes"
            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <FaArrowUp className={userVote === "upvotes" ? "text-green-600 dark:text-green-400" : ""} />
        <span>{upvotes}</span>
      </button>
      
      <button
        onClick={() => handleVote("downvotes")}
        disabled={loading}
        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
          userVote === "downvotes"
            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <FaArrowDown className={userVote === "downvotes" ? "text-red-600 dark:text-red-400" : ""} />
        <span>{downvotes}</span>
      </button>
    </div>
  );
};

export default VoteSystem;
