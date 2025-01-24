"use client";

import React, { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  onSnapshot,
  collection,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";

const VoteSystem = ({ postId, type = "posts" }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use real-time listener for vote counts and ensure fields exist
  useEffect(() => {
    if (!postId) return;

    const docRef = doc(db, type, postId);
    
    // Initialize vote counts if they don't exist
    const initializeVoteCounts = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.likes !== 'number' || typeof data.dislikes !== 'number') {
            await updateDoc(docRef, {
              likes: 0,
              dislikes: 0
            });
          }
        }
      } catch (error) {
        console.error("Error initializing vote counts:", error);
      }
    };

    initializeVoteCounts();

    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setLikes(typeof data.likes === "number" ? data.likes : 0);
          setDislikes(typeof data.dislikes === "number" ? data.dislikes : 0);
        }
      },
      (error) => {
        console.error("Error listening to vote counts:", error);
      }
    );

    return () => unsubscribe();
  }, [postId, type]);

  // Fetch user's vote
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!user?.uid || !postId) return;

      try {
        const voteRef = doc(db, type, postId, 'votes', user.uid);
        const voteDoc = await getDoc(voteRef);
        setUserVote(voteDoc.exists() ? voteDoc.data().type : null);
      } catch (error) {
        console.error("Error fetching user vote:", error);
      }
    };

    fetchUserVote();
  }, [user?.uid, postId, type]);

  const handleVote = async (voteType) => {
    if (!user?.uid) {
      toast.error("Please log in to vote");
      return;
    }

    if (!postId || loading) return;

    try {
      setLoading(true);
      const voteRef = doc(db, type, postId, 'votes', user.uid);
      const docRef = doc(db, type, postId);

      await runTransaction(db, async (transaction) => {
        const voteDoc = await transaction.get(voteRef);
        const mainDoc = await transaction.get(docRef);
        
        if (!mainDoc.exists()) {
          throw new Error("Document does not exist!");
        }

        const currentVote = voteDoc.exists() ? voteDoc.data().type : null;
        const currentData = mainDoc.data();
        const likes = typeof currentData.likes === 'number' ? currentData.likes : 0;
        const dislikes = typeof currentData.dislikes === 'number' ? currentData.dislikes : 0;

        if (currentVote === voteType) {
          // Remove vote
          transaction.delete(voteRef);
          transaction.update(docRef, {
            [voteType]: Math.max(0, voteType === 'likes' ? likes - 1 : dislikes - 1)
          });
        } else {
          // Add or change vote
          if (currentVote) {
            // Remove old vote count
            transaction.update(docRef, {
              [currentVote]: Math.max(0, currentVote === 'likes' ? likes - 1 : dislikes - 1)
            });
          }

          // Add new vote
          transaction.set(voteRef, {
            type: voteType,
            userId: user.uid,
            timestamp: serverTimestamp(),
          });

          transaction.update(docRef, {
            [voteType]: voteType === 'likes' ? likes + 1 : dislikes + 1
          });
        }
      });

      // Update local state after successful transaction
      const voteDoc = await getDoc(voteRef);
      setUserVote(voteDoc.exists() ? voteDoc.data().type : null);
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
        onClick={() => handleVote("likes")}
        disabled={loading}
        className={`flex items-center space-x-1 ${
          userVote === "likes"
            ? "text-purple-600 dark:text-purple-400"
            : "text-gray-500 dark:text-gray-400"
        } hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50`}
      >
        <FaThumbsUp className="w-4 h-4" />
        <span className="ml-1">{likes}</span>
      </button>
      <button
        onClick={() => handleVote("dislikes")}
        disabled={loading}
        className={`flex items-center space-x-1 ${
          userVote === "dislikes"
            ? "text-purple-600 dark:text-purple-400"
            : "text-gray-500 dark:text-gray-400"
        } hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50`}
      >
        <FaThumbsDown className="w-4 h-4" />
        <span className="ml-1">{dislikes}</span>
      </button>
    </div>
  );
};

export default VoteSystem;
