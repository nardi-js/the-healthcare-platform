"use client";

import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";

const VoteSystem = ({ postId, type = "posts" }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      if (!postId) return;

      try {
        const docRef = doc(db, type, postId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Ensure likes and dislikes are always arrays
          setLikes(Array.isArray(data.likes) ? data.likes : []);
          setDislikes(Array.isArray(data.dislikes) ? data.dislikes : []);
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    fetchVotes();
  }, [postId, type]);

  const handleVote = async (voteType) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    if (!postId || loading) return;

    try {
      setLoading(true);
      const docRef = doc(db, type, postId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        toast.error("Post not found");
        return;
      }

      const currentData = docSnap.data();
      const userLiked = Array.isArray(currentData.likes) && currentData.likes.includes(user.uid);
      const userDisliked = Array.isArray(currentData.dislikes) && currentData.dislikes.includes(user.uid);

      if (voteType === 'like') {
        if (userLiked) {
          // Remove like
          await updateDoc(docRef, {
            likes: arrayRemove(user.uid)
          });
          setLikes(prev => prev.filter(id => id !== user.uid));
        } else {
          // Add like and remove dislike if exists
          const updates = {
            likes: arrayUnion(user.uid)
          };
          if (userDisliked) {
            updates.dislikes = arrayRemove(user.uid);
          }
          await updateDoc(docRef, updates);
          setLikes(prev => [...prev, user.uid]);
          if (userDisliked) {
            setDislikes(prev => prev.filter(id => id !== user.uid));
          }
        }
      } else {
        if (userDisliked) {
          // Remove dislike
          await updateDoc(docRef, {
            dislikes: arrayRemove(user.uid)
          });
          setDislikes(prev => prev.filter(id => id !== user.uid));
        } else {
          // Add dislike and remove like if exists
          const updates = {
            dislikes: arrayUnion(user.uid)
          };
          if (userLiked) {
            updates.likes = arrayRemove(user.uid);
          }
          await updateDoc(docRef, updates);
          setDislikes(prev => [...prev, user.uid]);
          if (userLiked) {
            setLikes(prev => prev.filter(id => id !== user.uid));
          }
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
          user && likes.includes(user.uid)
            ? 'text-purple-600 dark:text-purple-400'
            : 'text-gray-500 dark:text-gray-400'
        } hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50`}
      >
        <FaThumbsUp className="w-4 h-4" />
        <span>{likes.length}</span>
      </button>
      <button
        onClick={() => handleVote('dislike')}
        disabled={loading}
        className={`flex items-center space-x-1 ${
          user && dislikes.includes(user.uid)
            ? 'text-purple-600 dark:text-purple-400'
            : 'text-gray-500 dark:text-gray-400'
        } hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50`}
      >
        <FaThumbsDown className="w-4 h-4" />
        <span>{dislikes.length}</span>
      </button>
    </div>
  );
};

export default VoteSystem;
