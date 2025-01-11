"use client";

import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, increment, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { useAuth } from "@/context/useAuth";

const VoteSystem = ({ postId }) => {
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
        // Get post data for vote counts
        const postRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          setLikes(postDoc.data().likes || 0);
          setDislikes(postDoc.data().dislikes || 0);
        }

        // Get user's vote if logged in
        if (user?.uid) {
          const voteRef = doc(db, "votes", `${postId}_${user.uid}`);
          const voteDoc = await getDoc(voteRef);
          if (voteDoc.exists()) {
            setUserVote(voteDoc.data().type);
          }
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    fetchVotes();
  }, [postId, user?.uid]);

  const handleVote = async (voteType) => {
    if (!user?.uid) {
      toast.error("Please log in to vote");
      return;
    }

    if (!postId || loading) return;

    try {
      setLoading(true);
      const voteRef = doc(db, "votes", `${postId}_${user.uid}`);
      const postRef = doc(db, "posts", postId);

      const voteDoc = await getDoc(voteRef);
      const currentVote = voteDoc.exists() ? voteDoc.data().type : null;

      if (currentVote === voteType) {
        // Remove vote
        await deleteDoc(voteRef);
        await updateDoc(postRef, {
          [voteType + 's']: increment(-1)
        });
        setUserVote(null);
        if (voteType === 'like') {
          setLikes(prev => prev - 1);
        } else {
          setDislikes(prev => prev - 1);
        }
      } else {
        // Add or change vote
        await setDoc(voteRef, {
          userId: user.uid,
          postId,
          type: voteType,
          timestamp: serverTimestamp()
        });

        // If changing vote, decrement previous vote count
        if (currentVote) {
          await updateDoc(postRef, {
            [currentVote + 's']: increment(-1),
            [voteType + 's']: increment(1)
          });
          if (currentVote === 'like') {
            setLikes(prev => prev - 1);
          } else {
            setDislikes(prev => prev - 1);
          }
        } else {
          // Just add new vote
          await updateDoc(postRef, {
            [voteType + 's']: increment(1)
          });
        }

        setUserVote(voteType);
        if (voteType === 'like') {
          setLikes(prev => prev + 1);
        } else {
          setDislikes(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error handling vote:", error);
      toast.error("Failed to update vote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => handleVote('like')}
        disabled={loading}
        className={`flex items-center space-x-1 text-sm ${
          userVote === 'like'
            ? "text-green-600 dark:text-green-400"
            : "text-gray-600 dark:text-gray-400"
        } hover:text-green-600 dark:hover:text-green-400 transition-colors`}
      >
        <FaThumbsUp className={userVote === 'like' ? "text-green-600" : ""} />
        <span>{likes}</span>
      </button>

      <button
        onClick={() => handleVote('dislike')}
        disabled={loading}
        className={`flex items-center space-x-1 text-sm ${
          userVote === 'dislike'
            ? "text-red-600 dark:text-red-400"
            : "text-gray-600 dark:text-gray-400"
        } hover:text-red-600 dark:hover:text-red-400 transition-colors`}
      >
        <FaThumbsDown className={userVote === 'dislike' ? "text-red-600" : ""} />
        <span>{dislikes}</span>
      </button>
    </div>
  );
};

export default VoteSystem;
