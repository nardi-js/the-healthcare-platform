"use client";

import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";

const VoteSystem = ({ postId, type = "posts" }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null); // 'like' or 'dislike' or null
  const [loading, setLoading] = useState(false);

  // Fetch post votes and user's vote
  useEffect(() => {
    const fetchVotes = async () => {
      if (!postId) return;

      try {
        // Get post/question data for vote counts
        const docRef = doc(db, type, postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLikes(docSnap.data().likes || 0);
          setDislikes(docSnap.data().dislikes || 0);
        }

        // Get user's vote if logged in
        if (user?.uid) {
          const voteRef = doc(db, `${type}_votes`, `${postId}_${user.uid}`);
          const voteDoc = await getDoc(voteRef);
          if (voteDoc.exists()) {
            setUserVote(voteDoc.data().type);
          } else {
            setUserVote(null);
          }
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    fetchVotes();
  }, [postId, user?.uid, type]);

  const handleVote = async (voteType) => {
    if (!user?.uid) {
      toast.error("Please log in to vote");
      return;
    }

    if (!postId || loading) return;

    try {
      setLoading(true);
      const voteRef = doc(db, `${type}_votes`, `${postId}_${user.uid}`);
      const docRef = doc(db, type, postId);

      const voteDoc = await getDoc(voteRef);
      const currentVote = voteDoc.exists() ? voteDoc.data().type : null;

      // If clicking the same vote type, remove the vote
      if (currentVote === voteType) {
        await deleteDoc(voteRef);
        await updateDoc(docRef, {
          [voteType === 'like' ? 'likes' : 'dislikes']: increment(-1)
        });
        setUserVote(null);
        if (voteType === 'like') {
          setLikes(prev => prev - 1);
        } else {
          setDislikes(prev => prev - 1);
        }
      } else {
        // If changing vote type or adding new vote
        const updates = {};
        
        // If user had a previous vote, remove it first
        if (currentVote) {
          updates[currentVote === 'like' ? 'likes' : 'dislikes'] = increment(-1);
          if (currentVote === 'like') {
            setLikes(prev => prev - 1);
          } else {
            setDislikes(prev => prev - 1);
          }
        }

        // Add the new vote
        updates[voteType === 'like' ? 'likes' : 'dislikes'] = increment(1);
        await updateDoc(docRef, updates);

        // Save the vote record
        await setDoc(voteRef, {
          type: voteType,
          userId: user.uid,
          itemId: postId,
          itemType: type,
          timestamp: serverTimestamp()
        });

        setUserVote(voteType);
        if (voteType === 'like') {
          setLikes(prev => prev + 1);
        } else {
          setDislikes(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error updating vote:", error);
      toast.error("Error updating vote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => handleVote('like')}
        disabled={loading}
        className={`flex items-center space-x-1 ${
          userVote === 'like'
            ? 'text-purple-600 dark:text-purple-400'
            : 'text-gray-500 dark:text-gray-400'
        } hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50`}
      >
        <FaThumbsUp className="w-4 h-4" />
        <span>{likes}</span>
      </button>
      <button
        onClick={() => handleVote('dislike')}
        disabled={loading}
        className={`flex items-center space-x-1 ${
          userVote === 'dislike'
            ? 'text-purple-600 dark:text-purple-400'
            : 'text-gray-500 dark:text-gray-400'
        } hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50`}
      >
        <FaThumbsDown className="w-4 h-4" />
        <span>{dislikes}</span>
      </button>
    </div>
  );
};

export default VoteSystem;
